import { Command } from "commander";

import { main as sendEth } from "./sendEth";
import { config as defaultConfig } from "./config";

const stressTests: Record<string, any> = { sendEth };

const program = new Command();

program
  .name("chain-stress-test")
  .description("run a stressoor.js stress test on a chain")
  .argument("<test>", "name of the test to run e.g., sendEth")
  .argument("<nTx>", "number of transactions")
  .option("-w, --ws <string>", "websocket rpc url")
  .option("-h, --http <string>", "json rpc url")
  .option("-c, --chainId <number>", "chain ID")
  .option("-k, --pKey <string>", "faucet private key")
  .option("-g, --gasPrice <number>", "gas price")
  .option("-n, --nAddr <number>", "max number of addresses")
  .option("-t, --tps <number>", "max tps")
  .option("-s, --seed <number>", "seed");

function getParams(): any {
  program.parse();
  const opts = program.opts();
  return {
    testName: program.args[0],
    config: {
      rpcUrl: {
        http: defaultConfig.rpcUrl.http,
        websocket: opts.ws || defaultConfig.rpcUrl.websocket,
      },
      network: {
        chainId:
          opts.chainId == undefined
            ? defaultConfig.network.chainId
            : Number(opts.chainId),
        name: "unknown",
      },
      faucetPrivateKey: opts.pKey || defaultConfig.faucetPrivateKey,
      log: defaultConfig.log,
      async: defaultConfig.async,
      gasPrice: Number(opts.gasPrice) || defaultConfig.gasPrice,
      maxNAddr: Number(opts.nAddr) || defaultConfig.maxNAddr,
      txDelayMs:
        opts.tps == undefined
          ? defaultConfig.txDelayMs
          : Math.ceil(1000 / opts.tps),
      seed: opts.seed == undefined ? defaultConfig.seed : opts.seed,
      nTx: Number(program.args[1]),
    },
  };
}

async function main() {
  const params = getParams();
  const stressTest = stressTests[params.testName];
  if (stressTest == undefined) {
    throw "not a test";
  }
  const config = params.config;
  const testOutput = await stressTest(config);
  const dataStr: string = JSON.stringify(testOutput, null, 4);
  console.log("[outputstart]" + dataStr + "[outputend]");
}

main().then(() => process.exit());
