// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "./CfaPriceOracleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Xof is ERC20 {
  CfaPriceOracleInterface priceOracle;

  constructor(address cfaPriceOracleAddress) ERC20("XOF",  "CFA pegged Celo backed stablecoin") {
         priceOracle = CfaPriceOracleInterface(cfaPriceOracleAddress);
    }
    
  function donate() public payable {}

  function issue() public payable {
    uint amountInCents = (msg.value * priceOracle.price()) / 1 ether;
    _mint(msg.sender, amountInCents * (10 ** uint256(decimals())));
  }

  function getPrice() public returns (uint) {
    return priceOracle.price();
  }

  function withdraw(uint amountInCents) public returns (uint amountInWei){
    assert(amountInCents <= balanceOf(msg.sender));
    amountInWei = (amountInCents * 1 ether) / priceOracle.price();

    // If we don't have enough Ether in the contract to pay out the full amount
    // pay an amount proportinal to what we have left.
    // this way user's net worth will never drop at a rate quicker than
    // the collateral itself.

    // For Example:
    // A user deposits 1 Ether when the price of Ether is $300
    // the price then falls to $150.
    // If we have enough Ether in the contract we cover ther losses
    // and pay them back 2 ether (the same amount in USD).
    // if we don't have enough money to pay them back we pay out
    // proportonailly to what we have left. In this case they'd
    // get back their original deposit of 1 Ether.
    if(address(this).balance <= amountInWei) {
      amountInWei = (amountInWei * address(this).balance * priceOracle.price()) / (1 ether * totalSupply());
    }
    _burn(msg.sender, amountInCents * (10 ** uint256(decimals())));
  }
}
