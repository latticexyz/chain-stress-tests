import {
  ParamsFunc,
  JsonRpcProvider,
  TestContext,
  Prefabs,
} from "@latticexyz/stressoor";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import { randomBytes } from "@ethersproject/random";
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

const BOX_POS = [112, 0, 0];
const BOX_SIZE = [48, 0, 48];

const DELTA = 0;
const ENTITY_ID_0 = BigNumber.from(randomBytes(32));

function random(to: number, from = 0): number {
  return Math.floor(Math.random() * (to - from + 1)) + from;
}

function tower(nn: number, boxPos: number[], boxSize: number[]): number[] {
  const levelSize = (boxSize[0] + boxSize[2]) * 2 - 4;
  let x, y, z;
  y = boxPos[1] + Math.floor(nn / levelSize);
  nn = nn % levelSize;
  const [l0, l1, l2] = [
    boxSize[0] - 1,
    boxSize[0] + boxSize[2] - 2,
    2 * boxSize[0] + boxSize[2] - 3,
  ];
  if (nn < l0) {
    x = boxPos[0] + nn;
    z = boxPos[2];
  } else if (nn < l1) {
    x = boxPos[0] + boxSize[0] - 1;
    z = boxPos[2] + (nn % l0);
  } else if (nn < l2) {
    x = boxPos[0] + boxSize[0] - (nn % l1) - 1;
    z = boxPos[2] + boxSize[2] - 1;
  } else {
    x = boxPos[0];
    z = boxPos[2] + boxSize[2] - (nn % l2) - 1;
  }
  return [x, y, z];
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
  const nEntities = testContext.nCalls / 2;
  const entityIdx = (callContext.callIdx % nEntities) + DELTA;
  const entityId = ENTITY_ID_0.add(entityIdx);
  if (callContext.callIdx < nEntities) {
    args = [
      TYPE_COMPONENT_ADDRESS,
      entityId,
      abi.encode(["uint32"], [6]), // Stone
    ];
  } else {
    args = [
      POS_COMPONENT_ADDRESS,
      entityId,
      abi.encode(
        // x y z
        ["int32", "int32", "int32"],
        // [
        //   random(BOX_POS[0], BOX_POS[0] + BOX_SIZE[0]),
        //   random(BOX_POS[1], BOX_POS[1] + BOX_SIZE[1]),
        //   random(BOX_POS[2], BOX_POS[2] + BOX_SIZE[2]),
        // ]
        tower(entityIdx, BOX_POS, BOX_SIZE)
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
