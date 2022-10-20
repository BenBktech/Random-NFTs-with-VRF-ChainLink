import { assert, expect } from "chai"
import { network, deployments, ethers } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"
import { RandomIpfsNft } from "../typechain-types/contracts/RandomIpfsNft"
import { VRFCoordinatorV2Mock } from "../typechain-types/@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT Unit Tests", function () {
        let randomIpfsNft: RandomIpfsNft, deployer, vrfCoordinatorV2Mock: VRFCoordinatorV2Mock

        beforeEach(async() => {
            let accounts = await ethers.getSigners()
            deployer = accounts[0]
            await deployments.fixture(["mocks", "randomipfs"])
            randomIpfsNft = await ethers.getContract("RandomIpfsNft")
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        })

        describe("constructor", () => {
            it("sets starting values correctly", async function() {
                const dogTokenURIZero = await randomIpfsNft.getDogTokenUris(0)
                const isInitialized = await randomIpfsNft.getInitialized()
                const tokenCounter = await (await randomIpfsNft.getTokenCounter()).toString()
                const mintFee = await (await randomIpfsNft.getMintFee()).toString()
                assert(dogTokenURIZero.includes('ipfs://'))
                assert.equal(isInitialized, true)
                assert.equal(tokenCounter, "0")
                assert.equal(mintFee, ethers.utils.parseEther('0.01').toString())
            })
        })
    })