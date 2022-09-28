const {expect} = require("chai")
const { BigNumber } = require("ethers")
const { ethers } = require("hardhat")

describe("Miner contract test", function () {
    let token; //stable
    let mainToken;
    let Miner;
    const zeroAddress = "0x0000000000000000000000000000000000000000"
    const decimals = BigNumber.from(10).pow(18)
    beforeEach(async function () {

        const tokenContract = await ethers.getContractFactory("Token")
        const mainTokenContract = await ethers.getContractFactory("Token")
        if(token){
            // console.log("Token declared")
        }else{
            token = await tokenContract.deploy("BUSD Token", "BUSD")
            mainToken = await mainTokenContract.deploy("VestToken", "VTK")
        }
    })
    it("**************** Stable Token deployment ****************", async function (){

        const [owner, userOne, userTwo, userThree] = await ethers.getSigners()
        const tokenTotalSupply = await token.totalSupply();
        const allocatedTransferAmount = BigNumber.from(500).mul(decimals)
        const expectedRemainingBalance = tokenTotalSupply.sub(allocatedTransferAmount.mul(3))

        console.log("BUSD address == ",token.address)

        await token.transfer(userOne.address,allocatedTransferAmount.toString())
        await token.transfer(userTwo.address,allocatedTransferAmount.toString())
        await token.transfer(userThree.address,allocatedTransferAmount.toString())
        
        console.log("Transfers done...")
        console.log("********************************")

        expect(await token.balanceOf(owner.address)).to.greaterThan(expectedRemainingBalance.toString());
    })
    it("**************** Miner deployment ****************", async function (){

        const [owner, userOne, userTwo, userThree] = await ethers.getSigners()

        console.log("VTK address == ",mainToken.address)
        console.log("BUSD address == ",token.address)
        
        const contract = await ethers.getContractFactory("Miner")
        Miner = await contract.deploy(mainToken.address, token.address);

        console.log("Miner address == ",Miner.address)

        console.log("********************************")

        expect(await owner.address).to.equal(await Miner.owner());
    })
    it("**************** Miner Launch ****************", async function (){
        const [owner, userOne, userTwo, userThree] = await ethers.getSigners()
        const launchAmount = BigNumber.from(10).mul(decimals)

        console.log("Vest BUSD approval...") 
        await expect(token.approve(Miner.address,launchAmount)).to.emit(token, "Approval").withArgs(owner.address,Miner.address,launchAmount)

        console.log("Miner Launch...")
        await expect(Miner.launch(launchAmount)).to.emit(token, "Transfer").withArgs(owner.address,Miner.address,launchAmount)

        // expect(await token.balanceOf(Miner.address)).to.lessThan(launchAmount.toString())
    })
    it("**************** User One Deposit Without Referral ****************", async function (){
        const [owner, userOne, userTwo, userThree] = await ethers.getSigners()

        const userOneBalance = await token.balanceOf(userOne.address)
        const userOneMinerConnect = await Miner.connect(userOne)
        const userOneTokenConnect = await token.connect(userOne)

        
        const minimumDeposit = await Miner.minimumDeposit()
     
        const randomNumber = Math.floor(Math.random() * (userOneBalance.div(decimals).toNumber() - minimumDeposit.div(decimals).toNumber() + 1) ) + minimumDeposit.div(decimals).toNumber();
        const depositAmount = BigNumber.from(randomNumber).mul(decimals)

        console.log("User One Balance == ", userOneBalance.toString())

        console.log("Vest BUSD approval...") 
        await expect(userOneTokenConnect.approve(userOneMinerConnect.address,depositAmount)).to.emit(userOneTokenConnect, "Approval").withArgs(userOne.address,userOneMinerConnect.address,depositAmount)

        console.log(`Depositing ${depositAmount}BUSD ...`)
        await expect(userOneMinerConnect.deposit(depositAmount,zeroAddress)).to.emit(userOneTokenConnect, "Transfer").withArgs(userOne.address,userOneMinerConnect.address,depositAmount)

        // expect(await token.balanceOf(Miner.address)).to.lessThan(launchAmount.toString())
    })
})

/**
 *      CURRENT TEST ADDRESSES
 *      VTK address ==  0x459f6A531772Fa0b23f81C8b539100FEbd2cD9d1
 *      BUSD address ==  0x2913128F6fa84f143087B011f3160918807DfaBe
 *      Miner address ==  0x2Bb17D0e1Bb483eae9a15918e87540d98dC90F9f
 */