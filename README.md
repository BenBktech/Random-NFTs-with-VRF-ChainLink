# Random NFTs with VRF ChainLink

## Launch Local Blockchain

```
yarn hardhat node --no-deploy
```

## Deploy on Local Blockchain

```
yarn hardhat deploy
```

## Deploy on Goerli

```
yarn hardhat deploy --network goerli
```

## Test on Local Blockchain

The interface 'contracts/test/VRFCoordinatorV2Mock.sol' allows to test the VRF on the local Blockchain

```
yarn hardhat test
```

## Deploy and Test Mint with VRF ChainLink on Goerli

First, deploy with the 00-deploy-mocks.js & 01-deploy-random-ipfs-nft.js scripts by using this command :

```
yarn hardhat deploy --network goerli --tags main
```

Then, add a consumer on vrf.chain.link which will be the address of the contract you have just deployed, then do : 

```
yarn hardhat deploy --network goerli --tags mint
```