# HIP-4 Research — Complete Reference for Liquid Terminal

> Last updated: March 26, 2026
> Authors: Yaugourt (Liquid Terminal), androolloyd (HypurrFi), ExoMonk, EnigmaValidator
> Status: Active research — testnet only, nothing is final

---

## TL;DR — Where we stand

HIP-4 is Hyperliquid's prediction market system. After 3 days of reverse-engineering from raw bytecode and testnet data (no official documentation exists), here is what we know:

**Confirmed on-chain:**

- The official HIP-4 system is **100% HyperCore L1**. No EVM involved.
- Full lifecycle mapped: `registerTokensAndStandaloneOutcome` → CLOB trading → `VoteGlobalAction` settlement.
- Native pair minting: YES + NO = 1.00 always. Placing a BUY on YES auto-creates a mirrored ASK on NO.
- Settlement is instant and automatic — L1 reads the price, closes all positions in one block. No Merkle proof, no claim, no UMA oracle, no dispute window.
- Outcome tokens trade as `#`-prefixed coins on the standard CLOB (e.g. `#22430`).
- Multi-outcome markets (food market) work as independent YES/NO pairs per outcome. Isolated orderbooks.
- Strike price (targetPrice) is set to the markPx at creation time — markets open at ~50/50 by design.
- Trade fills live exclusively in the S3 dataset `node_fills_by_block`. The public API `recentTrades` returns only the last 10 fills with no pagination.

**Correction:**

- We initially assumed two EVM parimutuel contracts (V1 and V2) were deployed by the Hyperliquid team. After tracing the funding chain, the deployer wallet appears to be funded by Block Theory Cap (early HL user/fund), not the HL team. **This is still a theory, not confirmed.** Any contract on HyperEVM gets flagged as "genesis deployment" which misled us.
- The EVM contracts may be an independent project piggybacking on HIP-4 market data. The mystery remains open.

**Open questions:**

- How does collateral get redistributed across multiple outcomes at settlement?
- Are the EVM contracts from the team (under a separate identity) or truly third-party?
- How does mainnet transition work? (Validators settling? Permissionless creation?)
- Will HIP-3 data feeds be used for subjective market resolution (food, races)?

---

## Architecture Overview

### HyperCore L1 (The Real System)

HyperLiquid runs on a single consensus: HyperBFT (fork Cosmos/ABCI), block time ~0.07s, single-slot finality.

HyperEVM is NOT a separate chain. It's embedded inside HyperCore. The EVM can read Core state via precompiles (0x0800+) and write to Core via CoreWriter (0x3333...3333). But HIP-4 prediction markets do NOT use the EVM at all.

```
┌─────────────────────────────────────────────┐
│              HyperBFT Consensus             │
│           (L1 blocks every 0.07s)           │
├─────────────────────────────────────────────┤
│                 HYPERCORE                    │
│   Order book · Perps · Settlement · State   │
│                                             │
│   HIP-4 Prediction Markets (100% native):   │
│   - registerTokensAndStandaloneOutcome      │
│   - CLOB pair minting (YES+NO=1.00)        │
│   - VoteGlobalAction (auto-settlement)      │
│                                             │
│   ┌───────────────────────────────────┐     │
│   │           HYPEREVM                │     │
│   │   (NOT used by official HIP-4)   │     │
│   │   Third-party parimutuel only    │     │
│   └───────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

### HIP-4 Lifecycle (L1 Native)

```
[1] CREATE
    registerTokensAndStandaloneOutcome
    → mints YES/NO token pair
    → strike = markPx at creation
    → markets open ~50/50

[2] TRADE
    Standard CLOB order book in USDH
    → pair minting: BUY YES @ 0.40 = mirror ASK NO @ 0.60
    → 250 tokens each side, 250 USDH total collateral
    → trade anytime until expiry

[3] SETTLE
    VoteGlobalAction
    → system wallet reads price at expiry
    → settles all positions in ONE block
    → winner gets 1.00/token, loser gets 0
    → paid instantly to balance
```

---

## Pair Minting Mechanics

When you place a buy order on a prediction market, the system doesn't look for a seller. It creates one.

**Example:** Buy YES at 0.40 for 100 USDH.

1. Protocol mirrors a NO order at 0.60 (YES + NO = 1.00)
2. 100 USDH / 0.40 = 250 tokens
3. Mirror: 250 tokens × 0.60 = 150 USDH on NO side
4. Someone takes NO → pair minted: 1 YES + 1 NO
5. Total collateral: 100 + 150 = 250 USDH = 250 tokens × 1.00
6. Settlement: winner takes 1.00/token, loser gets 0

**Observed on-chain:**
```
#22430 (Yes):  ASK 0.5 × 835  (1 order)
#22431 (No):   BID 0.5 × 835  (1 order)
```
Same order, mirrored. Same size (835), same price (0.5). This is the native pair minting mechanism.

**Minimum order formula:**
```
size × min(markPrice, 1-markPrice) ≥ $10 USDH
```
The real minimum depends on limit price vs mark price:
```
min_cost = 10 × limitPrice / min(markPrice, 1-markPrice)
```

---

## API Reference

### Retrieve outcome metadata (testnet only)

```
POST https://api.hyperliquid-testnet.xyz/info
Content-Type: application/json

