// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;


import "./CfaPriceOracleInterface.sol";

contract MockCfaPriceOracle is CfaPriceOracleInterface {
     uint public price_;

    function setPrice(uint price) public {
      price_ = price;
    }

    function price() override public view returns (uint) {
      return price_;
    }
}