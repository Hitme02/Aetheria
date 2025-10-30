import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { AetheriaExhibitNFT } from '../typechain-types';

describe('AetheriaExhibitNFT', function () {
  let contract: AetheriaExhibitNFT;
  let owner: any;
  let creator: any;

  beforeEach(async function () {
    [owner, creator] = await ethers.getSigners();

    const AetheriaExhibitNFT = await ethers.getContractFactory('AetheriaExhibitNFT');
    contract = await AetheriaExhibitNFT.deploy();
    await contract.waitForDeployment();
  });

  it('Should deploy with correct name and symbol', async function () {
    expect(await contract.name()).to.equal('AetheriaExhibit');
    expect(await contract.symbol()).to.equal('AETH');
  });

  it('Should mint NFT to creator', async function () {
    const tokenURI = 'ipfs://QmTest';

    await contract.mintArtwork(creator.address, tokenURI);

    expect(await contract.ownerOf(1)).to.equal(creator.address);
    expect(await contract.tokenURI(1)).to.equal(tokenURI);
  });

  it('Should increment token ID', async function () {
    await contract.mintArtwork(creator.address, 'ipfs://1');
    await contract.mintArtwork(creator.address, 'ipfs://2');

    expect(await contract.nextTokenId()).to.equal(3);
  });

  it('Should only allow owner to mint', async function () {
    await expect(
      contract.connect(creator).mintArtwork(creator.address, 'ipfs://test')
    ).to.be.revertedWithCustomError(contract, 'OwnableUnauthorizedAccount');
  });

  it('Should emit Minted event', async function () {
    const tokenURI = 'ipfs://QmTest';

    await expect(contract.mintArtwork(creator.address, tokenURI))
      .to.emit(contract, 'Minted')
      .withArgs(creator.address, 1, tokenURI);
  });
});

