import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

export const INITIAL_GREET: { [chainId: string]: string } = {
  '1337': 'Bonjour localhost!',
  '4': 'Guten tag, Rinkeby!',
};
let tokenAddress = '0x8678F1881e4E7a33a426445715C15A985c3D12F7';

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const chainId = await hre.getChainId();

  await hre.deployments.deploy('MerkleDistributor', {
    from: deployer,
    args: [tokenAddress, '0x26f14510706216aef61c12e8448039c4b7e639f530ac317a76cac5e8247ce5e7'],
    log: true,
  });
};
deployFunc.tags = ['MerkleDistributor'];

export default deployFunc;
