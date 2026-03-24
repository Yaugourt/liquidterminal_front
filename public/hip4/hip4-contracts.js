/**
 * Shared HIP-4 testnet deployment metadata for dashboard scripts (V1 + V2).
 */
(function () {
  window.HIP4_CONFIG = {
    chainId: 998,
    rpc: "https://rpc.hyperliquid-testnet.xyz/evm",
    contestCreatedTopic:
      "0x4093d35f3fc3bca9a1883a4abb54061b542732f2edc3a6c1ef95f416f69a1062",
    /** eth_call selector for merkle root getter (both deployments use this slot) */
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
  };
})();
