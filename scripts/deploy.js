const { ethers } = require("hardhat")

async function main(){
    const [deployer] = await ethers.getSigners()

    const contract = await ethers.getContractFactory("Miner")
    const miner = await contract.deploy("0x531Fc9A2a96A1e6463e9866Cf55f9E403D59500a");

    console.log("Smart contract address == ", miner.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });