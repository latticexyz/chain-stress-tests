import {
  runStressTest,
  JsonRpcProvider,
  Wallet,
  StressFunc,
  ParamsFunc,
  CallFunc,
  MetricsFunc,
  TestContext,
  Prefabs,
} from "@latticexyz/stressoor";

const { initHotNonce } = Prefabs.Init;

import { newProvider, newFaucetWallet, genWalletFundInit } from "./utils";
import { reports } from "./reportStack";

export type InitFunc = (
  provider: JsonRpcProvider,
  testContext: TestContext
) => Promise<void>;

export function genStdTest(
  initFunc: InitFunc,
  paramsFunc: ParamsFunc,
  callFunc: CallFunc,
  metricsFunc: MetricsFunc,
  gasLimit: number,
  txCost: number
) {
  return async function main(config: any): Promise<any> {
    /**
     * testSeed is used to generate the faucet and stressor.js wallets.
     * Running two stress-tests with the same seed at the same time would lead to issues
     * as they would send transactions from the same addresses and cause nonce collisions.
     */
    const testSeed: number = config.seed;
    const testSeedHex: string = config.seed.toString(16);

    const nCalls: number = config.nCalls;
    const nWallets: number = Math.min(nCalls, config.maxNWallets);
    const walletFunding: number =
      // We hard-code a margin because we might have to pay for L1 costs
      // TODO: make this cleaner
      1e12 + Math.ceil(nCalls / nWallets) * gasLimit * config.gasPrice + txCost;

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
       * faucet -> wallets
       */
      faucet = new Wallet(config.faucetPrivateKey, provider);
    } else {
      /**
       * sub-faucet -> wallets
       * Use yarn fund to fund sub-faucets
       * We use sub-faucets to avoid nonce collisions if we are running
       * multiple independent tests simultaneously.
       */
      faucet = newFaucetWallet(testSeedHex, provider, testContext);
    }

    await faucet.initHotNonce();

    const faucetData: any = {
      address: faucet.address,
      walletFunding: walletFunding,
      nWallets: nWallets,
    };

    const fundWallet: StressFunc = genWalletFundInit(
      faucet,
      walletFunding,
      testContext
    );
    const initFuncs = [fundWallet, initHotNonce];

    // const callFunc: CallFunc = sendTransactionGetReceipt;
    // const metricsFunc: MetricsFunc = txInfo;

    const reportOutputs: any[] = await runStressTest(
      paramsFunc,
      callFunc,
      metricsFunc,
      reports,
      initFuncs,
      {
        rpcProvider: provider,
        nWallets: nWallets,
        walletGenSeed: testSeedHex,
      },
      {
        nCalls: nCalls,
        async: config.async,
        callDelayMs: config.callDelayMs,
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
