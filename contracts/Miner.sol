// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Miner {
    ERC20 public mainToken;
    // ERC20 public busd = ERC20(0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7); // busd testnet
    ERC20 public busd; // busd testnet
    address public owner;
    uint public totalMiners;
    uint public busdMinerRate;
    uint private minerTokenRate = 13; // 13% of tm == mainToken mined
    uint public busdDailyPercentage = 3;
    uint public minimumCompoundRequired = 7;
    uint public minimumDaysRequired = 7;
    uint public minimumDeposit = 10;
    uint public maximumDeposit = 500;
    uint public mineDuration = 86400; // 24 hours timestamp
    uint public referralPercentage = 10;
    address public devAddress; 
    address public taxAddress;
    address public zeroAddress = 0x0000000000000000000000000000000000000000;
    bool public isMinerRunning = false;
    struct userInfo {
        uint miners;
        uint totalDeposit;
        uint totalCompounded;
        uint compoundCount;
        uint lastWithdrawTime;
        uint lastCompoundTime;
        uint totalTokensMined;
        uint currentTokensMined;
        address referral;
        uint referralBonus;
    }
    mapping(address => userInfo) public user;

    constructor(ERC20 _mainToken, ERC20 _busd) {
        mainToken = _mainToken;
        busd = _busd;
        owner = msg.sender;
        devAddress = msg.sender;
        taxAddress = msg.sender;
        console.log("Deployed");
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Not authorized");
        _;
    }
    modifier isRunning() {
        require(isMinerRunning == true, "Miner has not launched yet");
        _;
    }
    modifier hasDeposit() {
        require(
            user[msg.sender].totalDeposit > 0,
            "No deposit has been made by this user"
        );
        _;
    }

    function launch(uint amount) public onlyOwner {
        require(isMinerRunning == false, "Miner already launched");
        busd.transferFrom(msg.sender, address(this), amount);
        totalMiners = (10 * busdBalance()) / 1e18;
        busdMinerRate = (totalMiners * 1e18) / busdBalance();
        isMinerRunning = true;
        user[msg.sender].miners = totalMiners;
        addDepositToUser(amount);
    }

    function deposit(uint amount, address ref) public isRunning {
        require(minimumDeposit <= amount && maximumDeposit >= amount,"Deposit amount out of specified range");
        busd.transferFrom(msg.sender, address(this), amount);
        
        uint currentMiners = ((amount / 1e18) * busdMinerRate) / 2;
        totalMiners += currentMiners;
        user[msg.sender].miners += currentMiners;
        addDepositToUser(amount);
        // check and transfer referral bonus
        transferReferralBonus(amount, msg.sender, ref);
        updateBusdMinerRate();
    }

    function transferReferralBonus(uint _amount, address _user, address ref) private {
        // if this is the user's first deposit then set his upline
        if(user[_user].referral == zeroAddress){
            user[_user].referral = ref != zeroAddress ? ref : devAddress;
        }
        console.log("Referral address is %s ",user[_user].referral);
        // make the transfer
        uint _transferAmount = ((referralPercentage *1e18) * _amount) / (100 * 1e18);
        busd.approve(address(this), _amount);
        busd.transferFrom(address(this),user[_user].referral, _transferAmount);

        // update the refs referral bonus
        user[user[_user].referral].referralBonus += _transferAmount;

    }

    function mineTokens() public isRunning hasDeposit {
        // require(
        //     user[msg.sender].totalDeposit > 0,
        //     "No deposit has been made by this user"
        // );
        uint lastCompound = block.timestamp - user[msg.sender].lastCompoundTime;
        require(lastCompound >= mineDuration, "You cannot mine now");
        claimTokens(msg.sender);
        compound(msg.sender);
    }

    function withdraw(uint _amount) public isRunning hasDeposit {
        bool isRequirementMet = user[msg.sender].compoundCount >= minimumDaysRequired && user[msg.sender].compoundCount >= minimumCompoundRequired;
        require(isRequirementMet, "Withdrawal Requirements not met");

        uint maxWithdrawal = user[msg.sender].totalCompounded - user[msg.sender].totalDeposit;
        require(_amount <= maxWithdrawal, "Amount exceeds profit earned");

        // Transfer profit in stables
        busd.approve(address(this), _amount);
        busd.transferFrom(address(this), msg.sender, _amount);

        // Transfer token mined
        mainToken.approve(address(this), user[msg.sender].currentTokensMined);
        mainToken.transferFrom(address(this),msg.sender, user[msg.sender].currentTokensMined);

        // deduct stables from user
        user[msg.sender].totalCompounded -= _amount;

        // reset user compound count
        user[msg.sender].compoundCount = 0;

        // update last withdraw time and compound time
        user[msg.sender].lastWithdrawTime = user[msg.sender].lastCompoundTime = block.timestamp;

        // deduct tokens mined
        user[msg.sender].currentTokensMined = 0;

        updateBusdMinerRate();
    }

    function getDailyBusdRewards(address _user) public view returns (uint) {
        uint lastCompound = block.timestamp - user[_user].lastCompoundTime;
        if (lastCompound >= mineDuration) {
            return
                ((busdDailyPercentage * 1e18) * user[_user].totalCompounded) /
                (100 * 1e18);
        }
        return 0;
    }

    function compound(address _user) private {
        // compound rewards and update user's miners

        uint dailyBusdReward = getDailyBusdRewards(_user);
        uint currentMiners = ((dailyBusdReward / 1e18) * busdMinerRate) / 2;
        totalMiners += currentMiners;
        user[msg.sender].miners += currentMiners;
        user[msg.sender].totalCompounded += dailyBusdReward;
        user[msg.sender].compoundCount += 1;
        user[msg.sender].lastCompoundTime = block.timestamp;
        updateBusdMinerRate();
    }

    function claimTokens(address _user) private {
        // claim mined tokens
        // calculate the tokens mined based on the mining rate and multiply by mineDuration converted to hours
        uint tokenMined = ((minerTokenRate * user[_user].miners) / 100) * (mineDuration / 3600);
        user[_user].totalTokensMined += tokenMined;
        user[_user].currentTokensMined += tokenMined;
    }

    function addDepositToUser(uint _amount) private {
        user[msg.sender].totalDeposit += _amount;
        user[msg.sender].totalCompounded += _amount;
        user[msg.sender].lastCompoundTime = block.timestamp;
    }

    function updateBusdMinerRate() private {
        busdMinerRate = (totalMiners * 1e18) / busdBalance();
    }

    function transferOwnership(address _owner) public onlyOwner {
        owner = _owner;
    }

    function setBusdDailyPercentage(uint _busdDailyPercentage)
        public
        onlyOwner
    {
        busdDailyPercentage = _busdDailyPercentage;
    }

    function setMinerDuration(uint _mineDuration) public onlyOwner {
        mineDuration = _mineDuration;
    }

    function setMainToken(ERC20 _newMainToken) public onlyOwner {
        mainToken = _newMainToken;
    }

    function setMinimumRequirements(
        uint _minimumCompoundRequired,
        uint _minimumDaysRequired
    ) public onlyOwner {
        minimumCompoundRequired = _minimumCompoundRequired;
        minimumDaysRequired = _minimumDaysRequired;
    }

    function setDepositRange(uint _min, uint _max) public onlyOwner {
        minimumDeposit = _min;
        maximumDeposit = _max;
    }
    function setReferralPercentage(uint _referralPercentage) public onlyOwner {
        referralPercentage = _referralPercentage;
    }

    function setDevAddress(address _devAddress) public onlyOwner {
        devAddress = _devAddress;
    }
    function setTaxAddress(address _taxAddress) public onlyOwner {
        taxAddress = _taxAddress;
    }

    function mainTokenBalance() public view returns (uint) {
        return mainToken.balanceOf(address(this));
    }

    function busdBalance() public view returns (uint) {
        return busd.balanceOf(address(this));
    }
    /***
     *
     *      BATTERY DON DIE -- SOLIDITY, FEAR MY RETURN!!!!
     */
}
