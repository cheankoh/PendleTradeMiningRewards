# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

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