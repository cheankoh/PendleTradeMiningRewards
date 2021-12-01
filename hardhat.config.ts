import { task, HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import 'solidity-coverage';
import 'hardhat-gas-reporter';
import 'hardhat-contract-sizer';
import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import { removeConsoleLog } from 'hardhat-preprocessor';
import 'hardhat-deploy';
import * as dotenv from 'dotenv';
dotenv.config();
import { nodeUrl, accounts } from './utils/network';

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  paths: {
    sources: './contracts',
    tests: './test',
    artifacts: './build/artifacts',
    cache: './build/cache',
    deploy: './scripts/deploy',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  mocha: {
    timeout: 20000,
  },
  gasReporter: {
    currency: 'USD',
    enabled: process.env.REPORT_GAS ? true : false,
    showMethodSig: true,
    onlyCalledMethods: false,
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  typechain: {
    outDir: 'typechained',
    target: 'ethers-v5',
  },
  networks: {
    hardhat: {
      chainId: 1337, // temporary for MetaMask support: https://github.com/MetaMask/metamask-extension/issues/10290
    },
    rinkeby: {
      url: nodeUrl('rinkeby'),
      accounts: accounts('rinkeby'),
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // by default, take the first account as deployer
      rinkeby: '0x24c1EDC7680C4B96fb6A7930B474D337967a8AB5', // on rinkeby, use a specific account
    },
  },
};

export default config;
