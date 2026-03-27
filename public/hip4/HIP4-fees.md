# Proofs for how HIP-4 fees work

Date: 2026-03-27

This note lists the concrete proofs behind the current fee conclusion:

> On testnet, HIP-4 outcome trading behaves like ordinary spot trading for fees, while `hl-node` also contains a native governance action `VoteGlobalAction::SetOutcomeFeeScale` that could adjust outcome fees globally.

## Claim 1: HIP-4 has its own native fee governance hook

### Proof

The `hl-node` binary contains these strings:

```text
004a194b: "struct variant VoteGlobalAction::SetOutcomeFeeScale with 1 element"
00648e5b: "struct variant VoteGlobalAction::SetOutcomeFeeScale"
001c7cec: "%can only change fee scale once every "
```

### What this proves

- HIP-4 fee handling is not purely a frontend assumption.
- HyperCore exposes a real governance/state-machine action named `SetOutcomeFeeScale`.
- The action takes one field.
- The binary also contains fee-scale mutation logic with a cooldown.

### What this does not prove

- the exact formula applied after the scale changes
- the exact current stored value on testnet
- whether the scale is stored in `OutcomeTracker` or some other internal fee state

## Claim 2: outcome assets trade on spot rails

### Proof

The binary contains the outcome deploy and user-outcome action types:

```text
struct variant OutcomeDeploy::RegisterOutcome with 4 elements
struct variant OutcomeDeploy::RegisterTokensAndStandaloneOutcome with 3 elements
struct variant UserOutcomeAction::SplitOutcome with 2 elements
struct variant UserOutcomeAction::MergeOutcome with 1 element
struct variant UserOutcomeAction::MergeQuestion with 1 element
struct variant UserOutcomeAction::NegateOutcome with 3 elements
```

It also contains the core outcome state types:

```text
struct OutcomeSpec with 4 elements
struct QuestionSpec with 5 elements
struct OutcomeTracker with 11 elements
struct SettledOutcomeSpec with 3 elements
struct SettledQuestionSpec with 4 elements
```

And public state shows live outcome markets as spot pairs against USDC.

From `spotMetaAndAssetCtxs`, the Hypurr market outcomes appear as:

```json
{ "tokens": [11, 0], "name": "@10", "index": 10, "isCanonical": false }
{ "tokens": [12, 0], "name": "@11", "index": 11, "isCanonical": false }
{ "tokens": [13, 0], "name": "@12", "index": 12, "isCanonical": false }
```

### What this proves

- outcome assets are traded through spot-style books
- fee behavior should be compared to spot fee behavior first, not perp or a separate PM engine

## Claim 3: live HIP-4 tokens do not currently expose extra token-level fee share

### Proof

For the live Hypurr outcome tokens, `spotMetaAndAssetCtxs` reports:

```json
{
  "name": "CHUTORO",
  "index": 11,
  "tokenId": "0x709a9be4d62c016171995ea52d7888b0",
  "evmContract": null,
  "deployerTradingFeeShare": "0.0"
}
{
  "name": "OTORO",
  "index": 12,
  "tokenId": "0xe020bcb111ceb9cab517e273bdbd12df",
  "evmContract": null,
  "deployerTradingFeeShare": "0.0"
}
{
  "name": "ODDISH",
  "index": 13,
  "tokenId": "0x0b647df03c2e8922c7225364c2cf2b7d",
  "evmContract": null,
  "deployerTradingFeeShare": "0.0"
}
```

### What this proves

- the observed live HIP-4 markets are not currently adding a visible nonzero deployer trading fee share on top of normal spot trading

## Claim 4: the public spot fee schedule on testnet is known

### Proof

Request:

```bash
curl -s https://api.hyperliquid-testnet.xyz/info \
  -H 'Content-Type: application/json' \
  --data '{"type":"userFees","user":"0xffffffffffffffffffffffffffffffffffffffff"}'
```

