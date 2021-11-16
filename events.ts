#!/usr/bin/env ts-node

var { BigNumber, ethers, utils } = require('ethers');
var fs = require('fs');

// SwapEvent <<<<<<< the event that we wanna filter from the pendle router 
/*
https://api.etherscan.io/api?module=contract&action=getabi&address=0x1b6d3E5Da9004668E14Ca39d1553E9a46Fe842B3&apikey=3H3HIB2APATJKF5ZXCNXTQRRM1ZCXF51US
*/

const poolABI = JSON.parse(fs.readFileSync('./abi/PendleRouter.abi', 'utf8'));
const zeroAddress = '0x0000000000000000000000000000000000000000';
var startTime = new Date('2021-11-01T08:00:00') // SG time 14th Nov 00:00
const now = (Date.now() / 1000);
const epoch = 14; //days

async function main() {
    const rpcUrl = 'https://eth-mainnet.alchemyapi.io/v2/jeh6EswMB-1UertvxXPspJB5ZQ4Rhnp7'; // Alchemy node
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const startBlock = 13515454;
    const latestBlock = await provider.getBlockNumber();
    const contract = '0x1b6d3E5Da9004668E14Ca39d1553E9a46Fe842B3';
    let instance;
    let Events;
    let pages;
    let logs;
    let result = new Object;
    instance = new ethers.Contract(contract, poolABI, provider);
    Events = await instance.filters.SwapEvent();

    pages = Math.round((latestBlock - startBlock) / 10000);
    let start = startBlock;
    let end = start + 10000;
    let blockPointer = startBlock;
    let completed = false;
    for (let page = 1; page <= pages; page++) {
        logs = await instance.queryFilter(Events, start, end);

        let timeStamp = (await provider.getBlock(blockPointer)).timestamp;
        if (timeStamp > now) break; // terminating condition

        // Retrieve trader's data to calculate rewards
        for (let j = 0; j < logs.length; j++) {
            if (blockPointer != logs[j].blockNumber) {
                blockPointer = logs[j].blockNumber;
                timeStamp = (await provider.getBlock(blockPointer)).timestamp;

                // Check if the block should be in the next epoch. If so, store current result and move on to the next epoch
                let nextEpoch = new Date(startTime.getTime());
                nextEpoch.setDate(startTime.getDate() + 14);
                if ((nextEpoch.getTime() / 1000) < timeStamp) {
                    console.log(result);
                    startTime.setDate(startTime.getDate() + epoch);
                    completed = true;
                    break;
                }
            }
            // Don't care about blocks that are less than start time
            if (timeStamp < parseInt((startTime.getTime() / 1000).toString())) continue;
            // Calculate rewards
            let traderAddress = logs[j].args.trader;
            if (!result.hasOwnProperty(traderAddress)) result[traderAddress] = 1;
            else result[traderAddress]++;
        }
        if (completed) break;
        start = end;
        end = end + 10000;
    }

    // convert JSON object to string
    let finalResult = JSON.stringify(result, null, '\t');

    // write JSON string to a file
    fs.writeFile('rewards.json', finalResult, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}

// Start the script
main();