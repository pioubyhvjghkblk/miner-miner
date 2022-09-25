const {expect} = require("chai")
const { ethers } = require("hardhat")

describe("Miner contract", function () {
    it("Deployment should return maintoken balance of contract address", async function (){
        const [owner] = await ethers.getSigners()
        const contract = await ethers.getContractFactory("Miner")
        const miner = await contract.deploy("0x531Fc9A2a96A1e6463e9866Cf55f9E403D59500a");

        console.log("Deploying by ",miner.address)

        const testUserInfo = await miner.user(owner.address)

        console.log(testUserInfo)

        expect(testUserInfo).to.equal("0x0000000000000000000000000000000000000000");
    })
})