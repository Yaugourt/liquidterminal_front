import type { AssetResolver, ResolvedAsset } from './assets';
import type { NonFundingLedgerUpdate, UserFill, UserTransaction } from './types';

/**
 * Turns an address's raw HyperCore history (explorer transactions, fills,
 * non-funding ledger) into one readable activity feed: what happened, on
 * which market, for how much, with whom, from the address's point of view.
 *
 * Action names follow Hyperliquid's own wire names (see the action inventory
 * of the protocol reference); each one gets a plain verb and a short detail.
 * A transaction that produced fills shows the fills (what executed), not the
 * order that caused them; ledger movements carry the counterparty, so they win
 * over the raw transfer action of the same hash.
 */

export type ActivityKind = 'trade' | 'order' | 'transfer' | 'bridge' | 'staking' | 'vault' | 'account' | 'evm' | 'system';
export type ActivityTone = 'up' | 'down' | 'neutral';

export interface Counterparty {
  address: string;
  /** Known system address or validator name, when there is one. */
  name?: string;
  role: 'to' | 'from' | 'validator' | 'vault' | 'agent' | 'builder' | 'sub-account';
}

export interface Activity {
  id: string;
  hash: string | null;
  time: number;
  kind: ActivityKind;
  /** Verb a reader understands: "Open long", "Send", "Set leverage". */
  label: string;
  tone: ActivityTone;
  asset?: ResolvedAsset | { label: string; market: 'token' };
  size?: number;
  price?: number;
  /** USD value (current mid for orders and TWAPs, flagged `estimated`). */
  usd?: number;
  estimated?: boolean;
  /** +1 money in for this address, -1 out, 0 neither (trades, settings). */
  flow: 1 | -1 | 0;
  counterparty?: Counterparty;
  /** Short qualifiers: "limit GTC", "reduce-only", "10x cross". */
  details: string[];
  pnl?: number;
  fee?: number;
  feeToken?: string;
  /** Hyperliquid's error text when the action was rejected. */
  failed?: string;
}

const SYSTEM: Record<string, string> = {
  '0xfefefefefefefefefefefefefefefefefefefefe': 'Assistance Fund',
  '0xffffffffffffffffffffffffffffffffffffffff': 'HIP-2 liquidity',
  '0x2222222222222222222222222222222222222222': 'HyperEVM (HYPE)',
  '0x5000000000000000000000000000000000000000': 'USDC interest address',
};

/** System addresses 0x20…00XX are the HyperEVM side of spot token XX. */
const isEvmBridge = (a: string) => /^0x2000000000000000000000000000000000000[0-9a-f]{3}$/i.test(a) || a.toLowerCase() === '0x2222222222222222222222222222222222222222';

function party(address: string, role: Counterparty['role'], assets?: AssetResolver): Counterparty {
  const a = address.toLowerCase();
  const name = SYSTEM[a] ?? (isEvmBridge(a) ? 'HyperEVM' : undefined) ?? (role === 'validator' ? assets?.validatorName(a) ?? undefined : undefined);
  return { address: a, name, role };
}

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const TIF: Record<string, string> = { Gtc: 'limit GTC', Alo: 'post-only', Ioc: 'IOC', FrontendMarket: 'market', LiquidationMarket: 'liquidation' };

/** "Open Long" → "Open long", "Long > Short" → "Flip to short". */
function fillLabel(dir: string): string {
  if (dir === 'Long > Short') return 'Flip to short';
  if (dir === 'Short > Long') return 'Flip to long';
  return dir.charAt(0) + dir.slice(1).toLowerCase();
}

const fillTone = (dir: string, side: string): ActivityTone => {
  const d = dir.toLowerCase();
  if (d.includes('short >') || d === 'buy' || d === 'open long' || d === 'close short') return 'up';
  if (d.includes('long >') || d === 'sell' || d === 'open short' || d === 'close long') return 'down';
  return side === 'B' ? 'up' : 'down';
};

// ── fills ───────────────────────────────────────────────────────────────────

