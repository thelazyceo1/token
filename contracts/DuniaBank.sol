// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "hardhat/console.sol";

contract DuniaBank {
    uint8 private count;

    mapping(address => uint256) private balances;
    address public owner;

    // Log the event about a deposit being made by an address and its amount
    event LogDepositMade(address indexed accountAddress, uint256 amount);

    // Constructor is "payable" so it can receive the initial funding of 30,
    // required to reward the first 3 clients
    constructor() public payable {
        /* Set the owner to the creator of this contract */
        owner = msg.sender;
        count = 0;
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
    /// @return The balance remaining for the user
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
    ) public pure virtual   returns (uint256 amountB) {
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

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external virtual   {
        console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens");
        console.log("AmountIn %s", amountIn);
        console.log("amountOutMin %s", amountOutMin);
        console.log("To %s", to);
        console.log("Deadline %s", deadline);
    }

    // liquidity
    function addLiquidity(
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
        console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens");
        console.log("tokenA %s", tokenA);
        console.log("tokenB %s", tokenB);
        console.log("amountADesired %s", amountADesired);
        console.log("amountBDesired %s", amountBDesired);
        console.log("amountAMin %s", amountAMin);
        console.log("to %s", to);
        console.log("deadline %s", deadline);
    }

    // Remove liquidity
    function removeLiquidity(
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
    }

    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external virtual   returns (uint256 amountA, uint256 amountB) {
        console.log("swapExactTokensForTokensSupportingFeeOnTransferTokens");
        console.log("tokenA %s", tokenA);
        console.log("tokenB %s", tokenB);
        console.log("liquidity %s", liquidity);
        console.log("amountAMin %s", amountAMin);
        console.log("amountBMin %s", amountBMin);
        console.log("to %s", to);
        console.log("deadline %s", deadline);
        console.log("deadline %s", approveMax);
    }
}
