import {
  Wallet,
  JsonRpcProvider,
  WebSocketProvider,
  CallContext,
  TestContext,
  Prefabs,
  StressFunc,
} from "@latticexyz/stressoor";

const { sendTransactionGetReceipt } = Prefabs.Call;

const DEFAULT_KEY_PREFIX: string = "fff";

export function newProvider(config: any): JsonRpcProvider {
  if (config.rpcUrl.websocket === undefined) {
    return new JsonRpcProvider(config.rpcUrl.http);
  } else {
    return new WebSocketProvider(config.rpcUrl.websocket);
  }
}

export function genFaucetPrivateKey(
  seed: string,
  testContext: TestContext
): string {
  const keyPrefix =
    testContext.keyPrefix === undefined
      ? DEFAULT_KEY_PREFIX
      : testContext.keyPrefix;
  return "0xc8ee5e" + keyPrefix + seed.padStart(58 - keyPrefix.length, "0");
}

export function newFaucetWallet(
  seed: string,
  provider: JsonRpcProvider,
  testContext: TestContext
): Wallet {
  const pKey: string = genFaucetPrivateKey(seed, testContext);
  const faucet: Wallet = new Wallet(pKey, provider);
  return faucet;
}

// Generate a faucet-funding init function
export function genWalletFundInit(
  faucet: Wallet, // Super-funder wallet
  walletFunding: string, // Funding to transfer to every new faucet
  testContext: TestContext
): StressFunc {
  const fundWalletInit: StressFunc = async (
    wallet: Wallet,
    callIdx: number,
    walletIdx: number
  ) => {
    const callContext: CallContext = {
      wallet: faucet,
      callIdx: callIdx,
      walletIdx: walletIdx,
    };
    await sendTransactionGetReceipt(
      {
        to: wallet.address,
        value: walletFunding,
        gasLimit: 21000,
        gasPrice: testContext.gasPrice,
      },
      callContext,
      testContext
    );
  };
  return fundWalletInit;
}