export function decodeFills(fills: UserFill[], assets: AssetResolver): Activity[] {
  // One row per order: an order filled over many blocks has one fill per
  // transaction, which read as a wall of identical rows. Fills without an
  // order id (system fills) group by transaction.
  const groups = new Map<string, UserFill[]>();
  for (const f of fills) {
    const key = f.oid ? `oid:${f.oid}|${f.dir}` : `${f.hash}|${f.coin}|${f.dir}`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(f);
  }
  return [...groups.entries()].map(([key, list]) => {
    const first = list[0];
    const size = list.reduce((s, f) => s + num(f.sz), 0);
    const notional = list.reduce((s, f) => s + num(f.sz) * num(f.px), 0);
    const pnl = list.reduce((s, f) => s + num(f.closedPnl), 0);
    const fee = list.reduce((s, f) => s + num(f.fee), 0);
    const asset = assets.byCoin(first.coin);
    const details: string[] = [];
    if (list.length > 1) details.push(`${list.length} fills`);
    if (first.crossed === false) details.push('maker');
    if (/liquidat/i.test(first.dir)) details.push('liquidation');
    const last = list.reduce((m, f) => (f.time > m.time ? f : m), first);
    const span = last.time - Math.min(...list.map((f) => f.time));
    if (span >= 60_000) details.push(`over ${span >= 3_600_000 ? `${Math.round(span / 3_600_000)}h` : `${Math.round(span / 60_000)}m`}`);
    return {
      id: `fill:${key}`,
      hash: /^0x0+$/.test(last.hash) ? null : last.hash,
      time: last.time,
      kind: 'trade' as const,
      label: fillLabel(first.dir),
      tone: fillTone(first.dir, first.side),
      asset,
      size,
      price: size > 0 ? notional / size : num(first.px),
      usd: notional,
      // A trade swaps one asset for another: no money enters or leaves the account.
      flow: 0,
      details,
      pnl: pnl !== 0 ? pnl : undefined,
      fee: fee !== 0 ? fee : undefined,
      feeToken: first.feeToken,
    };
  });
}

// ── ledger ──────────────────────────────────────────────────────────────────

