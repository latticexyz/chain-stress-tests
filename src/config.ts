// See https://github.com/latticexyz/stressoor.js/blob/main/src/Core.ts

const maxTps = 10;

export const config = {
  rpcUrl: {
    http: undefined,
    websocket: undefined,
  },
  network: {
    chainId: undefined,
    name: "unknown",
  },
  faucetPrivateKey: undefined,
  log: true,
  async: true,
  gasPrice: 100,
  maxNAddr: 10,
  txDelayMs: Math.ceil(1000 / maxTps),
  seed: 0,
};
