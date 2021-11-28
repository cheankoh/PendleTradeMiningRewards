# PendleTradeMiningRewards
For each trade a user does on Pendle’s AMM, he is entitled to retroactively receive some PENDLE rewards.

## Run the program
Install the dependencies using npm or yarn.
Then, run node events.js (This will take some time to run)
It will generate rewards.json which contains the data needed to build a merkle distribution tree

## Build the merkle tree using rewards.json
cd merkle-distribution
### To install the packages needed
yarn
### To generate merkle root
ts-node scripts/generate-merkle-root.ts --input ../rewards.json

### To verify if the merkle root is valid
ts-node ./scripts/verify-merkle-root.ts --input ../merkle-distribution.json

### To run the test on deploying and claim
yarn test
