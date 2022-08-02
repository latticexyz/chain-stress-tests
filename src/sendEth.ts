import { ParamsFunc } from "@latticexyz/stressoor";
import { genStdTest } from "./stdtest";

const paramsFunc: ParamsFunc = async (testContext, txContext) => {
  return {
    to: "0x0000000000000000000000000000000000000000",
    value: 1,
    gasLimit: 21000,
    gasPrice: testContext.gasPrice,
  };
};

export const main = genStdTest(paramsFunc, async (p, t) => {}, 21000, 1);