Observed response:

```json
{
  "feeSchedule": {
    "cross": "0.00045",
    "add": "0.00015",
    "spotCross": "0.0007",
    "spotAdd": "0.0004"
  },
  "userCrossRate": "0.0",
  "userAddRate": "0.0",
  "userSpotCrossRate": "0.0",
  "userSpotAddRate": "0.0",
  "activeReferralDiscount": "0.0"
}
```

### What this proves

- the live base spot fee schedule is:
  - spot taker: `0.0007` = `7 bps`
  - spot maker: `0.0004` = `4 bps`

## Claim 5: real HIP-4 fills match normal spot fee math

### Proof

I queried a real taker fill for the outcome market `@10`:

```bash
curl -s https://api.hyperliquid-testnet.xyz/info \
  -H 'Content-Type: application/json' \
  --data '{"type":"userFillsByTime","user":"0xae551d73161bac3315c5ade0e2d499a44ebe2236","startTime":1769956276000,"endTime":1769956277000}'
```

Representative fill:

```json
{
  "coin": "@10",
  "px": "0.59475",
  "sz": "1000.0",
  "dir": "Buy",
  "crossed": true,
  "fee": "0.56",
  "feeToken": "CHUTORO"
}
```

At first glance, `fee = 0.56` can look too large if you compare it directly against USDC notional. That is wrong, because the fee token here is the base outcome asset, not USDC.

Correct normalization:

```text
notional_usdc = px * sz
              = 0.59475 * 1000
              = 594.75 USDC

fee_usdc_equiv = fee_token_amount * px
               = 0.56 * 0.59475
               = 0.33306 USDC

effective_rate = fee_usdc_equiv / notional_usdc
               = 0.33306 / 594.75
               = 0.00056
               = 5.6 bps
```

Then I queried the same user's fee state:

```bash
curl -s https://api.hyperliquid-testnet.xyz/info \
  -H 'Content-Type: application/json' \
  --data '{"type":"userFees","user":"0xae551d73161bac3315c5ade0e2d499a44ebe2236"}'
```

Observed:

```json
{
  "userSpotCrossRate": "0.00056",
  "userSpotAddRate": "0.00032"
}
```

The normalized outcome fee rate is exactly the same as the user's spot taker fee rate:

```text
HIP-4 fill effective taker rate = 0.00056
userSpotCrossRate               = 0.00056
```

### What this proves

- the observed HIP-4 taker fill is charged exactly like an ordinary spot taker fill
- there is no visible extra HIP-4 uplift on this real trade
- raw fee values on outcome fills must be normalized by `feeToken`

## Claim 6: the current active `SetOutcomeFeeScale` value has not been recovered directly

### Proof

A fresh binary pass found:

- explicit HIP-3 fee-scale storage names:
  - `deployer_fee_scale`
  - `last_deployer_fee_scale_change_time`
- no similarly explicit named field such as:
  - `outcome_fee_scale`
  - `last_outcome_fee_scale_change_time`
  - `outcome_fees_collected`

### What this proves

- the stripped binary does not expose an obvious readable named storage field for the active HIP-4 fee scale
- so the safest statement is not "the value is X from the binary"
- the strongest current value statement is behavioral: live testnet outcome fees behave as if the scale is neutral

## Final conclusion

The proof stack is:

1. `hl-node` proves a native outcome-fee governance action exists: `VoteGlobalAction::SetOutcomeFeeScale`.
2. The same binary and public market metadata prove HIP-4 outcomes trade on spot rails.
3. Live HIP-4 tokens currently expose `deployerTradingFeeShare = 0.0`.
4. Real outcome fills, once denominated correctly, match `userSpotCrossRate` exactly.

So the current evidence-supported conclusion is:

> HIP-4 trading fees on testnet currently behave like normal spot trading fees, while HyperCore retains a separate governance action that can potentially rescale outcome fees globally.
