/**
 * Curated identity for Hyperliquid builder-code operators.
 *
 * The indexer only knows the raw builder code a team registered on-chain
 * (`PURPS`, `MMCSI`, `1KREF`…), which tells a reader nothing. This maps the
 * builder address to the brand actually behind it, plus a logo.
 *
 * Logos are served from our own R2 bucket. Two provenances, both first-party:
 *   - `projects/logos/*` — already curated in the ecosystem directory;
 *   - `builders/logos/*` — pulled from the brand's own site (apple-touch-icon
 *     or declared favicon), squared to 128px, seeded by
 *     `LiquidTerminal_Back/scripts/builder-logos/`.
 *
 * Adding a builder: upload with that script, then add one line here. A builder
 * absent from this table keeps the generated initial avatar — never guess a
 * brand, a wrong logo is worse than no logo.
 */

const R2 = "https://pub-097cebbc75d04a3fbd5d0e416820c1a5.r2.dev";

export interface BuilderBrand {
  /** Human-readable brand, shown instead of the raw builder code. */
  name: string;
  /** R2 key, relative to the bucket root. */
  logo: string;
}

/** Keyed by lowercase builder address. */
const BUILDER_BRANDS: Record<string, BuilderBrand> = {
  "0x53a1954188fc9bf2edb45b94450100507b92fcd1": { name: "Atomic Wallet", logo: "builders/logos/0x53a1954188fc9bf2edb45b94450100507b92fcd1-e910c180.png" },
  "0x1cc34f6af34653c515b47a83e1de70ba9b0cda1f": { name: "Axiom", logo: "builders/logos/0x1cc34f6af34653c515b47a83e1de70ba9b0cda1f-aff911ac.png" },
  "0x4a649fa98072c21d59fcef68e955f23be6b8dfdb": { name: "Azali", logo: "builders/logos/0x4a649fa98072c21d59fcef68e955f23be6b8dfdb-a2a44542.png" },
  "0x1924b8561eef20e70ede628a296175d358be80e5": { name: "Based App", logo: "projects/logos/based.jpg" },
  "0xdbc27ea7aa99274026404b2fa21114815d9997a6": { name: "Blockchain.com", logo: "builders/logos/0xdbc27ea7aa99274026404b2fa21114815d9997a6-341f7081.png" },
  "0x74c362cd3a141769f38c48d66ee51b1938ea4bd0": { name: "Borsa", logo: "builders/logos/0x74c362cd3a141769f38c48d66ee51b1938ea4bd0-d5d1d2b7.png" },
  "0x4c8731897503f86a2643959cbaa1e075e84babb7": { name: "Bullpen", logo: "projects/logos/bullpen.jpg" },
  "0x3342ee6851ef0ec3cf42658c2be3b28a905271aa": { name: "Coin98", logo: "projects/logos/coin98-super-wallet-f51072f4.jpg" },
  "0xe9935bb291ab3603b4d7862e6f19315f759aa3a4": { name: "Coinpilot", logo: "projects/logos/coinpilot.jpg" },
  "0x008adf65b8c404e8bba73f18671306066643761f": { name: "cro.trade", logo: "builders/logos/0x008adf65b8c404e8bba73f18671306066643761f-1b6bee19.png" },
  "0xb977b6625dfe3d26eefa4ac6f99ada6546586962": { name: "Cwallet", logo: "builders/logos/0xb977b6625dfe3d26eefa4ac6f99ada6546586962-f2e3c64a.png" },
  "0x40e9d9feba3df27e1fb9a924264bf775230d5260": { name: "DeFi Saver", logo: "builders/logos/0x40e9d9feba3df27e1fb9a924264bf775230d5260-814896dd.png" },
  "0x1922810825c90f4270048b96da7b1803cd8609ef": { name: "Defi App", logo: "builders/logos/0x1922810825c90f4270048b96da7b1803cd8609ef-3924c246.png" },
  "0x7975cafdff839ed5047244ed3a0dd82a89866081": { name: "Dexari", logo: "projects/logos/dexari.png" },
  "0x22047776933bc123d0602ed17aaf0d2f5647df0c": { name: "Dexly", logo: "builders/logos/0x22047776933bc123d0602ed17aaf0d2f5647df0c-8a5624a4.png" },
  "0x4950994884602d1b6c6d96e4fe30f58205c39395": { name: "Dreamcash", logo: "projects/logos/dreamcash.jpg" },
  "0x831ad7eb3e600a3ab8df851ce27df8d8dd6b5d9c": { name: "EchoSync", logo: "builders/logos/0x831ad7eb3e600a3ab8df851ce27df8d8dd6b5d9c-ac9af08a.png" },
  "0xb838e4d1c8bcf71fa8e63299d5aa3258c83d6adb": { name: "fomo", logo: "builders/logos/0xb838e4d1c8bcf71fa8e63299d5aa3258c83d6adb-b66664a3.png" },
  "0x2a2b6b093a9813fbd8cddae800c3d17d46460d17": { name: "fomo", logo: "builders/logos/0x2a2b6b093a9813fbd8cddae800c3d17d46460d17-b66664a3.png" },
  "0x0d9dab1a248f63b0a48965ba8435e4de7497a3dc": { name: "Gem Wallet", logo: "projects/logos/gemwallet.jpg" },
  "0x43f2dc9fd6ce4ee15ae5525a97211fe229d5d140": { name: "Golden Pig", logo: "builders/logos/0x43f2dc9fd6ce4ee15ae5525a97211fe229d5d140-a3437073.png" },
  "0x5ef4deeb76f87d979d0ddc8c51f5b4f65d1c972a": { name: "gtr.trade", logo: "projects/logos/gtr-trade-2ba302b8.jpg" },
  "0x52d8b948e300bd30097af941e937837e6fbb7a8a": { name: "HLbot", logo: "projects/logos/hlbot-53059311.avif" },
  "0xe966a12bf7b93838096e4519a684519ab22df618": { name: "HyperDash", logo: "projects/logos/hypurrdash.jpg" },
  "0x8af3545a3988b7a46f96f9f1ae40c0e64fa493c2": { name: "HyperSignals", logo: "projects/logos/hypersignals.jpg" },
  "0xc74812f67eddaf2f3aed6e061eaa9168b36d7ea1": { name: "HyperX", logo: "projects/logos/hyperx-98eff76a.png" },
  "0x70cf605bb180daf00c3e2f1ca3df5bb602664452": { name: "HyprEarn", logo: "projects/logos/hyprearn-31eb4049.jpg" },
  "0xcf56dd84ed85eb4929e0a76a0f2f04049b4ffc1a": { name: "Infinex", logo: "builders/logos/0xcf56dd84ed85eb4929e0a76a0f2f04049b4ffc1a-e85b6a6a.png" },
  "0x2868fc0d9786a740b491577a43502259efa78a39": { name: "Insilico Terminal", logo: "projects/logos/InsilicoTerminal.jpg" },
  "0x557edb253b1d7ed5f15b248a5a3fd919fa5d3c81": { name: "Invo", logo: "builders/logos/0x557edb253b1d7ed5f15b248a5a3fd919fa5d3c81-d73f1763.png" },
  "0x786a53cbf73dd90fd6f2b4cf9514b60c8411dca7": { name: "Jester", logo: "builders/logos/0x786a53cbf73dd90fd6f2b4cf9514b60c8411dca7-5a829f5c.png" },
  "0x4e65de9ca0abe3d36f7e3d7a7ce9f0dbe406a412": { name: "Legend Trade", logo: "projects/logos/legend-trade-e155a10e.jpg" },
  "0x7e1830b1796b01f2f6a7118d50d4d02491421f32": { name: "Liminal", logo: "projects/logos/liminal.jpg" },
  "0x746337a98821e1e38aa2bad0e77900d98b80609e": { name: "Limits.trade", logo: "projects/logos/limits-trade-371179b9.png" },
  "0x6d4e7f472e6a491b98cbeed327417e310ae8ce48": { name: "Liquid", logo: "projects/logos/liquid-1310e6bf.jpg" },
  "0x24a747628494231347f4f6aead2ec14f50bcc8b7": { name: "Lit", logo: "builders/logos/0x24a747628494231347f4f6aead2ec14f50bcc8b7-3f354718.png" },
  "0x3e0ef9ad4096c30acefbf7a996f4c19edd071286": { name: "Lootbase", logo: "projects/logos/lootbase.jpg" },
  "0x2af94a24e1f744a8e251b4996283ffb4657e915d": { name: "Markets Mobile", logo: "builders/logos/0x2af94a24e1f744a8e251b4996283ffb4657e915d-17f9d519.png" },
  "0x42f3226007290b02c5a0b15bccbb1ba6df04f992": { name: "Markets Terminal", logo: "builders/logos/0x42f3226007290b02c5a0b15bccbb1ba6df04f992-17f9d519.png" },
  "0xf944069b489f1ebff4c3c6a6014d58cbef7c7009": { name: "Mass", logo: "builders/logos/0xf944069b489f1ebff4c3c6a6014d58cbef7c7009-4f81e691.svg" },
  "0xe95a5e31904e005066614247d309e00d8ad753aa": { name: "MetaMask", logo: "projects/logos/metamask-925e8c1e.png" },
  "0xea2c82b5aba243ab631c0ce151763d5e38df75b3": { name: "MetaMask", logo: "projects/logos/metamask-925e8c1e.png" },
  "0x5a3bc60b0a99a7f4fbf0d15554fa5fe88e7628c2": { name: "Minara AI", logo: "builders/logos/0x5a3bc60b0a99a7f4fbf0d15554fa5fe88e7628c2-183128a4.png" },
  "0x5eb46bfbf7c6004b59d67e56749e89e83c2caf82": { name: "Miracle", logo: "builders/logos/0x5eb46bfbf7c6004b59d67e56749e89e83c2caf82-2c4202af.png" },
  "0xb84c7fb41ee7d8781e2b0d59eed2accd2ae99533": { name: "Moonbot", logo: "builders/logos/0xb84c7fb41ee7d8781e2b0d59eed2accd2ae99533-5cc0ddda.png" },
  "0x93053f1e7a5efeda532fe69cbbe43cbec3a0f13f": { name: "Nansen", logo: "projects/logos/nansen.jpg" },
  "0xf85a61857c0682b9b59d562310df106b4f785688": { name: "near.com", logo: "builders/logos/0xf85a61857c0682b9b59d562310df106b4f785688-78a4af48.png" },
  "0x05984fd37db96dc2a11a09519a8def556e80590b": { name: "Okto", logo: "builders/logos/0x05984fd37db96dc2a11a09519a8def556e80590b-45caa981.png" },
  "0x4fe1141b9066f3777f4bd4d4ac9d216173031dc1": { name: "Okto", logo: "builders/logos/0x4fe1141b9066f3777f4bd4d4ac9d216173031dc1-45caa981.png" },
  "0xd637f2a36c1a3b37d57ef4c7022cb183d8922f2c": { name: "Oku Trade", logo: "builders/logos/0xd637f2a36c1a3b37d57ef4c7022cb183d8922f2c-3d08457f.png" },
  "0x9b12e858da780a96876e3018780cf0d83359b0bb": { name: "OneKey", logo: "builders/logos/0x9b12e858da780a96876e3018780cf0d83359b0bb-84117f5e.png" },
  "0x4b2aec4f91612849d6e20c9c1881fabb1a48cd12": { name: "OpenPond AI", logo: "builders/logos/0x4b2aec4f91612849d6e20c9c1881fabb1a48cd12-bba75859.png" },
  "0x9b451f8941240db8bedc99bff8917a2ed9550074": { name: "Origami Tech", logo: "builders/logos/0x9b451f8941240db8bedc99bff8917a2ed9550074-fcaee061.svg" },
  "0xa47d4d99191db54a4829cdf3de2417e527c3b042": { name: "Pear Protocol", logo: "projects/logos/pearprotocol.jpg" },
  "0xb84168cf3be63c6b8dad05ff5d755e97432ff80b": { name: "Phantom", logo: "projects/logos/phantom.jpg" },
  "0x151e3af3c2387a2138ccc684d1d1d78277db68a9": { name: "PulseTrader", logo: "projects/logos/pulsetrader-f2901d90.jpg" },
  "0x0cbf655b0d22ae71fba3a674b0e1c0c7e7f975af": { name: "pvp.trade", logo: "projects/logos/Pvptrade.jpg" },
  "0xad9be64fd7a35d99a138b87cb212baefbcdcf045": { name: "Rabby", logo: "builders/logos/0xad9be64fd7a35d99a138b87cb212baefbcdcf045-e1f96435.png" },
  "0x60dc8e3dad2e4e0738e813b9cb09b9c00b5e0fc9": { name: "Rainbow", logo: "builders/logos/0x60dc8e3dad2e4e0738e813b9cb09b9c00b5e0fc9-5c741968.png" },
  "0xd58ee5dc9cb03df60843c6234644aa535b08a8b9": { name: "SendAI", logo: "builders/logos/0xd58ee5dc9cb03df60843c6234644aa535b08a8b9-c230745c.png" },
  "0x1368f4311db5807f7c7924d736adaeb83e47bafe": { name: "Senpi.ai", logo: "projects/logos/senpi-ai-463bb4ac.jpg" },
  "0x5d2c2bd98f10616771d7b5124ad2090ba72aa43c": { name: "Silhouette", logo: "projects/logos/silhouette-e0a8f326.avif" },
  "0x3f24962739e6d703942dc2456e7c51c8d0ca4b70": { name: "Splash Wallet", logo: "builders/logos/0x3f24962739e6d703942dc2456e7c51c8d0ca4b70-c8f21f77.png" },
  "0xcdb943570bcb48a6f1d3228d0175598fea19e87b": { name: "Superstack", logo: "projects/logos/superstack-997f725f.jpg" },
  "0x4ecd58def11dc3cadf7deb09f27da69d5475acb3": { name: "SuperX", logo: "projects/logos/superx.jpg" },
  "0x36be02a397e969e010ccbd7333f4169f66b8989f": { name: "Supurr", logo: "projects/logos/supurr.jpg" },
  "0x12ee177db3ceafedc639d023a29cc8588db3a4b9": { name: "SushiSwap", logo: "builders/logos/0x12ee177db3ceafedc639d023a29cc8588db3a4b9-62376a1c.png" },
  "0xa9300365e8f6d0112a756c98f9acfc3543b295c0": { name: "Trasia", logo: "builders/logos/0xa9300365e8f6d0112a756c98f9acfc3543b295c0-caa6b94a.png" },
  "0x999a4b5f268a8fbf33736feff360d462ad248dbf": { name: "tread.fi", logo: "projects/logos/tread-fi-bc1dda5f.png" },
  "0x9f83fe01f4a62d44e8ca471e2eeb42b5c05531d9": { name: "Tria", logo: "builders/logos/0x9f83fe01f4a62d44e8ca471e2eeb42b5c05531d9-12569616.png" },
  "0x30599f69164b854a2c10ada95e5cd219b72d5216": { name: "TrueNorth", logo: "builders/logos/0x30599f69164b854a2c10ada95e5cd219b72d5216-9171f253.png" },
  "0x5af1b5f44207784dcb850bbb4143c5dcd1885f71": { name: "Trust Wallet", logo: "builders/logos/0x5af1b5f44207784dcb850bbb4143c5dcd1885f71-b9defee9.png" },
  "0x2e266a0f40e9f5bca48f5df1686aab10b1b68ec8": { name: "UXUY", logo: "builders/logos/0x2e266a0f40e9f5bca48f5df1686aab10b1b68ec8-3b9885c3.png" },
  "0x5d3551942be7630a9b988a32208ac9c1d1a49ce6": { name: "Velo", logo: "projects/logos/velo-aba792a5.jpg" },
  "0x891dc6f05ad47a3c1a05da55e7a7517971faaf0d": { name: "VergeX", logo: "builders/logos/0x891dc6f05ad47a3c1a05da55e7a7517971faaf0d-f2254fef.svg" },
  "0x68c68ba58f50bdbe5c4a6faf0186b140eab2b764": { name: "Wallet V", logo: "projects/logos/walletv.jpg" },
  "0x75982eb8b734b24b653b39e308489a428041f162": { name: "WunderTrading", logo: "builders/logos/0x75982eb8b734b24b653b39e308489a428041f162-e94fefa0.png" },
  "0x0c322f69ab8d0544be3cfd54424762a4251806c5": { name: "XBIT", logo: "builders/logos/0x0c322f69ab8d0544be3cfd54424762a4251806c5-b92cd0b3.png" },
};

/** Absolute logo URL for a known builder, `null` when we have no curated brand. */
export function builderLogoUrl(address: string): string | null {
  const brand = BUILDER_BRANDS[address.toLowerCase()];
  return brand ? `${R2}/${brand.logo}` : null;
}

/** Curated brand for a builder address, `null` when unknown. */
export function builderBrand(address: string): BuilderBrand | null {
  return BUILDER_BRANDS[address.toLowerCase()] ?? null;
}

/** How many builders carry a curated identity — surfaced in the page footnote. */
export const BUILDER_BRAND_COUNT = Object.keys(BUILDER_BRANDS).length;
