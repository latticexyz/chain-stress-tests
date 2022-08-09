import {
  ParamsFunc,
  WebSocketProvider,
  JsonRpcProvider,
  TestContext,
  Prefabs,
  MetricsFunc,
} from "@latticexyz/stressoor";
import { Contract } from "@ethersproject/contracts";
import { genStdTest, InitFunc } from "./stdtest";

import HASHER_OUT from "../contracts/out/Hasher.sol/Hasher.json";

const { sendTransactionGetReceipt } = Prefabs.Call;
const { txInfo } = Prefabs.Metrics;

const L2_WS_RPC_URL = "";

// Contract constants
const HASHER_ADDRESS = "0x5Ffe31E4676D3466268e28a75E51d1eFa4298620";
const N_HASHES_TX = 1;
// const HASH_GAS_LIMIT = 26713 + 200 * (N_HASHES_TX - 1);
const HASH_GAS_LIMIT = 1000000;

const PORTAL_ADDRESS = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";
const DEP_TX_SIGN = "depositTransaction(address, uint256, uint64, bool, bytes)";
const PORTAL_ABI = [`function ${DEP_TX_SIGN}`];
const PORTAL_GAS_LIMIT = 50000;

let l2Provider: JsonRpcProvider;
let tx: any;
let hasherContract: Contract;

const initFunc: InitFunc = async (
  provider: JsonRpcProvider,
  testContext: TestContext
) => {
  l2Provider = new WebSocketProvider(L2_WS_RPC_URL);
  hasherContract = new Contract(HASHER_ADDRESS, HASHER_OUT.abi, l2Provider);
  const portalContract = new Contract(PORTAL_ADDRESS, PORTAL_ABI, provider);
  const l2Tx = await hasherContract.populateTransaction.hash(N_HASHES_TX);
  tx = await portalContract.populateTransaction.depositTransaction(
    HASHER_ADDRESS,
    0,
    HASH_GAS_LIMIT,
    false,
    l2Tx.data,
    {
      value: 0,
      gasLimit: PORTAL_GAS_LIMIT,
      gasPrice: testContext.gasPrice,
    }
  );
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
  const prevHash = await hasherContract.getHash();
  const info = await txInfo(callFunc, params, callContext, testContext);
  await new Promise((resolve) => setTimeout(resolve, 45 * 1000));
  const currHash = await hasherContract.getHash();
  info.l2Success = currHash !== prevHash ? 1 : 0;
  return info;
};

export const main = genStdTest(
  initFunc,
  paramsFunc,
  sendTransactionGetReceipt,
  metricsFunc,
  PORTAL_GAS_LIMIT,
  0
);