export function decodeLedger(updates: NonFundingLedgerUpdate[], address: string, assets: AssetResolver): Activity[] {
  const me = address.toLowerCase();
  return updates.map((u) => {
    const d = u.delta as Record<string, unknown> & { type: string };
    const base = { id: `ledger:${u.hash}:${d.type}:${u.time}`, hash: /^0x0+$/.test(u.hash) ? null : u.hash, time: u.time, details: [] as string[] };
    const usdc = num(d.usdc);
    const usdcAsset = { label: 'USDC', market: 'token' as const };

    switch (d.type) {
      case 'deposit':
        return { ...base, kind: 'bridge', label: 'Deposit', tone: 'up', asset: usdcAsset, size: usdc, usd: usdc, flow: 1, details: ['from Arbitrum'] };
      case 'withdraw':
        return { ...base, kind: 'bridge', label: 'Withdraw', tone: 'down', asset: usdcAsset, size: usdc, usd: usdc, flow: -1, details: ['to Arbitrum'], fee: num(d.fee) || undefined, feeToken: 'USDC' };
      case 'accountClassTransfer':
        return { ...base, kind: 'account', label: 'Move USDC', tone: 'neutral', asset: usdcAsset, size: usdc, usd: usdc, flow: 0, details: [d.toPerp ? 'spot to perp' : 'perp to spot'] };
      case 'internalTransfer':
      case 'subAccountTransfer': {
        const out = String(d.user ?? '').toLowerCase() === me;
        const other = String(out ? d.destination : d.user);
        const sub = d.type === 'subAccountTransfer';
        return {
          ...base,
          kind: 'transfer',
          label: out ? 'Send' : 'Receive',
          tone: out ? 'down' : 'up',
          asset: usdcAsset,
          size: usdc,
          usd: usdc,
          flow: out ? -1 : 1,
          counterparty: party(other, sub ? 'sub-account' : out ? 'to' : 'from', assets),
          details: sub ? ['sub-account'] : [],
          fee: out ? num(d.fee) || undefined : undefined,
          feeToken: 'USDC',
        };
      }
      case 'send':
      case 'spotTransfer': {
        const from = String(d.user ?? '').toLowerCase();
        const to = String(d.destination ?? '').toLowerCase();
        const tok = assets.token(String(d.token ?? 'USDC'));
        const amount = num(d.amount);
        const usd = num(d.usdcValue) || amount * tok.mid;
        const asset = { label: tok.label, market: 'token' as const };
        if (from === me && to === me) {
          const src = String(d.sourceDex ?? '') || 'perp';
          const dst = String(d.destinationDex ?? '') || 'perp';
          return { ...base, kind: 'account', label: `Move ${tok.label}`, tone: 'neutral', asset, size: amount, usd, flow: 0, details: [`${src} to ${dst}`] };
        }
        const out = from === me;
        const other = out ? to : from;
        const evm = isEvmBridge(other);
        return {
          ...base,
          kind: evm ? 'bridge' : 'transfer',
          label: evm ? (out ? 'To HyperEVM' : 'From HyperEVM') : out ? 'Send' : 'Receive',
          tone: out ? 'down' : 'up',
          asset,
          size: amount,
          usd,
          flow: out ? -1 : 1,
          counterparty: evm ? undefined : party(other, out ? 'to' : 'from', assets),
          fee: out ? num(d.fee) || undefined : undefined,
          feeToken: tok.label === 'USDC' ? 'USDC' : String(d.feeToken || 'USDC'),
        };
      }
      case 'vaultDeposit':
        return { ...base, kind: 'vault', label: 'Vault deposit', tone: 'down', asset: usdcAsset, size: usdc, usd: usdc, flow: -1, counterparty: party(String(d.vault), 'vault') };
      case 'vaultWithdraw': {
        const net = num(d.netWithdrawnUsd) || num(d.requestedUsd);
        const details: string[] = [];
        if (num(d.commission) > 0) details.push(`commission $${num(d.commission).toFixed(2)}`);
        return { ...base, kind: 'vault', label: 'Vault withdraw', tone: 'up', asset: usdcAsset, size: net, usd: net, flow: 1, counterparty: party(String(d.vault), 'vault'), details };
      }
      case 'vaultCreate':
        return { ...base, kind: 'vault', label: 'Create vault', tone: 'down', asset: usdcAsset, size: usdc, usd: usdc, flow: -1, counterparty: party(String(d.vault), 'vault'), fee: num(d.fee) || undefined, feeToken: 'USDC' };
      case 'vaultDistribution':
        return { ...base, kind: 'vault', label: 'Vault distribution', tone: 'up', asset: usdcAsset, size: usdc, usd: usdc, flow: 1, counterparty: d.vault ? party(String(d.vault), 'vault') : undefined };
      case 'vaultLeaderCommission':
        return { ...base, kind: 'vault', label: 'Leader commission', tone: 'up', asset: usdcAsset, size: usdc, usd: usdc, flow: 1 };
      case 'cStakingTransfer': {
        const amount = num(d.amount);
        const tok = assets.token(String(d.token ?? 'HYPE'));
        return {
          ...base,
          kind: 'staking',
          label: d.isDeposit ? 'Move to staking' : 'Move from staking',
          tone: 'neutral',
          asset: { label: tok.label, market: 'token' },
          size: amount,
          usd: amount * tok.mid,
          estimated: true,
          flow: 0,
          details: [d.isDeposit ? 'spot to staking' : 'staking to spot'],
        };
      }
      case 'rewardsClaim': {
        const amount = num(d.amount);
        const tok = assets.token(String(d.token ?? 'HYPE'));
        return { ...base, kind: 'staking', label: 'Claim rewards', tone: 'up', asset: { label: tok.label, market: 'token' }, size: amount, usd: amount * tok.mid, estimated: true, flow: 1 };
      }
      case 'liquidation': {
        const positions = (d.liquidatedPositions as { coin: string; szi: string }[] | undefined) ?? [];
        return {
          ...base,
          kind: 'trade',
          label: 'Liquidated',
          tone: 'down',
          usd: num(d.liquidatedNtlPos),
          flow: 0,
          details: [positions.map((p) => assets.byCoin(p.coin).label).join(', '), String(d.leverageType ?? '').toLowerCase()].filter(Boolean),
        };
      }
      case 'spotGenesis': {
        const tok = assets.token(String(d.token));
        return { ...base, kind: 'transfer', label: 'Genesis allocation', tone: 'up', asset: { label: tok.label, market: 'token' }, size: num(d.amount), usd: num(d.amount) * tok.mid, estimated: true, flow: 1 };
      }
      case 'borrowLend': {
        const tok = assets.token(String(d.token));
        const op = String(d.operation ?? '');
        const out = op === 'supply' || op === 'repay';
        return { ...base, kind: 'account', label: op ? op.charAt(0).toUpperCase() + op.slice(1) : 'Lend / borrow', tone: out ? 'down' : 'up', asset: { label: tok.label, market: 'token' }, size: num(d.amount), usd: num(d.amount) * tok.mid, estimated: tok.label !== 'USDC', flow: 0 };
      }
      default:
        return { ...base, kind: 'account', label: humanize(d.type), tone: 'neutral', flow: 0, size: usdc || num(d.amount) || undefined };
    }
  }) as Activity[];
}

