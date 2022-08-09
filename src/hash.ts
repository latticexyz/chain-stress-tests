import {
  ParamsFunc,
  JsonRpcProvider,
  TestContext,
  Prefabs,
} from "@latticexyz/stressoor";
import { Contract } from "@ethersproject/contracts";
import { genStdTest, InitFunc } from "./stdtest";

import HASHER_OUT from "../contracts/out/Hasher.sol/Hasher.json";

const { sendTransactionGetReceipt } = Prefabs.Call;
const { txInfo } = Prefabs.Metrics;

// Contract constants
const HASHER_ADDRESS = "0x34140d2716bf37a4f6b57907cf295845b2bd69ba";

// Number of hashes to compute per transaction
const N_HASHES_TX = 1; //
// Hard-coded gas limit
const GAS_LIMIT = 26713 + 200 * (N_HASHES_TX - 1);

let tx: any;

const initFunc: InitFunc = async (
  provider: JsonRpcProvider,
  testContext: TestContext
) => {
  const contract = new Contract(HASHER_ADDRESS, HASHER_OUT.abi, provider);
  // Craft the tx wallet.sendTransaction will be called with
  // callContext: { wallet, callIdx, walletIdx }
  tx = await contract.populateTransaction.hash(N_HASHES_TX, {
    gasLimit: GAS_LIMIT,
    gasPrice: testContext.gasPrice,
  });
};

const paramsFunc: ParamsFunc = async (callContext, testContext) => {
  return tx;
};

export const main = genStdTest(
  initFunc,
  paramsFunc,
  sendTransactionGetReceipt,
  txInfo,
  GAS_LIMIT,
  0
);
