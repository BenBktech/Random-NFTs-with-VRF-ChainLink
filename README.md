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