// ── raw actions ─────────────────────────────────────────────────────────────

/** camelCase or PascalCase wire name → "Vote eth deposit action". */
function humanize(type: string): string {
  const words = type.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ').trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export interface WireOrder {
  a: number;
  b: boolean;
  p: string;
  s: string;
  r?: boolean;
  t?: { limit?: { tif?: string }; trigger?: { isMarket?: boolean; triggerPx?: string; tpsl?: 'tp' | 'sl' } };
}

/** Old transactions wrote orders as compact arrays: [a, b, p, s, r, {limit:[tif]}, cloid]. */
export function normalizeAction(action: unknown): Record<string, unknown> & { type: string } {
  if (Array.isArray(action)) {
    const [type, payload, grouping] = action as [string, unknown[], string];
    if (type === 'order' && Array.isArray(payload)) {
      const orders = payload.map((o) => {
        const [a, b, p, s, r, t] = o as [number, boolean, string, string, boolean, { limit?: [string] }];
        return { a, b, p, s, r, t: { limit: { tif: t?.limit?.[0] } } };
      });
      return { type: 'order', orders, grouping };
    }
    return { type: String(type) };
  }
  return (action ?? { type: 'unknown' }) as Record<string, unknown> & { type: string };
}

export function orderSummary(o: WireOrder, assets: AssetResolver) {
  const asset = assets.byId(o.a);
  const size = num(o.s);
  const price = num(o.p);
  const details: string[] = [];
  const trig = o.t?.trigger;
  if (trig) details.push(`${trig.tpsl === 'tp' ? 'take profit' : 'stop'} at ${num(trig.triggerPx).toLocaleString('en-US', { maximumSignificantDigits: 6 })}${trig.isMarket ? ', market' : ''}`);
  else if (o.t?.limit?.tif) details.push(TIF[o.t.limit.tif] ?? o.t.limit.tif);
  if (o.r) details.push('reduce-only');
  const side = o.b ? 'buy' : 'sell';
  const kindWord = trig ? (trig.tpsl === 'tp' ? 'Take profit' : 'Stop') : o.t?.limit?.tif === 'Ioc' || o.t?.limit?.tif === 'FrontendMarket' ? 'Market' : 'Limit';
  return { asset: asset ?? undefined, size, price, details, label: `${kindWord} ${side}`, tone: (o.b ? 'up' : 'down') as ActivityTone, usd: size * price };
}

