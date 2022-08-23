import {
  ParamsFunc,
  JsonRpcProvider,
  TestContext,
  Prefabs,
} from "@latticexyz/stressoor";
import { Contract } from "@ethersproject/contracts";
import { defaultAbiCoder as abi } from "@ethersproject/abi";
import { genStdTest, InitFunc } from "./stdtest";

const { sendTransactionGetReceipt } = Prefabs.Call;
const { txInfo } = Prefabs.Metrics;

// Constants
const WORLD_ABI = [
  "function registerComponentValueSet(address, uint256, bytes)",
];
const WORLD_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const POS_COMPONENT_ADDRESS = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0";
const TYPE_COMPONENT_ADDRESS = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9";
// Hard-coded gas limit
const GAS_LIMIT = 250000;

const BOX_POS = [128, 0, 4];
const BOX_SIZE = [1, 1, 1];

function random(to: number, from = 0): number {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}

let contract: Contract;

const initFunc: InitFunc = async (
  provider: JsonRpcProvider,
  testContext: TestContext
) => {
  contract = new Contract(WORLD_ADDRESS, WORLD_ABI, provider);
};

const paramsFunc: ParamsFunc = async (callContext, testContext) => {
  let args: any[3];
  if (callContext.callIdx < testContext.nWallets) {
    args = [
      TYPE_COMPONENT_ADDRESS,
      callContext.walletIdx,
      abi.encode(["uint32"], [6]), // Stone
    ];
  } else {
    args = [
      POS_COMPONENT_ADDRESS,
      callContext.walletIdx,
      abi.encode(
        // x y z
        ["int32", "int32", "int32"],
        [
          random(BOX_POS[0], BOX_POS[0] + BOX_SIZE[0]),
          random(BOX_POS[1], BOX_POS[1] + BOX_SIZE[1]),
          random(BOX_POS[2], BOX_POS[2] + BOX_SIZE[2]),
        ]
      ),
    ];
  }
  return await contract.populateTransaction.registerComponentValueSet(...args, {
    gasLimit: GAS_LIMIT,
    gasPrice: testContext.gasPrice,
  });
};

export const main = genStdTest(
  initFunc,
  paramsFunc,
  sendTransactionGetReceipt,
  txInfo,
  GAS_LIMIT,
  0
);
