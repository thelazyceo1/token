// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "hardhat/console.sol";
import "./IUniswapV2Router02.sol";
import "./DuniapayCFA.sol";

contract DuniaBank {

    IUniswapV2Router02 public ubeswapRouter;
    DuniapayCFA public duniaToken;
    uint8 private count;

    mapping(address => uint256) private balances;
    address public owner;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;


    // Log the event about a deposit being made by an address and its amount
    event LogDepositMade(address indexed accountAddress, uint256 amount);

    // Constructor
     constructor(IUniswapV2Router02 _ubeswapRouter, DuniapayCFA _duniaToken) public {
        /* Set the owner to the creator of this contract */
        owner = msg.sender;
        count = 0;
        ubeswapRouter = _ubeswapRouter;
        duniaToken = _duniaToken;
    }


    /// @notice Enroll a customer with the bank,
    /// giving the first 3 of them 10 ether as reward
    /// @return The balance of the user after enrolling
    function enroll() public returns (uint256) {
        if (count < 3) {
            count++;
            balances[msg.sender] = 10 ether;
        }
        return balances[msg.sender];
    }

    /// @notice Deposit ether into bank, requires method is "payable"
    /// @return The balance of the user after the deposit is made
    function deposit() public payable returns (uint256) {
        balances[msg.sender] += msg.value;
        emit LogDepositMade(msg.sender, msg.value);
        return balances[msg.sender];
    }

    /// @notice Withdraw ether from bank
    /// @dev This does not return any excess ether sent to it
    /// @param withdrawAmount amount you want to withdraw
    /// @return remainingBal
    function withdraw(uint256 withdrawAmount)
        public
        returns (uint256 remainingBal)
    {
        // Check enough balance available, otherwise just return balance
        if (withdrawAmount <= balances[msg.sender]) {
            balances[msg.sender] -= withdrawAmount;
            msg.sender.transfer(withdrawAmount);
        }
        return balances[msg.sender];
    }

    /// @notice Just reads balance of the account requesting, so "constant"
    /// @return The balance of the user
    function balance() public view returns (uint256) {
        return balances[msg.sender];
    }

    /// @return The balance of the Simple Bank contract
    function depositsBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Get quote for pair
    function quote(
        uint256 amountA,
        uint256 reserveA,
        uint256 reserveB
    ) public returns (uint256 amountB) {
        return address(this).balance;
    }

    // Swap token for exact amount
    function pairFor(address tokenA, address tokenB) public {
        console.log("Get PairFor %s tokens");
        console.log("Trying to send %s tokens to %s", tokenA, tokenB);
    }

    // Swap with Fees
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual   returns (uint256[] memory amounts) {
        console.log("SwapExactTokensForTokens");
        console.log("AmountIn %s", amountIn);
        console.log("amountOutMin %s", amountOutMin);
        console.log("To %s", to);
        console.log("Deadline %s", deadline);
    }

    function swapTokensForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual   returns (uint256[] memory amounts) {
        console.log("swapTokensForExactTokens");
        console.log("AmountIn %s", amountOut);
        console.log("amountOutMin %s", amountInMax);
        console.log("To %s", to);
        console.log("Deadline %s", deadline);
    }

    // liquidity
    function stakeTokens(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    )
        external
        virtual
         
        returns (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidity
        )
    {
        console.log("addLiquidity");
        console.log("tokenA %s", tokenA);
        console.log("tokenB %s", tokenB);
        console.log("amountADesired %s", amountADesired);
        console.log("amountBDesired %s", amountBDesired);
        console.log("amountAMin %s", amountAMin);
        console.log("to %s", to);
        console.log("deadline %s", deadline);
           // Require amount greater than 0
        require(amountADesired > 0, "amount cannot be 0");

        // Trasnfer Mock Dai tokens to this contract for staking
        duniaToken.transferFrom(msg.sender, address(this), amountADesired);

        // Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + amountADesired;

        // Add user to stakers array *only* if they haven't staked already
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    // Remove liquidity
    function unstakeTokens(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) public virtual   returns (uint256 amountA, uint256 amountB) {
        console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens");
        console.log("tokenA %s", tokenA);
        console.log("tokenB %s", tokenB);
        console.log("liquidity %s", liquidity);
        console.log("amountAMin %s", amountAMin);
        console.log("amountBMin %s", amountBMin);
        console.log("to %s", to);
        console.log("deadline %s", deadline);
        // Fetch staking balance
        uint balance = stakingBalance[msg.sender];

        // Require amount greater than 0
        require(balance > 0, "staking balance cannot be 0");

        // Transfer Mock Dai tokens to this contract for staking
        duniaToken.transfer(msg.sender, balance);

        // Reset staking balance
        stakingBalance[msg.sender] = 0;

        // Update staking status
        isStaking[msg.sender] = false;
    }

      function disburseRewards() public {
        // Only owner can call this function
        require(msg.sender == owner, "caller must be the owner");

        // Issue tokens to all stakers
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                duniaToken.transfer(recipient, balance);
            }
        }
    }

}
