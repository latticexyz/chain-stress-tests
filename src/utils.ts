import {
  TestContext,
  Wallet,
  JsonRpcProvider,
  WebSocketProvider,
  Prefabs,
  TxContext,
  ShootFunc,
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
  addrFunding: number, // Funding to transfer to every new faucet
  testContext: TestContext
): ShootFunc {
  const fundWalletInit: ShootFunc = async (
    wallet: Wallet,
    txIdx: number,
    addrIdx: number
  ) => {
    const txContext: TxContext = {
      wallet: faucet,
      txIdx: txIdx,
      addrIdx: addrIdx,
    };
    await sendTransactionGetReceipt(
      {
        to: wallet.address,
        value: addrFunding,
        gasLimit: 21000,
        gasPrice: testContext.gasPrice,
      },
      testContext,
      txContext
    );
  };
  return fundWalletInit;
}
