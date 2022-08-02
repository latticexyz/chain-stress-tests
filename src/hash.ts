import {
  ParamsFunc,
  WebSocketProvider,
  TestContext,
} from "@latticexyz/stressoor";
import { Contract } from "@ethersproject/contracts";
import { genStdTest, InitFunc } from "./stdtest";

const HASHER_ADDRESS = "0x34140d2716bf37a4f6b57907cf295845b2bd69ba";
const HASH_SIGN = "hash(uint256)";
const HASHER_ABI = [`function ${HASH_SIGN}`];

const N_HASHES_TX = 1;
const GAS_LIMIT = 26713 + 200 * (N_HASHES_TX - 1);

let contract: Contract;

const initFunc: InitFunc = async (
  provider: WebSocketProvider,
  testContext: TestContext
) => {
  contract = new Contract(HASHER_ADDRESS, HASHER_ABI, provider);
};

const paramsFunc: ParamsFunc = async (testContext, txContext) => {
  const tx = await contract.populateTransaction.hash(N_HASHES_TX, {
    gasLimit: GAS_LIMIT,
    gasPrice: testContext.gasPrice,
  });
  return tx;
};

export const main = genStdTest(paramsFunc, initFunc, GAS_LIMIT, 0);
