const {expect} = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")

describe("Miner contract", function () {
    let token;
    let Miner;
    beforeEach(async function () {

        const tokenContract = await ethers.getContractFactory("Token")
        token = await tokenContract.deploy()
    })
    it("Miner deployment", async function (){

        const [owner, userOne, userTwo, userThree] = await ethers.getSigners()
        const tokenTotalSupply = await token.totalSupply();
        const allocatedTransferAmount = tokenTotalSupply.mul(15).div(100)
        const expectedRemainingBalance = tokenTotalSupply.sub(allocatedTransferAmount.mul(3))

        console.log("VBUSD address == ",token.address)
        console.log("allocated transfer == ", allocatedTransferAmount.toString())

        

        token.transfer(userOne.address,allocatedTransferAmount.toString()).then(() => {
            token.transfer(userTwo.address,allocatedTransferAmount.toString()).then(() => {
                token.transfer(userThree.address,allocatedTransferAmount.toString())
            })
        })
        // const contract = await ethers.getContractFactory("Miner")
        // Miner = await contract.deploy("0x531Fc9A2a96A1e6463e9866Cf55f9E403D59500a", token.address);

        // console.log("Miner address == ",Miner.address)

        // const testz = await Miner.testZero("0x0000000000000000000000000000000000000000")

        // console.log(testz)
        let ob = await token.balanceOf(owner.address)
        console.log("owner bal == ", ob.toString())
        console.log("spent == ", expectedRemainingBalance.toString())

        expect(await token.balanceOf(owner.address)).to.equal(expectedRemainingBalance.toString());
    })
})