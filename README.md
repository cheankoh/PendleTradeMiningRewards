# Pendle: Reward PENDLE to Users through Trade Mining 

Trade mining works by distributing PENDLE tokens to users for each transaction they make on Pendle’s AMM. One of the biggest issues faced by users trading on DEXs like Uniswap today are the gas fees for each transaction. And lately, there has been an obscene amount up to 200 gwei or greater in average daily gas prices. 

The key benefit of Trade Mining is that it gives users the ability to offset their transaction fees by earning through trade mining rewards, which can easily trade into other cryptos or stablecoins at the user’s discretion, or they can stake it further in Pendle SingleStaking pool or other Pendle staking pools

It is more efficient to calculate the retroactive rewards off-chain, and have some form of distribution mechanism on-chain.
# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

## Run the program
Install the dependencies using npm or yarn.
Then, run node events.js (This will take some time to run)

It will generate rewards.json which contains the data needed to build a merkle distribution tree


Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

# PENDLE-reward-distribution
### Steps needed to generate the merkle tree (optional)
### Make sure all the packages are installed
#### On the root folder 
#### Step 1
```shell
npx ts-node events.ts
```
#### rewards.json will be generated
#### Step 2
```shell
npx ts-node ./scripts/generate-merkle-root.ts --input rewards.json
```
#### merkle-distribution.json
## Note that the rewards.json and merkle-distribution.json are pushed to the repository beforehand and hence above steps are optional

## To run the test
```shell
yarn test
```
=======
### To run the test on deploying and claim
yarn test

