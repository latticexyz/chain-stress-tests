import {
  ParamsFunc,
  JsonRpcProvider,
  TestContext,
} from "@latticexyz/stressoor";
import { genStdTest, InitFunc } from "./stdtest";

let tx: any;

const initFunc: InitFunc = async (
  provider: JsonRpcProvider,
  testContext: TestContext
) => {
  // Craft the tx wallet.sendTransaction will be called with
  tx = {
    to: "0x0000000000000000000000000000000000000000",
    value: 1,
    gasLimit: 21000,
    gasPrice: testContext.gasPrice,
  };
};

const paramsFunc: ParamsFunc = async (testContext, txContext) => {
  return tx;
};

export const main = genStdTest(paramsFunc, initFunc, 21000, 1);