{"type": "outcomeMeta"}
```

**Response:**
```json
{
  "outcomes": [
    {
      "outcome": 9,
      "name": "Who will win the HL 100 meter dash?",
      "description": "This race is yet to be scheduled.",
      "sideSpecs": [
        { "name": "Hypurr" },
        { "name": "Usain Bolt" }
      ]
    },
    {
      "outcome": 2243,
      "name": "Recurring",
      "description": "class:priceBinary|underlying:BTC|expiry:20260327-0300|targetPrice:71169|period:1d",
      "sideSpecs": [
        { "name": "Yes" },
        { "name": "No" }
      ]
    }
  ],
  "questions": [
    {
      "question": 1,
      "name": "What will Hypurr eat the most of in Feb 2026?",
      "description": "Hypurr has committed to weighing and recording daily food intake in a food journal.",
      "fallbackOutcome": 13,
      "namedOutcomes": [10, 11, 12],
      "settledNamedOutcomes": []
    }
  ]
}
```

**Outcome types:**

| Type | Example | Description |
|------|---------|-------------|
| Custom | outcome 9 | Open question, N named outcomes (Hypurr vs Usain Bolt) |
| priceBinary | outcome 2243 | Price above/below threshold at expiry. YES/NO only |
| Recurring | outcome 2300 | Auto-recreated priceBinary with periods: 15m, 1h, 1d |

**Multi-outcome (questions):** A question groups multiple outcomes. Example: "What will Hypurr eat?" groups outcomes 10 (Akami), 11 (Canned Tuna), 12 (Otoro), 13 (Other/fallback). Each outcome is an independent YES/NO pair on the CLOB.

### Coin ID mapping

Outcome tokens trade as `#`-prefixed coins. The coin ID adds a trailing zero to the outcome ID for the YES side, and +1 for the NO side:

```
Outcome ID 2243 → YES coin: #22430, NO coin: #22431
Outcome ID 2300 → YES coin: #23000, NO coin: #23001
Outcome ID 10   → YES coin: #100,   NO coin: #101
```

**Formula:** `YES coin = "#" + (outcomeId * 10)`, `NO coin = "#" + (outcomeId * 10 + 1)`

**Important for candleSnapshot:** Use the full coin ID with the trailing zero, NOT the raw outcome ID.

```json
{
  "type": "candleSnapshot",
  "req": {
    "coin": "#22430",
    "endTime": 1774569600000,
    "interval": "1d",
    "startTime": 1746057600000
  }
}
```

### WebSocket feeds

Connect to: `wss://api.hyperliquid-testnet.xyz/ws`

**activeSpotAssetCtx** — real-time market data per coin:
```json
{
  "channel": "activeSpotAssetCtx",
  "data": {
    "coin": "#22430",
    "ctx": {
      "prevDayPx": "0.5",
      "dayNtlVlm": "976.651",
      "markPx": "0.515",
      "midPx": "0.515",
      "circulatingSupply": "1936.0",
      "dayBaseVlm": "1936.0",
      "totalSupply": "184467440737095.53125"
    }
  }
}
```

Note: `markPx` = implied probability. YES at 0.515 = market thinks 51.5% chance.

Both sides of a pair stream independently:
- `#22430` (YES): markPx 0.515
- `#22431` (NO): markPx 0.485
- Sum: 0.515 + 0.485 = 1.00 ✓

**l2Book** — order book depth per coin:
```json
{
  "channel": "l2Book",
  "data": {
    "coin": "#22430",
    "levels": [
      [
        {"px": "0.5", "sz": "2000.0", "n": 2},
        {"px": "0.4", "sz": "50.0", "n": 1}
      ],
      [
        {"px": "0.53", "sz": "2048.0", "n": 1},
        {"px": "0.53055", "sz": "136.0", "n": 1},
        {"px": "0.56111", "sz": "887.0", "n": 1},
        {"px": "0.62222", "sz": "628.0", "n": 1},
        {"px": "0.74445", "sz": "463.0", "n": 1},
        {"px": "0.9889", "sz": "20000.0", "n": 1}
      ]
    ],
    "time": 1774545317611
  }
}
```

`levels[0]` = bids (descending), `levels[1]` = asks (ascending). Each level has `px` (price), `sz` (size in tokens), `n` (number of orders).

Each side of a pair has its own independent orderbook. Mirrored orders appear automatically via the pair minting mechanism.

### L1 Action Types

**Market creation:**
```json
{
  "type": "registerTokensAndStandaloneOutcome",
  "quoteToken": 1452,
  "name": "Recurring",
  "description": "class:priceBinary|underlying:BTC|expiry:20260327-0300|targetPrice:71169|period:1d"
}
```

