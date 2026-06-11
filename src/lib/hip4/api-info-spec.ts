/**
 * HIP-4 HyperCore / mainnet API — structured for GitBook-style rendering.
 * Canonical narrative: public/hip4/HIP4-research-complete.md
 */

export const HYPERLIQUID_INFO_SPOT_DOC_URL =
  "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot";

export interface Hip4ApiHeaderRow {
  name: string;
  value: string;
  required?: boolean;
}

export interface Hip4ApiBodyFieldRow {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface Hip4ApiResponseTab {
  id: string;
  label: string;
  body: string;
}

export interface Hip4RestEndpointSpec {
  id: string;
  title: string;
  method: "POST";
  url: string;
  intro?: string;
  headers: Hip4ApiHeaderRow[];
  bodyFields: Hip4ApiBodyFieldRow[];
  exampleRequestJson: string;
  responseTabs: Hip4ApiResponseTab[];
}

const STANDARD_INFO_HEADERS: Hip4ApiHeaderRow[] = [
  { name: "Content-Type", value: "application/json", required: true },
];

export const HIP4_REST_INFO_ENDPOINTS: Hip4RestEndpointSpec[] = [
  {
    id: "outcomeMeta",
    title: "Retrieve outcome metadata",
    method: "POST",
    url: "https://api.hyperliquid.xyz/info",
    intro:
      "Lists prediction outcomes, side specs, and grouped questions.",
    headers: STANDARD_INFO_HEADERS,
    bodyFields: [
      {
        name: "type",
        type: "String",
        description: "Must be \"outcomeMeta\".",
        required: true,
      },
    ],
    exampleRequestJson: JSON.stringify({ type: "outcomeMeta" }, null, 2),
    responseTabs: [
      {
        id: "200",
        label: "200: OK Successful Response",
        body: JSON.stringify(
          {
            outcomes: [
              {
                outcome: 9,
                name: "Who will win the HL 100 meter dash?",
                description: "This race is yet to be scheduled.",
                sideSpecs: [{ name: "Hypurr" }, { name: "Usain Bolt" }],
              },
              {
                outcome: 2243,
                name: "Recurring",
                description:
                  "class:priceBinary|underlying:BTC|expiry:20260327-0300|targetPrice:71169|period:1d",
                sideSpecs: [{ name: "Yes" }, { name: "No" }],
              },
            ],
            questions: [
              {
                question: 1,
                name: "What will Hypurr eat the most of in Feb 2026?",
                description:
                  "Hypurr has committed to weighing and recording daily food intake in a food journal.",
                fallbackOutcome: 13,
                namedOutcomes: [10, 11, 12],
                settledNamedOutcomes: [],
              },
            ],
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "candleSnapshot",
    title: "Retrieve candle snapshot (# coins)",
    method: "POST",
    url: "https://api.hyperliquid.xyz/info",
    intro:
      "OHLCV history for a spot-style coin string. For HIP-4 pairs use the full #YES id (trailing zero), not the raw outcome id.",
    headers: STANDARD_INFO_HEADERS,
    bodyFields: [
      { name: "type", type: "String", description: "\"candleSnapshot\".", required: true },
      {
        name: "req",
        type: "Object",
        description: "Request object — see nested fields.",
        required: true,
      },
      {
        name: "req.coin",
        type: "String",
        description: "e.g. \"#22430\" (YES leg of outcome 2243).",
        required: true,
      },
      {
        name: "req.interval",
        type: "String",
        description: "e.g. \"1d\", \"1h\".",
        required: true,
      },
      {
        name: "req.startTime",
        type: "number",
        description: "Unix ms.",
        required: true,
      },
      {
        name: "req.endTime",
        type: "number",
        description: "Unix ms.",
        required: true,
      },
    ],
    exampleRequestJson: JSON.stringify(
      {
        type: "candleSnapshot",
        req: {
          coin: "#22430",
          endTime: 1774569600000,
          interval: "1d",
          startTime: 1746057600000,
        },
      },
      null,
      2
    ),
    responseTabs: [
      {
        id: "200",
        label: "200: OK Successful Response",
        body: JSON.stringify(
          [
            {
              T: 1746057600000,
              c: "0.512",
              h: "0.52",
              i: "1d",
              l: "0.498",
              n: 120,
              o: "0.505",
              t: 1774569600000,
              v: "1936.0",
            },
          ],
          null,
          2
        ),
      },
    ],
  },
  {
    id: "userFees",
    title: "User fee schedule (userFees)",
    method: "POST",
    url: "https://api.hyperliquid.xyz/info",
    intro:
      "Per-user spot/perp fee rates and the default feeSchedule. Use a sentinel address for base schedule only. Used in HIP-4 fee research to compare outcome fills to userSpotCrossRate.",
    headers: STANDARD_INFO_HEADERS,
    bodyFields: [
      { name: "type", type: "String", description: "\"userFees\".", required: true },
      {
        name: "user",
        type: "String (0x…)",
        description: "Wallet address; e.g. 0xff…f for default schedule only.",
        required: true,
      },
    ],
    exampleRequestJson: JSON.stringify(
      { type: "userFees", user: "0xffffffffffffffffffffffffffffffffffffffff" },
      null,
      2
    ),
    responseTabs: [
      {
        id: "200-base",
        label: "200: default schedule (sentinel user)",
        body: JSON.stringify(
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
        ),
      },
      {
        id: "200-trader",
        label: "200: example trader (HIP-4 fee note)",
        body: JSON.stringify(
          {
            userSpotCrossRate: "0.00056",
            userSpotAddRate: "0.00032",
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "userFillsByTime",
    title: "User fills by time window (userFillsByTime)",
    method: "POST",
    url: "https://api.hyperliquid.xyz/info",
    intro:
      "Historical fills for a user between startTime and endTime (Unix ms). Outcome markets use @-prefixed coin names; fee is often in feeToken (base asset), not USDC — normalize for effective bps.",
    headers: STANDARD_INFO_HEADERS,
    bodyFields: [
      { name: "type", type: "String", description: "\"userFillsByTime\".", required: true },
      {
        name: "user",
        type: "String (0x…)",
        description: "Wallet address.",
        required: true,
      },
      { name: "startTime", type: "number", description: "Unix ms (inclusive).", required: true },
      { name: "endTime", type: "number", description: "Unix ms (inclusive).", required: true },
    ],
    exampleRequestJson: JSON.stringify(
      {
        type: "userFillsByTime",
        user: "0xae551d73161bac3315c5ade0e2d499a44ebe2236",
        startTime: 1769956276000,
        endTime: 1769956277000,
      },
      null,
      2
    ),
    responseTabs: [
      {
        id: "200",
        label: "200: example outcome fill",
        body: JSON.stringify(
          [
            {
              coin: "@10",
              px: "0.59475",
              sz: "1000.0",
              dir: "Buy",
              crossed: true,
              fee: "0.56",
              feeToken: "CHUTORO",
            },
          ],
          null,
          2
        ),
      },
    ],
  },
];

export interface Hip4WsExampleSpec {
  id: string;
  title: string;
  url: string;
  intro?: string;
  subscriptionExample: string;
  responseTabs: Hip4ApiResponseTab[];
}

export const HIP4_WS_EXAMPLES: Hip4WsExampleSpec[] = [
  {
    id: "activeSpotAssetCtx",
    title: "Channel: activeSpotAssetCtx",
    url: "wss://api.hyperliquid.xyz/ws",
    intro:
      "Subscribe per coin for mark/mid, volume, supply. markPx reads as implied probability on YES legs.",
    subscriptionExample: JSON.stringify(
      {
        method: "subscribe",
        subscription: { type: "activeSpotAssetCtx", coin: "#22430" },
      },
      null,
      2
    ),
    responseTabs: [
      {
        id: "push",
        label: "Example push payload",
        body: JSON.stringify(
          {
            channel: "activeSpotAssetCtx",
            data: {
              coin: "#22430",
              ctx: {
                prevDayPx: "0.5",
                dayNtlVlm: "976.651",
                markPx: "0.515",
                midPx: "0.515",
                circulatingSupply: "1936.0",
                dayBaseVlm: "1936.0",
                totalSupply: "184467440737095.53125",
              },
            },
          },
          null,
          2
        ),
      },
    ],
  },
  {
    id: "l2Book",
    title: "Channel: l2Book",
    url: "wss://api.hyperliquid.xyz/ws",
    intro:
      "levels[0] = bids (desc), levels[1] = asks (asc). Each # coin has its own book; pair minting mirrors across YES/NO.",
    subscriptionExample: JSON.stringify(
      {
        method: "subscribe",
        subscription: { type: "l2Book", coin: "#22430" },
      },
      null,
      2
    ),
    responseTabs: [
      {
        id: "push",
        label: "Example push payload",
        body: JSON.stringify(
          {
            channel: "l2Book",
            data: {
              coin: "#22430",
              levels: [
                [
                  { px: "0.5", sz: "2000.0", n: 2 },
                  { px: "0.4", sz: "50.0", n: 1 },
                ],
                [
                  { px: "0.53", sz: "2048.0", n: 1 },
                  { px: "0.53055", sz: "136.0", n: 1 },
                  { px: "0.56111", sz: "887.0", n: 1 },
                ],
              ],
              time: 1774545317611,
            },
          },
          null,
          2
        ),
      },
    ],
  },
];

export const HIP4_OUTCOME_TYPE_ROWS: [string, string, string][] = [
  ["Custom", "outcome 9", "Open question, N named outcomes"],
  ["priceBinary", "outcome 2243", "Above/below threshold at expiry — YES/NO only"],
  ["Recurring", "outcome 2300", "Auto-recreated priceBinary (15m, 1h, 1d, …)"],
];

/** Flat TOC for Info API page — order matches [`Hip4InfoApiChapter`](src/components/hip4/chapters/Hip4InfoApiChapter.tsx). */
export interface Hip4InfoApiTocItem {
  id: string;
  label: string;
}

export const HIP4_INFO_API_TOC_ITEMS: Hip4InfoApiTocItem[] = [
  { id: "hip4-info-intro", label: "Intro & base URL" },
  { id: "hip4-rest-block", label: "REST — POST /info" },
  ...HIP4_REST_INFO_ENDPOINTS.map((s) => ({ id: s.id, label: s.title })),
  { id: "outcome-types", label: "Outcome types" },
  { id: "coin-mapping", label: "Coin ID mapping" },
  { id: "hip4-ws-block", label: "WebSocket" },
  ...HIP4_WS_EXAMPLES.map((s) => ({ id: s.id, label: s.title })),
];
