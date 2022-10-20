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

            it('reverts if payment amount is less than the mint fee', async function() {
                const mintFee = await randomIpfsNft.getMintFee()
                await expect(randomIpfsNft.requestNft({ value: mintFee.sub(ethers.utils.parseEther('0.00001'))})).to.be.revertedWithCustomError(
                    randomIpfsNft,
                    "RandomIpfsNft__NeedMoreETHSent"
                )
            })

            it('emits an event and kicks off a random word request', async function() {
                const mintFee = await randomIpfsNft.getMintFee()
                await expect(randomIpfsNft.requestNft({value: mintFee})).to.emit(
                    randomIpfsNft,
                    "NftRequested"
                )
            })

            describe("fulfillRandomWords", () => {
                it("mints NFT after random number is returned", async function () {
                    await new Promise(async (resolve, reject) => {
                        randomIpfsNft.once("NftMinted", async function() {
                            try {
                                const tokenUri = await randomIpfsNft.tokenURI("0")
                                const tokenCounter = await randomIpfsNft.getTokenCounter()
                                assert.equal(tokenUri.toString().includes("ipfs://"), true)
                                assert.equal(tokenCounter.toString(), "1")
                                resolve()
                            } catch (e) {
                                console.log(e)
                                reject(e)
                            }
                        })
                        try {
                            const fee = await randomIpfsNft.getMintFee()
                            const requestNftResponse = await randomIpfsNft.requestNft({
                                value: fee.toString(),
                            })
                            const requestNftReceipt = await requestNftResponse.wait(1)
                            await vrfCoordinatorV2Mock.fulfillRandomWords(
                                requestNftReceipt.events[1].args.requestId,
                                randomIpfsNft.address
                            )
                        }
                        catch(e) {
                            console.log(e)
                            reject(e)
                        }
                    })
                })
            })

            describe("getBreedFromModdedRng", () => {
                it("should return pug if moddedRng < 10", async function () {
                    const expectedValue = await randomIpfsNft.getBreedFromModdedRng(7)
                    assert.equal(0, expectedValue)
                })
                it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
                    const expectedValue = await randomIpfsNft.getBreedFromModdedRng(21)
                    assert.equal(1, expectedValue)
                })
                it("should return st. bernard if moddedRng is between 40 - 99", async function () {
                    const expectedValue = await randomIpfsNft.getBreedFromModdedRng(77)
                    assert.equal(2, expectedValue)
                })
                it("should revert if moddedRng > 99", async function () {
                    await expect(randomIpfsNft.getBreedFromModdedRng(100)).to.be.revertedWithCustomError(
                          randomIpfsNft,
                          "RandomIpfsNft__RangeOutOfBounds"
                    )
                })
            })
        })
    })