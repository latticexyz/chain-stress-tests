import { Command } from "commander";

import { main as sendEth } from "./sendEth";
import { main as sendEthNaut } from "./sendEthNaut";
import { main as hash } from "./hash";
import { main as sendEthOpL1 } from "./sendEthOpL1";
import { main as depTxOpL1 } from "./depTxOpL1";
import { config as defaultConfig } from "./config";

// Add new stress tests here
const stressTests: Record<string, any> = {
  sendEth,
  sendEthNaut,
  hash,
  sendEthOpL1,
  depTxOpL1,
};

// Spec command arguments and options
const program = new Command();
program
  .name("stress-test")
  .description("run a stressoor.js stress test on a chain")
  .argument("<test>", "name of the test to run e.g., sendEth")
  .argument("<nCalls>", "number of transactions")
  .option("-w, --ws <string>", "websocket rpc url")
  .option("-h, --http <string>", "json rpc url")
  .option("-c, --chainId <number>", "chain ID")
  .option("-k, --pKey <string>", "faucet private key")
  .option("-g, --gasPrice <number>", "gas price")
  .option("-n, --nWallets <number>", "max number of wallets")
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
        http: opts.http || defaultConfig.rpcUrl.http,
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
      maxNWallets: Number(opts.nWallets) || defaultConfig.maxNWallets,
      callDelayMs:
        opts.tps === undefined
          ? defaultConfig.callDelayMs
          : Math.ceil(1000 / opts.tps),
      seed: seed,
      nCalls: Number(program.args[1]),
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
  // TODO: raise error if data is missing
  const testOutput = await stressTest(config);
  const dataStr: string = JSON.stringify(testOutput, null, 4);
  // We add cues to make the logs easier to parse
  console.log("[outputstart]" + dataStr + "[outputend]");
}

main().then(() => process.exit());