/** Decodes one explorer transaction (an action signed by `tx.user`), seen from `address` when given. */
export function decodeAction(tx: UserTransaction, assets: AssetResolver, address?: string): Activity {
  const a = normalizeAction(tx.action);
  const me = (address ?? tx.user).toLowerCase();
  const base = {
    id: `tx:${tx.hash}`,
    hash: /^0x0+$/.test(tx.hash) ? null : tx.hash,
    time: tx.time,
    failed: tx.error ?? undefined,
    details: [] as string[],
    flow: 0 as const,
    tone: 'neutral' as ActivityTone,
  };
  const assetOf = (id: unknown) => (typeof id === 'number' ? assets.byId(id) ?? undefined : undefined);
  const lev = (n: unknown) => `${num(n)}x`;

  switch (a.type) {
    case 'order': {
      const orders = (a.orders as WireOrder[] | undefined) ?? [];
      const grouping = String(a.grouping ?? 'na');
      if (orders.length === 1) {
        const s = orderSummary(orders[0], assets);
        return { ...base, kind: 'order', label: s.label, tone: s.tone, asset: s.asset, size: s.size, price: s.price, usd: s.usd, details: s.details };
      }
      const coins = [...new Set(orders.map((o) => assets.byId(o.a)?.label ?? `#${o.a}`))];
      const tpsl = grouping !== 'na' || orders.some((o) => o.t?.trigger);
      const first = orders[0] ? orderSummary(orders[0], assets) : null;
      return {
        ...base,
        kind: 'order',
        label: tpsl ? 'Order with TP/SL' : `Place ${orders.length} orders`,
        tone: first?.tone ?? 'neutral',
        asset: coins.length === 1 ? first?.asset : undefined,
        size: tpsl ? first?.size : undefined,
        price: tpsl ? first?.price : undefined,
        usd: tpsl ? first?.usd : undefined,
        details: [coins.length > 1 ? coins.slice(0, 4).join(', ') + (coins.length > 4 ? '…' : '') : '', `${orders.length} orders`, ...(tpsl && first ? first.details : [])].filter(Boolean),
      };
    }
    case 'cancel':
    case 'cancelByCloid': {
      const list = ((a.cancels as { a?: number; asset?: number }[] | undefined) ?? []).map((c) => c.a ?? c.asset);
      const coins = [...new Set(list.map((id) => (typeof id === 'number' ? assets.byId(id)?.label ?? `#${id}` : '?')))];
      return { ...base, kind: 'order', label: list.length > 1 ? `Cancel ${list.length} orders` : 'Cancel order', asset: coins.length === 1 && typeof list[0] === 'number' ? assetOf(list[0]) : undefined, details: coins.length > 1 ? [coins.slice(0, 4).join(', ')] : [] };
    }
    case 'modify':
    case 'batchModify': {
      const mods = a.type === 'modify' ? [{ order: a.order as WireOrder }] : ((a.modifies as { order: WireOrder }[] | undefined) ?? []);
      const s = mods[0]?.order ? orderSummary(mods[0].order, assets) : null;
      return { ...base, kind: 'order', label: mods.length > 1 ? `Modify ${mods.length} orders` : 'Modify order', tone: s?.tone ?? 'neutral', asset: s?.asset, size: s?.size, price: s?.price, usd: s?.usd, details: s?.details ?? [] };
    }
    case 'scheduleCancel':
      return { ...base, kind: 'order', label: a.time ? 'Schedule cancel-all' : 'Clear scheduled cancel', details: a.time ? [new Date(num(a.time)).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'] : [] };
    case 'twapOrder': {
      const t = a.twap as { a: number; b: boolean; s: string; r: boolean; m: number; t: boolean };
      const asset = assets.byId(t.a) ?? undefined;
      const size = num(t.s);
      const h = Math.floor(t.m / 60);
      const m = t.m % 60;
      const details = [`over ${h ? `${h}h ` : ''}${m ? `${m}m` : ''}`.trim()];
      if (t.r) details.push('reduce-only');
      if (t.t) details.push('randomized');
      return { ...base, kind: 'order', label: t.b ? 'TWAP buy' : 'TWAP sell', tone: t.b ? 'up' : 'down', asset, size, usd: asset?.mid ? size * asset.mid : undefined, estimated: true, details };
    }
    case 'twapCancel':
      return { ...base, kind: 'order', label: 'Cancel TWAP', asset: assetOf(a.a), details: a.t ? [`TWAP #${a.t}`] : [] };
    case 'updateLeverage':
      return { ...base, kind: 'account', label: 'Set leverage', asset: assetOf(a.asset), details: [`${lev(a.leverage)} ${a.isCross ? 'cross' : 'isolated'}`] };
    case 'updateIsolatedMargin':
    case 'topUpIsolatedOnlyMargin': {
      const usd = num(a.ntli) / 1e6;
      return { ...base, kind: 'account', label: usd >= 0 ? 'Add isolated margin' : 'Remove isolated margin', asset: assetOf(a.asset), usd: Math.abs(usd) || undefined, details: [] };
    }
    case 'approveAgent':
      return { ...base, kind: 'account', label: 'Approve API wallet', counterparty: a.agentAddress ? party(String(a.agentAddress), 'agent') : undefined, details: a.agentName ? [String(a.agentName)] : [] };
    case 'connect':
      return { ...base, kind: 'account', label: 'Connect agent', counterparty: a.agentAddress ? party(String(a.agentAddress), 'agent') : undefined };
    case 'approveBuilderFee':
      return { ...base, kind: 'account', label: 'Approve builder fee', counterparty: a.builder ? party(String(a.builder), 'builder') : undefined, details: [`up to ${a.maxFeeRate}`] };
    case 'setReferrer':
      return { ...base, kind: 'account', label: 'Use referral code', details: [String(a.code ?? '')] };
    case 'registerReferrer':
      return { ...base, kind: 'account', label: 'Create referral code', details: [String(a.code ?? '')] };
    case 'setDisplayName':
      return { ...base, kind: 'account', label: 'Set display name', details: [String(a.displayName ?? '')] };
    case 'createSubAccount':
      return { ...base, kind: 'account', label: 'Create sub-account', details: a.name ? [String(a.name)] : [] };
    case 'userSetAbstraction':
    case 'agentSetAbstraction':
    case 'agentEnableDexAbstraction':
    case 'userDexAbstraction':
      return { ...base, kind: 'account', label: 'Account mode', details: [a.abstraction === 'u' ? 'unified account' : 'dex abstraction'] };
    case 'evmUserModify':
      return { ...base, kind: 'evm', label: 'HyperEVM setting', details: [a.usingBigBlocks ? 'big blocks on' : 'big blocks off'] };
    case 'usdSend':
    case 'spotSend':
    case 'sendAsset':
    case 'withdraw3':
    case 'usdClassTransfer':
    case 'sendToEvmWithData': {
      const tok = assets.token(String(a.token ?? 'USDC'));
      const amount = num(a.amount);
      const dest = String(a.destination ?? a.destinationRecipient ?? '').toLowerCase();
      const asset = { label: tok.label, market: 'token' as const };
      if (a.type === 'withdraw3') return { ...base, kind: 'bridge', label: 'Withdraw', tone: 'down', asset, size: amount, usd: amount, flow: -1, details: ['to Arbitrum'] };
      if (a.type === 'usdClassTransfer') return { ...base, kind: 'account', label: 'Move USDC', asset, size: amount, usd: amount, details: [a.toPerp ? 'spot to perp' : 'perp to spot'] };
      if (a.type === 'sendToEvmWithData') return { ...base, kind: 'bridge', label: 'To EVM chain', tone: 'down', asset, size: amount, usd: amount * tok.mid, flow: -1, counterparty: dest ? party(dest, 'to') : undefined, details: [`chain ${a.destinationChainId}`] };
      const self = dest === me;
      const out = !self;
      return {
        ...base,
        kind: isEvmBridge(dest) ? 'bridge' : 'transfer',
        label: isEvmBridge(dest) ? 'To HyperEVM' : self ? `Move ${tok.label}` : 'Send',
        tone: out ? 'down' : 'neutral',
        asset,
        size: amount,
        usd: amount * tok.mid,
        flow: out ? -1 : 0,
        counterparty: !self && !isEvmBridge(dest) ? party(dest, 'to', assets) : undefined,
        details: self && a.sourceDex !== undefined ? [`${String(a.sourceDex) || 'perp'} to ${String(a.destinationDex) || 'perp'}`] : [],
      };
    }
    case 'vaultTransfer': {
      const usd = num(a.usd) / 1e6;
      return { ...base, kind: 'vault', label: a.isDeposit ? 'Vault deposit' : 'Vault withdraw', tone: a.isDeposit ? 'down' : 'up', asset: { label: 'USDC', market: 'token' }, size: usd, usd, flow: a.isDeposit ? -1 : 1, counterparty: party(String(a.vaultAddress), 'vault') };
    }
    case 'tokenDelegate': {
      const hype = num(a.wei) / 1e8;
      const tok = assets.token('HYPE');
      return { ...base, kind: 'staking', label: a.isUndelegate ? 'Undelegate' : 'Delegate', tone: 'neutral', asset: { label: 'HYPE', market: 'token' }, size: hype, usd: hype * tok.mid, estimated: true, counterparty: party(String(a.validator), 'validator', assets) };
    }
    case 'cDeposit':
    case 'cWithdraw': {
      const hype = num(a.wei) / 1e8;
      const tok = assets.token('HYPE');
      return { ...base, kind: 'staking', label: a.type === 'cDeposit' ? 'Move to staking' : 'Move from staking', asset: { label: 'HYPE', market: 'token' }, size: hype, usd: hype * tok.mid, estimated: true, details: [a.type === 'cDeposit' ? 'spot to staking' : 'staking to spot'] };
    }
    case 'claimRewards':
      return { ...base, kind: 'staking', label: 'Claim rewards' };
    case 'linkStakingUser':
      return { ...base, kind: 'staking', label: 'Link staking account', counterparty: a.user ? party(String(a.user), 'to') : undefined, details: [a.isFinalize ? 'finalize' : 'request'] };
    case 'borrowLend':
      return { ...base, kind: 'account', label: humanize(String(a.operation ?? 'borrowLend')), asset: typeof a.token === 'number' ? { label: assets.byId(10_000 + a.token)?.label ?? `token ${a.token}`, market: 'token' } : undefined, size: a.amount ? num(a.amount) : undefined };
    case 'evmRawTx':
      return { ...base, kind: 'evm', label: 'HyperEVM transaction' };
    case 'multiSig': {
      const inner = (a.payload as { action?: unknown } | undefined)?.action;
      if (inner) {
        const d = decodeAction({ ...tx, action: inner as UserTransaction['action'] }, assets, address);
        return { ...d, details: ['multisig', ...d.details] };
      }
      return { ...base, kind: 'account', label: 'Multisig action' };
    }
    case 'convertToMultiSigUser':
      return { ...base, kind: 'account', label: 'Convert to multisig' };
    case 'userOutcome':
      return { ...base, kind: 'trade', label: 'Outcome position', details: Object.keys(a).filter((k) => k !== 'type').map(humanize) };
    case 'spotDeploy':
    case 'perpDeploy':
      return { ...base, kind: 'system', label: a.type === 'spotDeploy' ? 'Spot deploy' : 'Perp deploy', details: Object.keys(a).filter((k) => k !== 'type').slice(0, 1).map(humanize) };
    case 'noop':
      return { ...base, kind: 'system', label: 'No-op' };
    case 'SetGlobalAction':
      return { ...base, kind: 'system', label: 'Oracle update' };
    case 'VoteEthDepositAction':
    case 'ValidatorSignWithdrawalAction':
    case 'VoteEthFinalizedWithdrawalAction':
    case 'voteAppHash':
    case 'voteAbciDigest':
    case 'voteL1Hash':
    case 'validatorL1Vote':
    case 'validatorL1Stream':
      return { ...base, kind: 'system', label: 'Validator vote', details: [humanize(a.type.replace(/Action$/, ''))] };
    case 'withdraw':
    case 'withdraw2':
      return { ...base, kind: 'bridge', label: 'Withdraw', tone: 'down', asset: { label: 'USDC', market: 'token' }, flow: -1, details: ['to Arbitrum'] };
    default:
      return { ...base, kind: 'system', label: humanize(a.type) };
  }
}

// ── address feed ────────────────────────────────────────────────────────────

/** Ledger types that duplicate the raw transfer action of the same hash. */
const TRANSFER_ACTIONS = new Set(['usdSend', 'spotSend', 'sendAsset', 'withdraw3', 'usdClassTransfer', 'vaultTransfer', 'cDeposit', 'cWithdraw', 'subAccountTransfer']);

export function decodeAddressActivity(
  address: string,
  txs: UserTransaction[],
  fills: UserFill[],
  ledger: NonFundingLedgerUpdate[],
  assets: AssetResolver
): Activity[] {
  const fillActs = decodeFills(fills, assets);
  const ledgerActs = decodeLedger(ledger, address, assets);
  const filled = new Set(fills.map((f) => f.hash));
  const fillsFrom = fills.length ? Math.min(...fills.map((f) => f.time)) : Infinity;
  const ledgered = new Set(ledger.map((l) => l.hash));

  const actionActs = txs
    .filter((tx) => {
      const type = normalizeAction(tx.action).type;
      // An order that executed is shown as its fills; a transfer as its ledger entry.
      if (type === 'order' && filled.has(tx.hash) && !tx.error) return false;
      if (TRANSFER_ACTIONS.has(type) && ledgered.has(tx.hash) && !tx.error) return false;
      return true;
    })
    .map((tx) => {
      const act = decodeAction(tx, assets, address);
      // A market (IOC) order with no fill under its hash did not execute.
      // Only inside the fills window: the API returns the last 2,000 fills.
      const tif = act.details.find((d) => d === 'market' || d === 'IOC');
      if (act.kind === 'order' && tif && !act.failed && tx.time >= fillsFrom && !filled.has(tx.hash)) act.details.push('not filled');
      return act;
    });

  return [...fillActs, ...ledgerActs, ...actionActs].sort((x, y) => y.time - x.time);
}
