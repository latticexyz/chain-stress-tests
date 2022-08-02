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

import { newFaucetWallet, genWalletFundInit } from "./utils/utils";
import { reports } from "./utils/reportStack";

export async function main(config: any): Promise<any> {
  const nTx: number = config.nTx;

  const testSeed: number = config.seed;
  const testSeedHex: string = config.seed.toString(16);

  const nAddr: number = Math.min(nTx, config.maxNAddr);
  const addrFunding: number = Math.ceil(nTx / nAddr) * 21001 * config.gasPrice;

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

  const paramsFunc: ParamsFunc = (testContext, txContext) => {
    return {
      to: faucet.address,
      value: 1,
      gasLimit: 21000,
      gasPrice: testContext.gasPrice,
    };
  };

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
}
