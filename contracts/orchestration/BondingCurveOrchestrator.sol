pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../oracle/BondingCurveOracle.sol";
import "../bondingcurve/EthBondingCurve.sol";
import "./IOrchestrator.sol";

contract BondingCurveOrchestrator is IBondingCurveOrchestrator, Ownable {
    uint256 private constant SPLITTER_GRANULARITY = 10000;

    function init(
        address core,
        address uniswapOracle,
        address ethUniswapPCVDeposit,
        uint256 scale,
        uint256 thawingDuration,
        uint256 bondingCurveIncentiveDuration,
        uint256 bondingCurveIncentiveAmount
    )
        public
        override
        onlyOwner
        returns (address ethBondingCurve, address bondingCurveOracle)
    {
        uint256[] memory ratios = new uint256[](1);
        ratios[0] = SPLITTER_GRANULARITY; // 100% to the ethUniswapPCVDeposit
        address[] memory allocations = new address[](1);
        allocations[0] = address(ethUniswapPCVDeposit);
        ethBondingCurve = address(
            new EthBondingCurve(
                scale,
                core,
                allocations,
                ratios,
                uniswapOracle,
                bondingCurveIncentiveDuration,
                bondingCurveIncentiveAmount
            )
        );
        bondingCurveOracle = address(
            new BondingCurveOracle(
                core,
                uniswapOracle,
                ethBondingCurve,
                thawingDuration
            )
        );
        return (ethBondingCurve, bondingCurveOracle);
    }

    function detonate() public override onlyOwner {
        selfdestruct(payable(owner()));
    }
}