**Settlement:**
```json
{
  "type": "VoteGlobalAction",
  "settleOutcome": 2221,
  "settleFraction": 0,
  "details": "price:97.194"
}
```
- `settleFraction: 0` = YES lost (price was below target)
- `settleFraction: 1` = YES won (price was above target)

**Block validation (consensus):**
```json
{
  "type": "voteAppHash",
  "height": 529304000,
  "appHash": "0x87acc...",
  "signature": {"r": "...", "s": "...", "v": 28}
}
```

### System wallets (testnet)

| Wallet | Role |
|--------|------|
| `0xe92d5afedaf9eab98a70b7b0118b7187c1292c5c` | Oracle price feeder + outcome settler + block validator |
| `0xc25c4a1e3872f4d601d70b5db85604f7039ece56` | Outcome settler (rotating duty) |

These wallets handle: oracle/mark price updates for all assets, VoteGlobalAction settlement for prediction markets, and voteAppHash for block validation. All centralized on testnet — expected for testing. Mainnet distribution TBD.

### S3 Data Access

Trade fills are S3-exclusive (not available via RPC):
```bash
# Mainnet EVM blocks
aws s3 ls s3://hl-mainnet-evm-blocks/ --request-payer requester

# Testnet EVM blocks
aws s3 ls s3://hl-testnet-evm-blocks/ --request-payer requester
```

Files are MessagePack + LZ4 compressed. Indexed by EVM block number:
`s3://hl-mainnet-evm-blocks/0/6000/6123.rmp.lz4`

For HyperCore trade fills: `node_fills_by_block` dataset in S3. The public API `recentTrades` only returns the last 10 fills with no pagination.

