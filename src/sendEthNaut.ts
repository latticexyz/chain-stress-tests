import {
    ParamsFunc,
    JsonRpcProvider,
    TestContext,
    Prefabs,
  } from "@latticexyz/stressoor";
  import { genStdTest, InitFunc } from "./stdtest";
  
  const { sendTransactionGetReceipt } = Prefabs.Call;
  const { txInfo } = Prefabs.Metrics;
  
  let tx: any;
  
  const initFunc: InitFunc = async (
    provider: JsonRpcProvider,
    testContext: TestContext
  ) => {
    // Craft the tx wallet.sendTransaction will be called with
    tx = {
      to: "0x0000000000000000000000000000000000000000",
      value: 1,
      gasLimit: 2100000,
      gasPrice: testContext.gasPrice,
    };
  };
  
  const paramsFunc: ParamsFunc = async (callContext, testContext) => {
    return tx;
  };
  
  export const main = genStdTest(
    initFunc,
    paramsFunc,
    sendTransactionGetReceipt,
    txInfo,
    2100000,
    1, 
    true
  );
  