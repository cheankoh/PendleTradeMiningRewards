import chai, { expect } from 'chai';
import { solidity, MockProvider, deployContract } from 'ethereum-waffle';
import { Contract, BigNumber, constants } from 'ethers';
import BalanceTree from '../src/balance-tree';
import fs from 'fs';

var Distributor = require('../build/artifacts/contracts/MerkleDistributor.sol/MerkleDistributor.json');
var AlexCheanERC20 = require('../build/artifacts/contracts/AlexCheanERC20.sol/AlexCheanERC20.json');

chai.use(solidity);

const overrides = {
  gasLimit: 9999999,
};

const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('MerkleDistributor', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999,
    },
  });

  const wallets = provider.getWallets();
  const [wallet0, wallet1] = wallets;

  // Get all mainnet wallets filtered by SwapEvents which are stored in rewards.json
  // Generated Merkle Airdrop distribution tree from the rewards.json and store it in merkle-distribution.json
  const merkleData = JSON.parse(fs.readFileSync('./merkle-distribution.json', 'utf8'));
  const claimsData = merkleData.claims;
  var traders: { [k: string]: string } = {};
  for (var trader in claimsData) {
    let indexOfMerkle = claimsData[trader].index;
    traders[indexOfMerkle] = trader;
  }

  let token: Contract;
  beforeEach('deploy token', async () => {
    token = await deployContract(wallet0, AlexCheanERC20, ['Token', 'TKN', 0], overrides);
  });

  describe('#token', () => {
    it('merkle distributor returns the token address', async () => {
      const distributor = await deployContract(wallet1, Distributor, [token.address, ZERO_BYTES32], overrides);
      expect(await distributor.token()).to.eq(token.address);
    });
  });

  describe('#merkleRoot', () => {
    it('merkle distributor returns the zero merkle root that we passed in', async () => {
      const distributor = await deployContract(wallet1, Distributor, [token.address, ZERO_BYTES32], overrides);
      expect(await distributor.merkleRoot()).to.eq(ZERO_BYTES32);
    });
  });

  describe('#claim', () => {
    it('fails for empty proof', async () => {
      const distributor = await deployContract(wallet1, Distributor, [token.address, ZERO_BYTES32], overrides);
      await expect(distributor.claim(0, wallet0.address, 10, [])).to.be.revertedWith('MerkleDistributor: Invalid proof.');
    });

    it('fails for invalid index', async () => {
      const distributor = await deployContract(wallet1, Distributor, [token.address, ZERO_BYTES32], overrides);
      await expect(distributor.claim(0, wallet0.address, 10, [])).to.be.revertedWith('MerkleDistributor: Invalid proof.');
    });

    describe('merkle tree generated from rewards.json', () => {
      let distributor: Contract;
      beforeEach('deploy', async () => {
        distributor = await deployContract(wallet1, Distributor, [token.address, merkleData.merkleRoot], overrides);
        await token.setBalance(distributor.address, merkleData.tokenTotal);
      });

      it('successful claim for index 3 & 12', async () => {
        const proof3 = claimsData[traders['3']]['proof'];
        await expect(distributor.claim(3, traders['3'], parseInt(claimsData[traders['3']]['amount']), proof3, overrides))
          .to.emit(distributor, 'Claimed')
          .withArgs(3, traders['3'], parseInt(claimsData[traders['3']]['amount']));
        const proof12 = claimsData[traders['12']]['proof'];
        await expect(distributor.claim(12, traders['12'], parseInt(claimsData[traders['12']]['amount']), proof12, overrides))
          .to.emit(distributor, 'Claimed')
          .withArgs(12, traders['12'], parseInt(claimsData[traders['12']]['amount']));
      });

      it('must have enough to transfer', async () => {
        const proof12 = claimsData[traders['12']]['proof'];
        await token.setBalance(distributor.address, 13);
        await expect(distributor.callStatic.claim(12, traders['12'], parseInt(claimsData[traders['12']]['amount']), proof12, overrides)).to.be.revertedWith('ERC20: transfer amount exceeds balance');
      });

      it('sets #isClaimed', async () => {
        const proof0 = claimsData[traders['0']]['proof'];
        expect(await distributor.isClaimed(0)).to.eq(false);
        expect(await distributor.isClaimed(1)).to.eq(false);
        await distributor.claim(0, traders['0'], parseInt(claimsData[traders['0']]['amount']), proof0, overrides);
        expect(await distributor.isClaimed(0)).to.eq(true);
        expect(await distributor.isClaimed(1)).to.eq(false);
      });

      it('cannot allow two claims', async () => {
        const proof0 = claimsData[traders['0']]['proof'];
        await distributor.claim(0, traders['0'], parseInt(claimsData[traders['0']]['amount']), proof0, overrides);
        await expect(distributor.claim(0, traders['0'], parseInt(claimsData[traders['0']]['amount']), proof0, overrides)).to.be.revertedWith(
          'MerkleDistributor: Drop already claimed.'
        );
      });

      it('cannot claim more than once: 0 and then 1', async () => {
        const proof0 = claimsData[traders['0']]['proof'];
        await distributor.claim(0, traders['0'], parseInt(claimsData[traders['0']]['amount']), proof0, overrides);
        const proof1 = claimsData[traders['1']]['proof'];
        await distributor.claim(1, traders['1'], parseInt(claimsData[traders['1']]['amount']), proof1, overrides);
        await expect(
          distributor.claim(0, traders['0'], parseInt(claimsData[traders['0']]['amount']), proof0, overrides)
        ).to.be.revertedWith('MerkleDistributor: Drop already claimed.');
      });

      it('cannot claim more than once: 1 and then 0', async () => {
        const proof1 = claimsData[traders['1']]['proof'];
        await distributor.claim(1, traders['1'], parseInt(claimsData[traders['1']]['amount']), proof1, overrides);
        const proof0 = claimsData[traders['0']]['proof'];
        await distributor.claim(0, traders['0'], parseInt(claimsData[traders['0']]['amount']), proof0, overrides);
        await expect(
          distributor.claim(1, traders['1'], parseInt(claimsData[traders['1']]['amount']), proof0, overrides)
        ).to.be.revertedWith('MerkleDistributor: Drop already claimed.');
      });

      it('cannot claim for address outside of its proof', async () => {
        const proof0 = claimsData[traders['0']]['proof'];
        await expect(distributor.claim(1, traders['1'], parseInt(claimsData[traders['1']]['amount']), proof0, overrides)).to.be.revertedWith('MerkleDistributor: Invalid proof.');
      });

      it('cannot claim more than proof', async () => {
        const proof0 = claimsData[traders['0']]['proof'];
        await expect(distributor.claim(0, traders['0'], (parseInt(claimsData[traders['0']]['amount'] + 1)), proof0, overrides)).to.be.revertedWith('MerkleDistributor: Invalid proof.');
      });
    });
  });
});