Reference: [hyperliquid-python-sdk EVM block indexer](https://github.com/hyperliquid-dex/hyperliquid-python-sdk/blob/master/examples/evm_block_indexer.py)

---

## EVM Parimutuel Contracts (Third-Party / Unconfirmed Origin)

> **IMPORTANT:** These contracts were initially attributed to the Hyperliquid team. After tracing the funding chain, the deployer appears to be funded by Block Theory Cap, an early HL user/fund. This is a theory, not confirmed. The contracts may be an independent project. Label accordingly on the dashboard.

### V1 Contract

**Address:** `0x4fd772e5708da2a7f097f51b3127e515a72744bd`
**Chain:** 998 (HyperEVM Testnet)
**Owner:** `0xe21c78037329d06fe0d6fefc4221aaa67cb0d135`
**Status:** ~160 contests created (IDs 590–751), all finalized. Inactive since ~March 21.

**Functions (15):**

| Selector | Function | Access |
|----------|----------|--------|
| `0x00aeef8a` | `deposit(uint256,uint256)` | public payable |
| `0x2a658bdf` | `getContestPool(uint256)` | public view |
| `0x3a8ef03b` | `finalizeContest(uint256)` | onlyOwner |
| `0x6dab6b23` | `createContest(uint256,uint256)` | onlyOwner |
| `0x71c5ecb1` | `getMerkleRoot(uint256)` | public view |
| `0x715018a6` | `renounceOwnership()` | always reverts |
| `0x8da5cb5b` | `owner()` | public view |
| `0x91d3b00c` | `platformFeeBps()` | public view (returns 90) |
| `0xa3d07f67` | `refund(uint256,uint256,address)` | onlyOwner |
| `0xb2447e34` | `withdrawPlatformFee(uint256,uint256)` | onlyOwner |
| `0xe50e64d5` | `sweepUnclaimed(uint256)` | onlyOwner |
| `0xf295f6e4` | `publishMerkleRoot(uint256,bytes32,uint256)` | onlyOwner |
| `0xf2fde38b` | `transferOwnership(address)` | onlyOwner |
| `0xf364c90c` | `contestExists(uint256,uint256)` | public view |
| unknown | `claim(uint256,uint256,bytes32[])` | public |

**Events:**

| Event | Topic 0 |
|-------|---------|
| `DepositReceived(uint256 indexed contestId, uint256 indexed sideId, address depositor, uint256 amount)` | `0xb3e6929bbc654f9c87cd601fc5a62d03406b85acbbb509c57e54ecf298eb8c41` |
| `Claimed(uint256 indexed contestId, uint256 indexed sideId, address claimer, uint256 amount)` | `0xb94bf7f9302edf52a596286915a69b4b0685574cffdedd0712e3c62f2550f0ba` |
| `ContestFinalized(uint256 indexed contestId)` | `0xfb508a26bf86702cd1b89b773ba1156faa667396f59d2104cb1a6b66674e7d69` |
| `MerkleRootPublished(uint256 indexed contestId, bytes32 root, uint256 rewardPool)` | emitted by `publishMerkleRoot` |

**Revert strings:**
- `Contest already exists` / `Contest does not exist` / `Contest already finalized` / `Contest not finalized`
- `Deposit deadline passed` / `Already deposited for this round` / `Entry fee must be > 0` / `Incorrect entry fee`
- `Fee amount must be > 0` / `Fee exceeds platform cut`
- `Invalid merkle proof` / `Invalid merkle root` / `Merkle root already published` / `Merkle root not published` / `Already claimed` / `No deposit found` / `Reward pool exceeds total pool` / `Invalid recipient`
- `Cannot refund after merkle root` / `Claim period not expired` / `No unclaimed funds` / `Transfer failed` / `Renounce disabled`

**Storage layout:**

| Slot | Value | Decoded |
|------|-------|---------|
| 0 | `0x...e21c78037329d06fe0d6fefc4221aaa67cb0d135` | Owner |
| 1 | `0x00` | Unused |
| 2 | `0x01` | Initialized flag |

Dynamic mappings (contests, deposits) use keccak256-derived slots.

### V2 Contract

**Address:** `0x6d86b21e853758F5719408633e6BcB2cfd50cf07`
**Chain:** 998 (HyperEVM Testnet)
**Owner:** `0xe21c78037329d06fe0d6fefc4221aaa67cb0d135` (same as V1)
**Status:** Recently activated (contests 865–867+ created on March 26). Active testing in progress.

**Functions (24 — all selectors verified against on-chain bytecode):**

| Selector | Function | Access |
|----------|----------|--------|
| `0x00aeef8a` | `deposit(uint256,uint256,uint256)` | public payable |
| `0x2a658bdf` | `getTotalPaidOut(uint256)` | public view |
| `0x3a8ef03b` | `finalizeContest(uint256)` | onlyOwner |
| `0x3f4ba83a` | `unpause()` | onlyOwner |
| `0x5065a5ed` | `deposits(uint256,uint256,address)` | public view |
| `0x5b65ac32` | `contestRewardPools(uint256)` | public view |
| `0x5c975abb` | `paused()` | public view |
| `0x5d4df3bf` | `claim(uint256,uint256,address,uint256,bytes32[])` | public |
| `0x6692afd0` | `getContestPool(uint256)` | public view |
| `0x6ab49c2f` | `refundTo(uint256,uint256,address,address)` | onlyOwner |
| `0x6dab6b23` | `createContest(uint256,uint256)` | onlyOwner |
| `0x715018a6` | `renounceOwnership()` | always reverts |
| `0x71c5ecb1` | `merkleRoots(uint256)` | public view |
| `0x79ba5097` | `acceptOwnership()` | pendingOwner only |
| `0x8456cb59` | `pause()` | onlyOwner |
| `0x8da5cb5b` | `owner()` | public view |
| `0x979f4877` | `getDeposit(uint256,uint256,address)` | public view |
| `0x9d7ed738` | `contests(uint256)` | public view |
| `0xa3d07f67` | `refund(uint256,uint256,address)` | onlyOwner |
| `0xb2447e34` | `withdrawPlatformFee(uint256,uint256)` | onlyOwner |
| `0xe30c3978` | `pendingOwner()` | public view |
| `0xf295f6e4` | `publishMerkleRoot(uint256,bytes32,uint256)` | onlyOwner |
| `0xf2fde38b` | `transferOwnership(address)` | onlyOwner |
| `0xf364c90c` | `isClaimed(uint256,uint256)` | public view |

### V1 vs V2 Comparison

| Feature | V1 | V2 |
|---------|----|----|
| **Security** | No protection | Ownable2Step + ReentrancyGuard + Pausable |
| **deposit()** | `(contestId, sideId)` 2 params | `(contestId, sideId, deadline)` 3 params |
| **claim()** | `(contestId, sideId, proof[])` leaf = hash(contestId, sideId, address) | `(contestId, index, recipient, amount, proof[])` leaf = hash(index, recipient, amount) |
| **Claim tracking** | mapping | bitmap (more gas efficient) |
| **Fee model** | Hardcoded `platformFeeBps = 90` (0.9%) | Implicit: totalPool - rewardPool. Flexible per contest |
| **Fee withdrawal** | `sweepUnclaimed()` takes everything | `withdrawPlatformFee(contestId, amount)` precise amounts |
| **Ownership transfer** | Direct (Ownable) | 2-step (Ownable2Step + acceptOwnership) |
| **Circuit breaker** | None | `pause()` / `unpause()` |
| **Refund** | `refund(contestId, sideId, user)` | + `refundTo(contestId, sideId, user, recipient)` |
| **renounceOwnership** | Always reverts | Always reverts |
| **CoreWriter/Precompiles** | None | None |
| **Token** | HYPE only | HYPE only |

V2 is V1 hardened with production-grade security. The mystery selector `0xb2447e34` from V1 was identified as `withdrawPlatformFee` thanks to V2's full decompilation.

### Contest struct (V2)

```solidity
struct Contest {
    uint256 entryFee;      // slot 0: fixed HYPE amount
    uint256 totalPool;     // slot 1: sum of all deposits
    uint256 totalPaidOut;  // slot 2: sum of all claims
    bool isFinalized;      // slot 3: set by finalizeContest
}
```

Query via `contests(uint256)`:
```
Contest #867 → entryFee: 0.1 HYPE, totalPool: 0, totalPaidOut: 0, isFinalized: false
```

### Parimutuel contest lifecycle (EVM)

```
[1] OWNER: createContest(contestId, entryFee)
[2] USERS: deposit(contestId, sideId, deadline) + msg.value = entryFee exactly
    → 1 deposit max per address per contest
    → emits DepositReceived
[3] Deposit deadline passes
[4] OWNER: finalizeContest(contestId)
    → emits ContestFinalized
[5] OWNER: publishMerkleRoot(contestId, root, rewardPool)
    → can only publish once
    → emits MerkleRootPublished
[6] USERS: claim(contestId, index, recipient, amount, proof[])
    → verifies Merkle proof, pays reward
    → emits Claimed
[7] OWNER: withdrawPlatformFee(contestId, amount)
    or after claim period: sweepUnclaimed(contestId) [V1 only]
```

**Alternative:** Before Merkle root is published, OWNER can call `refund()` to cancel and refund.

### EvmRawTx — How EVM lives inside HyperCore

When an EVM transaction is submitted, it appears on the L1 explorer as:
```json
{
  "type": "evmRawTx",
  "data": "0x02f8af8203e6..."
}
```

The `data` field is a full RLP-encoded EIP-1559 EVM transaction (calldata + signature + gas params). The L1 User field shows the **relayer** wallet that submitted the EvmRawTx to HyperCore. The actual EVM signer is inside the RLP payload (recoverable from the signature).

Example: L1 shows `User: 0x946b...` but the EVM tx inside is signed by `0xe21c...` (the contract owner). Two identities in one transaction — this is the "2 worlds, 1 universe" architecture in action.

### Bridge L1↔EVM

**Native HYPE:** From system address `0x2222222222222222222222222222222222222222` — value transfer, empty input.

**Spot tokens:** From `0x2000...{assetIndex 2 bytes hex}` — ERC20 `transfer(address,uint256)`, selector `0xa9059cbb`.

---

## Timeline

### Day 1 (March 24)

- androolloyd explains HyperCore/HyperEVM architecture: EVM is a fiction inside HyperCore, EvmRawTx encoded in MessagePack inside Core blocks
- "2 worlds, 1 universe" concept
- Decoded 3 raw EVM transactions on the V1 contract: `deposit`, `createContest`, `finalizeContest`
- Identified 3 selectors and mapped the contest lifecycle
- V2 contract found by androolloyd via heimdall-rs decompilation
- V2 compiled clean: 24/24 selectors verified
- Full V1 vs V2 comparison completed
- Discovery: HIP-4 has two systems — CLOB (HyperCore) + parimutuel (HyperEVM)
- androolloyd's "two jars" theory: same game, different rules, different pots

### Day 2 (March 25)

- Published V1 research on Liquid Terminal
- Published V2 comparison tweet
- Tested live on testnet: bought YES on HYPE 15min market
- Discovered VoteGlobalAction — native L1 settlement mechanism
- Found market creation tx: `registerTokensAndStandaloneOutcome`
- Full L1 lifecycle mapped: create → trade → settle, no EVM
- Identified system wallets (0xe92d... and 0xc25c...) rotating settlement
- Strike price = markPx at creation (confirmed by oracle price feed analysis)
- Won first prediction: BTC above 70,836, settled instantly
- Published article draft and 4 SVG diagrams

### Day 3 (March 26)

- V2 contracts reactivated: contests 865–867 created today
- Decoded new EvmRawTx showing dual-identity (L1 relayer vs EVM signer)
- Discovered two unknown contracts: 0x497a...8377 and 0xbFEc...968E
- Traced deployer funding chain → Block Theory Cap theory emerges
- Corrected assumption: EVM contracts likely NOT from HL team
- Confirmed multi-outcome markets are independent YES/NO pairs
- Confirmed pair minting mechanics via live orderbook testing
- EnigmaValidator joins the investigation
- API research: outcomeMeta endpoint, coin ID mapping, WebSocket feeds

---

## Tweet Archive (chronological)

### Tweet 1 — HIP-4 uses HyperEVM (later corrected)
**URL:** https://x.com/Yaugourt/status/2036072526565024209

> Something most people missed about HIP4: It's the first HIP that actually uses HyperEVM. HIP-1 (tokens), HIP-2 (liquidity), HIP-3 (permissionless markets) — all pure HyperCore L1. HIP4 puts contest logic on EVM smart contracts. Creation, deposits, claims, settlements — all on-chain EVM events. Trading still runs on the HyperCore order book as #-prefixed markets. Why it matters: EVM composability is now plugged into the core protocol. Any contract can read, interact with, build on top of prediction markets. Hyperliquid just made HyperEVM functional, not optional. I'm digging deeper into the mechanics and will share a full breakdown soon. Shoutout to @0xExoMonk for the work, already solving the HIP4 data problem before mainnet even drops.

### Tweet 2 — V1 Full Research
**URL:** https://x.com/Yaugourt/status/2036438290576916632

> Yesterday I posted about HIP4 being the first HIP to use HyperEVM. Full research → https://liquidterminal.xyz/hip4/home. HIP4 has no official documentation. No verified source. No ABI. So we reverse-engineered the contract from bytecode and calldata on testnet. What we mapped: → Full reconstructed ABI (selectors, signatures, access control) → Every event (DepositReceived, Claimed, ContestCreated, ContestFinalized, MerkleRootPublished) → All revert strings mined from bytecode → Storage layout (owner, mappings, initialization flags) → Complete contest lifecycle: createContest → deposit → publishMerkleRoot → claim → sweepUnclaimed → Bridge architecture L1↔EVM (asset index formula, outcome token mapping) → Real decoded testnet transactions → JS + Python code examples. Some findings: Pre-deployed at genesis, not a standard deployment. renounceOwnership always reverts, admin is permanent by design. Merkle-based claims, 0.9% platform fee on reward pool. Three market types: custom, priceBinary, recurring. Testnet only. This is v1, early test from the team, raw design, and some things might be off. Nothing is final. If you spot errors or have insights, feedback is very much appreciated.

### Tweet 3 — V2 Contract Found
**URL:** https://x.com/Yaugourt/status/2036539291195605367

> Update on HIP-4, V2 contract found. After posting the V1 research, @androolloyd and I kept digging. He reverse-engineered a second contract deployed at genesis by the same team wallet. V2: 0x6d86b21e853758F5719408633e6BcB2cfd50cf07. Team wallet: 0xe21c78037329d06fe0d6fefc4221aaa67cb0d135. Full bytecode decompiled, Solidity reconstructed. 24/24 function selectors verified against on-chain bytecode. Important: All live prediction markets currently trading on HyperCore are linked to the V1 contract, NOT V2. V2 has no active markets yet. It exists on-chain at genesis but appears unused so far. What changed: Security — V1 had no protection. V2 adds the full OpenZeppelin stack: Ownable2Step, ReentrancyGuard, Pausable. Claim system reworked. Fee model updated. Deposit now takes a deadline param. Also cracked V1's mystery selector 0xb2447e34, it was withdrawPlatformFee all along. Credit @androolloyd for the V2 decompilation.

### Tweet 4 — First Live Test
**URL:** https://x.com/Yaugourt/status/2036925934947725798

> This prediction market restarts every 15 minutes on testnet. I spotted an open order, took the other side, and waited to see what happens at settlement. HYPE above 97.194 on Mar 25 at 10:45 PM? — YES at 0.50 for 15 USDH. https://app.hyperliquid-testnet.xyz/trade/hype-above-97194-yes-mar-25-2215

### Tweet 5 — VoteGlobalAction Discovery
**URL:** https://x.com/Yaugourt/status/2036925934947725798 (thread)

> HIP-4. Something new was found. I bought a YES position on 'HYPE above 97.194 on Mar 25 at 10:45 PM' at 0.50 for 15 USDH. The market runs on a 15-minute cycle. When the market closed, the settlement happened automatically on HyperCore. No claim, no manual action. Here's the L1 transaction: type: 'VoteGlobalAction' settleOutcome: 2221 settleFraction: 0 details: 'price:97.194'. settleFraction: 0 means the YES outcome lost. HYPE was below 97.194 at expiry. My 15 USDH position settled to 0. This answers one of the biggest open questions from our research: how does the CLOB side settle? It's not a Merkle claim like the EVM parimutuel contracts. It's not manual. It's a native L1 action called VoteGlobalAction that auto-settles every position at expiry. The system reads the price, determines the outcome, and closes all positions in one block. No oracle dispute, no admin intervention. This is the HyperCore side of HIP-4 in action. Settlement is built into the L1 consensus layer itself. TX: https://app.hyperliquid-testnet.xyz/explorer/tx/0xe3e78e3d72eabe68e561041f8bbfbe000022a6230deddd3a87b0399031ee9853

### Tweet 6 — First Winning Prediction
**URL:** (March 26 thread)

> HIP-4. My first winning prediction on Hyperliquid testnet. BTC above 70,836 on Mar 26 at 4:00 AM? YES at 0.75. Settled at 1.00. +33.3%. Bought at 23:01. Settled at 04:00. Paid instantly. No Merkle proof. No claim button. No UMA dispute window. No waiting. The position settled automatically at expiry. 200 YES, 150 USDH in, 200 USDH out, 50 USDH profit. Settlement tx: https://app.hyperliquid-testnet.xyz/explorer/address/0xc25c4a1e3872f4d601d70b5db85604f7039ece56. Interesting: the settler is a new address (0xc25c...) different from the one we tracked yesterday (0xe92d...). Multiple system wallets rotating settlement duties. On Polymarket you wait for UMA oracle resolution. On Kalshi you wait for the platform to confirm. On Hyperliquid the L1 reads the price and pays you immediately. This is what native settlement looks like. Testnet. Not financial advice. Just a nerd betting on BTC with fake money and winning.

### Tweet 7 — Creation TX Found
**URL:** https://x.com/Yaugourt/status/2037010387959247090

> HIP-4. Found the creation transaction for prediction markets on HyperCore. tx: https://app.hyperliquid-testnet.xyz/explorer/tx/0x077110ad6b1a4d2808ea041f8e483a010f002893061d6bfaab39bc002a1e2712. type: registerTokensAndStandaloneOutcome quoteToken: 1452 name: Recurring description: class:priceBinary | underlying:BTC | expiry:20260327-0300 | targetPrice:71169 | period:1d. The full lifecycle is now mapped, entirely on L1: Create: registerTokensAndStandaloneOutcome (mints YES/NO tokens, sets strike). Trade: standard CLOB order book in USDH. Settle: VoteGlobalAction (reads price, closes all positions in one block). No EVM contract involved at any step. No Merkle proof. No manual claim. Pure HyperCore from creation to settlement. targetPrice is 71,169, almost certainly the BTC markPx at creation time. Markets open at ~50/50 by design. Important caveat: right now the team controls everything. Creation, price feeds, and settlement all go through system wallets. That's expected for testnet. The flow makes sense, the architecture is clean, but nothing is decentralized yet. How this transitions to mainnet (validators settling? permissionless creation?) is still an open question.

### Tweet 8 — Pair Minting Mechanics
**URL:** https://x.com/Yaugourt/status/2037029899249004683

> HIP-4 mechanics decoded for short time and recurring market prediction. Last one for today. When you place a buy order on a prediction market, the system doesn't look for a seller. It creates one. Example: I buy YES at 0.40 for 100 USDH. The protocol automatically mirrors a NO order at 0.60 (because YES + NO = 1.00 always). My 100 USDH buys 250 tokens at 0.40 each. The mirror NO side: same 250 tokens at 0.60 = 150 USDH. When someone takes the NO side, a pair is minted: 1 YES + 1 NO. I get the YES, they get the NO. Total collateral locked: 100 + 150 = 250 USDH = 250 tokens x 1.00. At settlement the winner takes 1.00 per token, the loser gets 0. All collateral goes to the winning side. Same pair minting as Polymarket's Conditional Token Framework, but native to HyperCore L1. No smart contract, no ERC1155, no Polygon. Just the matching engine doing it natively in 0.07s blocks. The cheaper you buy (0.40 = you think 40% chance), the more the other side puts up (0.60). Your risk is your price. Their risk is theirs. The protocol just makes sure it always adds up to 1.00. Thank you all for the support, the feedback, and the engagement on this research. This community is something else. More digging soon.

### Tweet 9 — Minimum Order Deep Dive (by EnigmaValidator)
**URL:** (EnigmaValidator's post)

> HIP-4 minimum order deep dive. Hyperliquid prediction markets require: size × min(markPrice, 1-markPrice) ≥ $10. The UI says "$10 minimum" every time but the real minimum depends on where your limit price sits vs mark price. API error (always the same): "Order must have minimum value of 10 USDH. asset=100000100". The formula: min_cost = 10 × limitPrice / min(markPrice, 1-markPrice). Market orders sweep asks using IOC (Immediate-or-Cancel) with a limit price above mark, and the wider that gap, the higher your real minimum. I hit this building http://liquidiction.xyz on testnet. Entered $28 -> UI said minimum $10 -> API rejected it. Follow @Yaugourt for all things Hyperliquid, as he's motivating me to dig into this stuff as I build out Liquidiction.

### Tweet 10 — Correction + New Findings
**URL:** https://x.com/Yaugourt/status/2037193257210331467

> HIP-4 research update. Correcting an assumption on the EVM contracts, new findings on multi-outcome mechanics, and next steps. We got something wrong. In our earlier analysis, we assumed the parimutuel contracts on HyperEVM (V1: 0x4fd7...44bd, V2: 0x6d86...cf07) were deployed by the Hyperliquid team. We had reasons to believe this: The deployer wallet (0xe21c...d135) is over 2 years old with 19K+ transactions. The contracts were flagged as genesis deployments, but we've since learned that any contract on HyperEVM gets flagged this way. The timing correlated perfectly with the HIP-4 testnet launch, and the contracts are still actively used today with continuous contest creation, deposits, settlements, and fee withdrawals. But after tracing the funding chain, the wallet that funded the deployer appears to be Block Theory Cap, an early HL user/fund, not the Hyperliquid team. No team members received genesis distributions. This is still a theory, not confirmed, but it changes the picture significantly. If true, it means: The official HIP-4 system is 100% HyperCore L1. Creation via registerTokensAndStandaloneOutcome, native pair minting (YES + NO = 1.00), settlement via VoteGlobalAction. No EVM involved at any step. The EVM parimutuel contracts are an independent project piggybacking on the same market data. Someone saw HIP-4 launch and immediately deployed their own parimutuel system on HyperEVM. Which is honestly impressive either way. It's a total mystery right now. The timing, the activity level, the sophistication of the contracts (V2 has full OpenZeppelin security stack). Whether it's the team testing under a separate identity, a fund building on top of HIP-4, or something else entirely, we don't know yet. Other findings from today: Multi-outcome markets work as independent YES/NO pairs on the CLOB. For off-chain data, @androolloyd pointed out that HIP-3's data feed model could serve as a base for pushing custom resolution data to HyperCore. What's next: We keep digging. @EnigmaValidator is joining the investigation. The game is far from over.

---

## Comparison: HIP-4 vs Polymarket vs Kalshi

| Feature | HIP-4 (Hyperliquid) | Polymarket | Kalshi |
|---------|---------------------|------------|--------|
| **Type** | Native L1 CLOB | Hybrid (off-chain matching, on-chain settlement) | Centralized |
| **Settlement** | Auto, native L1 (VoteGlobalAction), instant | UMA oracle, dispute window | Platform confirms |
| **Chain** | HyperCore (0.07s blocks) | Polygon (ERC1155 Conditional Tokens) | N/A |
| **Trading** | Continuous CLOB, enter/exit anytime | Continuous CLOB, enter/exit anytime | Continuous, enter/exit anytime |
| **Pair minting** | Native in matching engine | Conditional Token Framework (smart contract) | Internal |
| **Oracle** | On-chain price feed (system wallets) | UMA Optimistic Oracle | Internal |
| **Dispute mechanism** | None (trustless for price, trust-based for custom) | UMA dispute (bond + vote) | Platform decision |
| **Composability** | Same engine as perps/spot, unified margin (theory) | Isolated on Polygon | None |
| **Cost** | Near zero gas | Polygon gas | Platform fees |
| **Regulation** | Unregulated | Unregulated (non-US) | CFTC-regulated |

Note: Polymarket and Kalshi also offer continuous CLOB trading. The CLOB mechanism is not unique to HIP-4. What is potentially unique is the dual-system (CLOB + parimutuel) and native integration with the trading engine. But the dual-system is a theory based on testnet observations, not confirmed design.

---

## Site map (Liquid Terminal `/hip4`)

Routes in the app (grouped nav under `/hip4`):

- `/hip4` — Home (L1-first, links to research / core / info-api / reference / compare + EVM annex)
- `/hip4/research` — Timeline + tweet archive
- `/hip4/core` — HyperCore L1 lifecycle, pair mint, open questions
- `/hip4/info-api` — POST /info + WebSocket (GitBook-style layout; HIP-4 fields)
- `/hip4/reference` — Compact overview: URLs, channels, L1 actions, wallets, S3
- `/hip4/compare` — Industry comparison table
- `/hip4/bridge` — L1 ↔ HyperEVM bridge narrative
- `/hip4/overview` … `/hip4/docs` — Third-party EVM contract docs (unchanged content, secondary nav group)

## Credits

- **ExoMonk** (@0xExoMonk) — Initial lead that started the HIP-4 rabbit hole. Discovered the S3 data layer for trade fills. Built hypercore-indexer (450 blocks/sec, ~$2/month vs $200-500 for a node).
- **androolloyd** (@androolloyd, HypurrFi) — V2 bytecode decompilation via heimdall-rs. HyperCore architecture deep dive ("2 worlds, 1 universe"). "Two jars" theory. HIP-3 data feed insight.
- **EnigmaValidator** (@EnigmaValidator) — Joining investigation for multi-outcome creation tracing on HyperCore and HIP-4 endpoint research. Minimum order formula discovery. Building Liquidiction.
- **Yaugourt** (Liquid Terminal) — V1 bytecode analysis, selector brute-force, on-chain testing, pair minting verification, VoteGlobalAction discovery, settlement testing, article and tweet production.

---

## Dev Notes for Dashboard Update

1. **Label EVM contracts clearly** as "Third-party / Unconfirmed origin" — NOT "Hyperliquid team"
2. **Add L1 native section** as the primary HIP-4 documentation (this is the real system)
3. **Coin ID mapping** is critical: outcomeId × 10 = YES coin, outcomeId × 10 + 1 = NO coin. Add trailing zero for API calls.
4. **V2 is now active** — contests being created and funded as of March 26
5. **Keep V1 data** — historical reference, ~160 contests, all finalized
6. **Add API reference page** — outcomeMeta endpoint, candleSnapshot with correct coin IDs, WebSocket feeds
7. **Add L1 action types page** — registerTokensAndStandaloneOutcome, VoteGlobalAction, voteAppHash
8. **System wallets table** — document the testnet settler/oracle addresses
9. **Pair minting explainer** — this is core to understanding HIP-4 mechanics
10. **Update the architecture diagram** — HIP-4 is L1 native, EVM contracts are third-party overlay
