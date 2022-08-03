const maxTps = 10;

export const config = {
  rpcUrl: {
    http: "http://localhost:8545",
    websocket: "ws://localhost:8546",
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
