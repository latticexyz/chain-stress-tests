import {
  runStressTest,
  JsonRpcProvider,
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

import { newProvider, newFaucetWallet, genWalletFundInit } from "./utils";
import { reports } from "./reportStack";

export type InitFunc = (
  provider: JsonRpcProvider,
  testContext: TestContext
) => Promise<void>;

export function genStdTest(
  paramsFunc: ParamsFunc,
  initFunc: InitFunc,
  gasLimit: number,
  txCost: number
) {
  return async function main(config: any): Promise<any> {
    /**
     * testSeed is used to generate the faucet and stressor.js addresses.
     * Running two stress-tests with the same seed at the same time would lead to issues
     * as they would send transactions from the same addresses and cause nonce collisions.
     */
    const testSeed: number = config.seed;
    const testSeedHex: string = config.seed.toString(16);

    const nTx: number = config.nTx;
    const nAddr: number = Math.min(nTx, config.maxNAddr);
    const addrFunding: number =
      // We hard-code a margin because we might have to pay for L1 costs
      // TODO: make this cleaner
      1e12 + Math.ceil(nTx / nAddr) * gasLimit * config.gasPrice + txCost;

    const testContext: TestContext = {
      seed: testSeed,
      log: config.log,
      gasPrice: config.gasPrice,
    };

    let network: any = undefined;
    if (config.network.chainId !== undefined) network = config.network;
    let provider: JsonRpcProvider = newProvider(config);

    await initFunc(provider, testContext);

    let faucet: Wallet;

    if (testSeed == 0) {
      /**
       * faucet -> addresses
       */
      faucet = new Wallet(config.faucetPrivateKey, provider);
    } else {
      /**
       * sub-faucet -> addresses
       * Use yarn fund to fund sub-faucets
       * We use sub-faucets to avoid nonce collisions if we are running
       * multiple independent tests simultaneously.
       */
      faucet = newFaucetWallet(testSeedHex, provider, testContext);
    }

    await faucet.initHotNonce();

    const faucetData: any = {
      address: faucet.address,
      addrFunding: addrFunding,
      nAddr: nAddr,
    };

    const fundWallet: ShootFunc = genWalletFundInit(
      faucet,
      addrFunding,
      testContext
    );
    const initFuncs = [fundWallet, initHotNonce];

    const callFunc: CallFunc = sendTransactionGetReceipt;
    const metricsFunc: MetricsFunc = txInfo;

    const reportOutputs: any[] = await runStressTest(
      paramsFunc,
      callFunc,
      metricsFunc,
      reports,
      initFuncs,
      {
        rpcProvider: provider,
        nAddr: nAddr,
        addrGenSeed: testSeedHex,
      },
      {
        nTx: nTx,
        async: config.async,
        txDelayMs: config.txDelayMs,
        roundDelayMs: 0,
      },
      testContext
    );

    delete config.faucetPrivateKey;

    return {
      reportOutputs,
      testContext,
      config,
      faucetData,
    };
  };
}
