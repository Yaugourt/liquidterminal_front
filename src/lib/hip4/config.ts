/** HIP-4 HyperEVM mainnet deployment metadata (replaces public/hip4/hip4-contracts.js). */
export const HIP4_CONFIG = {
  chainId: 999,
  rpc: "https://rpc.hyperliquid.xyz/evm",
  contestCreatedTopic:
    "0x4093d35f3fc3bca9a1883a4abb54061b542732f2edc3a6c1ef95f416f69a1062",
  merkleRootSelector: "0x71c5ecb1",
  contracts: {
    v1: {
      label: "V1",
      address: "0x4fd772e5708da2a7f097f51b3127e515a72744bd",
      getPoolSelector: "0x2a658bdf",
    },
    v2: {
      label: "V2",
      address: "0x6d86b21e853758f5719408633e6bcb2cfd50cf07",
      getPoolSelector: "0x6692afd0",
    },
  },
  sameOwner: "0xe21c78037329d06fe0d6fefc4221aaa67cb0d135",
} as const;

export type Hip4DeploymentKey = keyof typeof HIP4_CONFIG.contracts;
