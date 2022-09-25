# Solidity-Miner

Solidity smart contract for miners

Gives BUSD and primary token rewards

### When Deploying ###
This contract takes one param which is a valid ERC20 token. this is the token which the contract would use to distribute to users that are active on the miner

### Basic Functions ###
  - **Launch**:
      >only token owner which sets the miner running, this function basically kickstarts the miner
  - **Deposit**:
      >users can use the function to make deposits within the set minimum and maximum amount set by the token owner, each deposit purchases some amount of miners
  - **Withdraw**:
      >where they can withdraw their BUSD profits and also get the primary token rewards based on the amount of miners purchased
  - **MineTokens**:
      >This function is responsible for adding up the accumulated tokens they've mined and storing that information for later use(when withdrawing). It also acts as a compounding feature, so anytime it is called more miners get added
