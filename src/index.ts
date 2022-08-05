import { Command } from "commander";

import { main as sendEth } from "./sendEth";
import { main as hash } from "./hash";
import { config as defaultConfig } from "./config";

// Add new stress tests here
const stressTests: Record<string, any> = { sendEth, hash };

// Spec command arguments and options
const program = new Command();
program
  .name("stress-test")
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

// Parse parameters and return { testName, config }
function getParams(): any {
  program.parse();
  const opts = program.opts();

  let seed;
  if (opts.seed === undefined) {
    if (process.env.SEED === undefined) {
      seed = defaultConfig.seed;
    } else {
      seed = process.env.SEED;
    }
  } else {
    seed = opts.seed;
  }

  return {
    testName: program.args[0],
    config: {
      rpcUrl: {
        http: defaultConfig.rpcUrl.http,
        websocket: opts.ws || defaultConfig.rpcUrl.websocket,
      },
      network: {
        chainId:
          opts.chainId === undefined
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
        opts.tps === undefined
          ? defaultConfig.txDelayMs
          : Math.ceil(1000 / opts.tps),
      seed: seed,
      nTx: Number(program.args[1]),
    },
  };
}

// Run a stress test and log the output
async function main() {
  const params = getParams();
  const stressTest = stressTests[params.testName];
  if (stressTest === undefined) {
    throw "not a test";
  }
  const config = params.config;
  // TODO: Raise error if data is missing
  const testOutput = await stressTest(config);
  const dataStr: string = JSON.stringify(testOutput, null, 4);
  // We add cues to make the logs easier to parse
  console.log("[outputstart]" + dataStr + "[outputend]");
}

main().then(() => process.exit());
