/**
 * This is a script to fund sub-faucets.
 * You only need to do that if you intend to run multiple stress-tests simultaneously.
 */

import {
  JsonRpcProvider,
  Wallet,
  TestContext,
  Prefabs,
} from "@latticexyz/stressoor";

const { sendTransactionGetReceipt, sendTransaction } = Prefabs.Call;

import { Command } from "commander";

import { newProvider, genFaucetPrivateKey } from "./utils";
import { config as defaultConfig } from "./config";

// Spec command arguments and options
const program = new Command();
program
  .name("fund-faucets")
  .description("fund sub-faucets")
  .argument("<n>", "fund faucets up to seed n")
  .argument("<amount>", "amount to fund faucets with")
  .option("-r, --wait", "wait for transaction receipts")
  .option("-w, --ws <string>", "websocket rpc url")
  .option("-c, --chainId <number>", "chain ID")
  .option("-k, --pKey <string>", "super faucet private key")
  .option("-g, --gasPrice <number>", "gas price");

// Parse parameters and return { config }
function getParams(): any {
  program.parse();
  const opts = program.opts();
  return {
    nn: program.args[0],
    amount: program.args[1],
    config: {
      wait: opts.wait,
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
      gasPrice: Number(opts.gasPrice) || defaultConfig.gasPrice,
      maxNWallets: Number(opts.nWallets) || defaultConfig.maxNWallets,
    },
  };
}

async function main() {
  const params = getParams();
  const { nn, amount, config } = params;
  const provider: JsonRpcProvider = newProvider(config);
  let faucet = new Wallet(config.faucetPrivateKey, provider);
  await faucet.initHotNonce();
  const promises: Promise<unknown>[] = [];
  const testContext: TestContext = {
    log: config.log,
    gasPrice: config.gasPrice,
  };
  for (let ii = 0; ii < nn; ii++) {
    // TODO: get the address more cleanly
    const recipientAddr = new Wallet(
      genFaucetPrivateKey(ii.toString(), testContext),
      provider
    ).address;
    const params = {
      to: recipientAddr,
      value: amount,
      gasLimit: 10000000000000,
      gasPrice: config.gasPrice,
    };
    const callContext = { wallet: faucet };
    let txPromise;
    if (config.wait) {
      txPromise = sendTransactionGetReceipt(params, callContext, testContext);
    } else {
      txPromise = sendTransaction(params, callContext, testContext);
    }
    promises.push(txPromise);
  }
  await Promise.all(promises);
}

main().then(() => process.exit());
