const {expect} = require("chai")
const { ethers } = require("hardhat")

describe("Miner contract", function () {
    it("Deployment should return maintoken balance of contract address", async function (){
        const [owner] = await ethers.getSigners()
        const Contract = await ethers.getContractFactory("Miner")
        const minerContract = await Contract.deploy("0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7")
    })
})