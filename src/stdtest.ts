import {
  runStressTest,
  WebSocketProvider,
  Wallet,
  ShootFunc,
  ParamsFunc,
  CallFunc,
  MetricsFunc,
  TestContext,
  Prefabs,
} from "@latticexyz/stressoor";

const { sendTransactionGetReceipt } = Prefabs.Call;
const { txInfo } = Prefabs.Metrics;
const { initHotNonce } = Prefabs.Init;

import { newFaucetWallet, genWalletFundInit } from "./utils";
import { reports } from "./reportStack";

export type InitFunc = (
  provider: WebSocketProvider,
  testContext: TestContext
) => Promise<void>;

export function genStdTest(
  paramsFunc: ParamsFunc,
  initFunc: InitFunc,
  gasLimit: number,
  txCost: number
) {
  return async function main(config: any): Promise<any> {
    const nTx: number = config.nTx;

    /**
     * testSeed is used to generate the faucet and stressor.js addresses.
     * Running two stress-tests with the same seed at the same time would lead to issues
     * as they would send transactions from the same addresses and cause nonce collisions.
     */
    const testSeed: number = config.seed;
    const testSeedHex: string = config.seed.toString(16);

    const nAddr: number = Math.min(nTx, config.maxNAddr);
    const addrFunding: number =
      // We hard-code a margin because we might have to pay for L1 costs
      // TODO: make this cleaner
      50000
        + Math.ceil(nTx / nAddr) * gasLimit * config.gasPrice + txCost;

    const testContext: TestContext = {
      id: testSeed,
      nTx: nTx,
      nAddr: nAddr,
      log: config.log,
      gasPrice: config.gasPrice,
    };

    const provider: WebSocketProvider = new WebSocketProvider(
      config.rpcUrl.websocket,
      config.network
    );

    await provider.getBlockNumber();

    await initFunc(provider, testContext);

    let faucet: Wallet;

    if (testSeed == 0) {
      faucet = new Wallet(config.faucetPrivateKey, provider);
    } else {
      faucet = newFaucetWallet(testSeedHex, provider, testContext);
    }

    await faucet.initHotNonce();

    const fundWallet: ShootFunc = genWalletFundInit(
      faucet,
      addrFunding,
      testContext
    );
    const initFuncs = [fundWallet, initHotNonce];

    const callFunc: CallFunc = sendTransactionGetReceipt;
    const metricsFunc: MetricsFunc = txInfo;

    const otherParams: any = {
      async: config.async,
      nAddr: nAddr,
      nTx: nTx,
      txDelayMs: config.txDelayMs,
      roundDelayMs: 0,
    };

    const reportOutputs: any[] = await runStressTest(
      provider,
      paramsFunc,
      callFunc,
      metricsFunc,
      reports,
      initFuncs,
      otherParams.async,
      otherParams.nAddr,
      otherParams.nTx,
      otherParams.txDelayMs,
      otherParams.roundDelayMs,
      testSeedHex,
      testContext
    );

    delete config.faucetPrivateKey;

    return {
      reportOutputs,
      testContext,
      config,
      otherParams,
    };
  };
}
