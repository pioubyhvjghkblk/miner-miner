require("@nomicfoundation/hardhat-toolbox");
const {mnemonic} = require("./secrets");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "bscTestnet",
  networks: {
  	// localhost: {
    //   url: "http://127.0.0.1:8545"
    // },
    hardhat: {
      forking: {
        url: "https://data-seed-prebsc-1-s1.binance.org:8545",
        chainId: 97,
      }
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: {mnemonic: mnemonic}
    },
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: {mnemonic: mnemonic}
    }
  },
  etherscan: {
    apiKey: "42FB7GJ57YXAAPQCBWZHCVUW6MIC87GGNC"
  }
};
