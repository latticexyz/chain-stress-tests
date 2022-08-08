import {
  ParamsFunc,
  WebSocketProvider,
  JsonRpcProvider,
  TestContext,
  Prefabs,
  MetricsFunc,
} from "@latticexyz/stressoor";
import { genStdTest, InitFunc } from "./stdtest";

const { sendTransactionGetReceipt } = Prefabs.Call;
const { txInfo } = Prefabs.Metrics;

const L2_WS_RPC_URL = "";
const GAS_LIMIT: number = 50000;

let l2Provider: JsonRpcProvider;
let tx: any;

const initFunc: InitFunc = async (
  provider: JsonRpcProvider,
  testContext: TestContext
) => {
  tx = {
    to: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    value: 1,
    gasLimit: GAS_LIMIT,
    gasPrice: testContext.gasPrice,
  };
  l2Provider = new WebSocketProvider(L2_WS_RPC_URL);
};

const paramsFunc: ParamsFunc = async (callContext, testContext) => {
  return tx;
};

const metricsFunc: MetricsFunc = async (
  callFunc,
  params,
  callContext,
  testContext
) => {
  const prevBalance = await l2Provider.getBalance(callContext.wallet.address);
  const info = await txInfo(callFunc, params, callContext, testContext);
  await new Promise((resolve) => setTimeout(resolve, 45 * 1000));
  const currBalance = await l2Provider.getBalance(callContext.wallet.address);
  info.l2Success = currBalance.sub(prevBalance).eq(1) ? 1 : 0;
  return info;
};

export const main = genStdTest(
  initFunc,
  paramsFunc,
  sendTransactionGetReceipt,
  metricsFunc,
  GAS_LIMIT,
  1
);
