/**
 * HIP-4 L1 / spot fee research — strings for Hip4FeesChapter.
 * Canonical narrative: public/hip4/HIP4-fees.md
 */

export const HIP4_FEES_HL_NODE_STRINGS = `004a194b: "struct variant VoteGlobalAction::SetOutcomeFeeScale with 1 element"
00648e5b: "struct variant VoteGlobalAction::SetOutcomeFeeScale"
001c7cec: "%can only change fee scale once every "`;

export const HIP4_FEES_OUTCOME_DEPLOY_STRINGS = `struct variant OutcomeDeploy::RegisterOutcome with 4 elements
struct variant OutcomeDeploy::RegisterTokensAndStandaloneOutcome with 3 elements
struct variant UserOutcomeAction::SplitOutcome with 2 elements
struct variant UserOutcomeAction::MergeOutcome with 1 element
struct variant UserOutcomeAction::MergeQuestion with 1 element
struct variant UserOutcomeAction::NegateOutcome with 3 elements`;

export const HIP4_FEES_OUTCOME_STATE_STRINGS = `struct OutcomeSpec with 4 elements
struct QuestionSpec with 5 elements
struct OutcomeTracker with 11 elements
struct SettledOutcomeSpec with 3 elements
struct SettledQuestionSpec with 4 elements`;

export const HIP4_FEES_SPOT_META_SAMPLE = JSON.stringify(
  [
    { tokens: [11, 0], name: "@10", index: 10, isCanonical: false },
    { tokens: [12, 0], name: "@11", index: 11, isCanonical: false },
    { tokens: [13, 0], name: "@12", index: 12, isCanonical: false },
  ],
  null,
  2
);

export const HIP4_FEES_DEPLOYER_SHARE_SAMPLES = JSON.stringify(
  [
    {
      name: "CHUTORO",
      index: 11,
      tokenId: "0x709a9be4d62c016171995ea52d7888b0",
      evmContract: null,
      deployerTradingFeeShare: "0.0",
    },
    {
      name: "OTORO",
      index: 12,
      tokenId: "0xe020bcb111ceb9cab517e273bdbd12df",
      evmContract: null,
      deployerTradingFeeShare: "0.0",
    },
    {
      name: "ODDISH",
      index: 13,
      tokenId: "0x0b647df03c2e8922c7225364c2cf2b7d",
      evmContract: null,
      deployerTradingFeeShare: "0.0",
    },
  ],
  null,
  2
);

export const HIP4_FEES_CURL_USER_FEES_BASE = `curl -s https://api.hyperliquid-testnet.xyz/info \\
  -H 'Content-Type: application/json' \\
  --data '{"type":"userFees","user":"0xffffffffffffffffffffffffffffffffffffffff"}'`;

export const HIP4_FEES_JSON_USER_FEES_BASE = JSON.stringify(
  {
    feeSchedule: {
      cross: "0.00045",
      add: "0.00015",
      spotCross: "0.0007",
      spotAdd: "0.0004",
    },
    userCrossRate: "0.0",
    userAddRate: "0.0",
    userSpotCrossRate: "0.0",
    userSpotAddRate: "0.0",
    activeReferralDiscount: "0.0",
  },
  null,
  2
);

export const HIP4_FEES_CURL_USER_FILLS = `curl -s https://api.hyperliquid-testnet.xyz/info \\
  -H 'Content-Type: application/json' \\
  --data '{"type":"userFillsByTime","user":"0xae551d73161bac3315c5ade0e2d499a44ebe2236","startTime":1769956276000,"endTime":1769956277000}'`;

export const HIP4_FEES_JSON_SAMPLE_FILL = JSON.stringify(
  {
    coin: "@10",
    px: "0.59475",
    sz: "1000.0",
    dir: "Buy",
    crossed: true,
    fee: "0.56",
    feeToken: "CHUTORO",
  },
  null,
  2
);

export const HIP4_FEES_NORMALIZATION_TEXT = `notional_usdc = px * sz
              = 0.59475 * 1000
              = 594.75 USDC

fee_usdc_equiv = fee_token_amount * px
               = 0.56 * 0.59475
               = 0.33306 USDC

effective_rate = fee_usdc_equiv / notional_usdc
               = 0.33306 / 594.75
               = 0.00056
               = 5.6 bps`;

export const HIP4_FEES_JSON_USER_FEES_TRADER = JSON.stringify(
  {
    userSpotCrossRate: "0.00056",
    userSpotAddRate: "0.00032",
  },
  null,
  2
);

export const HIP4_FEES_RATE_MATCH_TEXT = `HIP-4 fill effective taker rate = 0.00056
userSpotCrossRate               = 0.00056`;

export const HIP4_FEES_BINARY_LIMITS_TEXT = `- explicit HIP-3 fee-scale storage names:
  - deployer_fee_scale
  - last_deployer_fee_scale_change_time
- no similarly explicit named field such as:
  - outcome_fee_scale
  - last_outcome_fee_scale_change_time
  - outcome_fees_collected`;
