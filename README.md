A collection of blockchain stress-tests based on [stressoor.js](https://github.com/latticexyz/stressoor.js).

# Quickstart

`sendEth` spams the target RPC with simple ETH transfer transactions at a certain rate.

## Setup

`yarn install`

## Run locally

```bash
yarn start sendEth \
    <number of transactions to send> \
    --http <json rpc url> \ # use --ws for websocket
    --pKey <faucet private key>
```

This will send ETH transfer transactions from your machine to the RPC.

## Run on k8s

`yarn start:k8s <NAME>`

This will spin up a job in the cluster and run the same stress-test with the parameters specified in `infra/.env`. You need to have `kubectl` set up (see [run.sh](/infra/cmd/run.sh)).

## Run other stress-tests

`hash` spams the target RPC with function calls to [Hasher.sol](/contracts/src/Hasher.sol) that compute hashes on-chain.

```bash
# Deploy Hasher.sol
yarn deploy:chain <JSON_RPC>
# Do: Set the HASHER_ADDRESS constant in src/hash.ts to the deployed address
yarn start hash
    <number of transactions to send> \
    --http <json rpc url> \
    --pKey <faucet private key>
```

# Running stress-tests

Stress-test parameters can be specified in `src/config.ts` and in the command-line (non-exhaustive). The latter takes preference.

```
> yarn start --help

Usage: chain-stress-test [options] <test> <nTx>

run a stressoor.js stress test on a chain

Arguments:
  test                     name of the test to run e.g., sendEth
  nTx                      number of transactions

Options:
  -w, --ws <string>        websocket rpc url
  -h, --http <string>      json rpc url
  -c, --chainId <number>   chain ID
  -k, --pKey <string>      faucet private key
  -g, --gasPrice <number>  gas price
  -n, --nAddr <number>     max number of addresses
  -t, --tps <number>       max tps
  -s, --seed <number>      seed
  --help                   display help for command
```

# Making your own stress-test

## Transfers/contract calls

For simple transfer/contract call transactions, looking through [sendEth.ts](/src/sendEth.ts) or [hash.ts](/src/hash.ts) (respectively) and modifying a copy should be quite simple.

Remember to add the test to `index.ts` to be able to call it with `yarn start`.

## Other stress-tests

For complex stress-tests you might want to familiarize yourself with the fundamentals of stressoor.js and create a custom version of [stdtest.ts](/src/stdtest.ts).
This also applies to stress-tests that do things other than send transactions e.g. read-only RPC calls.

## Kubernetes

When running tests from a k8s cluster, the local `/src` directory gets mounted into the pod. This way you can work on a test and quickly run it on the cluster without having to build a docker image. This is currently done by creating a configmap from all the files in the directory (effective but limited).

## Reports

To customize what data get's reported, look into [reportStack.ts](/src/reportStack.ts).
