// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {Erc20, CErc20, CEth, Comptroller, PriceFeed, OptionFactory} from "./interface.sol";
import {IOptionHelper} from "./IOptionHelper.sol";
import "./IPodOption.sol";

contract MyContract {
    event MyLog(string, uint256);
    OptionFactory optionFactory = OptionFactory(0x43fF98EB7Ec681A7DBF7e2b2C3589E79d5ce11E3);

    function borrowErc20Example(
        address payable _cEtherAddress,
        address _comptrollerAddress,
        address _priceFeedAddress,
        address _cTokenAddress,
        uint _underlyingDecimals
    ) public payable returns (uint256) {
        CEth cEth = CEth(_cEtherAddress);
        Comptroller comptroller = Comptroller(_comptrollerAddress);
        PriceFeed priceFeed = PriceFeed(_priceFeedAddress);
        CErc20 cToken = CErc20(_cTokenAddress);

        // Supply ETH as collateral, get cETH in return
        cEth.mint{ value: msg.value, gas: 250000 }();

        // Enter the ETH market so you can borrow another type of asset
        address[] memory cTokens = new address[](1);
        cTokens[0] = _cEtherAddress;
        uint256[] memory errors = comptroller.enterMarkets(cTokens);
        if (errors[0] != 0) {
            revert("Comptroller.enterMarkets failed.");
        }

        // Get my account's total liquidity value in Compound
        (uint256 error, uint256 liquidity, uint256 shortfall) = comptroller
            .getAccountLiquidity(address(this));
        if (error != 0) {
            revert("Comptroller.getAccountLiquidity failed.");
        }
        require(shortfall == 0, "account underwater");
        require(liquidity > 0, "account has excess collateral");

        uint256 underlyingPrice = priceFeed.getUnderlyingPrice(_cTokenAddress);
        uint256 maxBorrowUnderlying = liquidity / underlyingPrice;

        // Borrowing near the max amount will result
        // in your account being liquidated instantly
        emit MyLog("Maximum underlying Borrow (borrow far less!)", maxBorrowUnderlying);

        // Borrow underlying
        uint256 numUnderlyingToBorrow = 20;

        // Borrow, check the underlying balance for this contract's address
        cToken.borrow(numUnderlyingToBorrow * 10**_underlyingDecimals);

        // Get the borrow balance
        uint256 borrows = cToken.borrowBalanceCurrent(address(this));
        emit MyLog("Current underlying borrow amount", borrows);

        return borrows;
    }

    /*
    * @param optionAmount Amount of options to mint
    * @param tokenAmount Amount of tokens to provide as liquidity
    */
    function mintAndAddLiquidity(uint256 optionAmount, uint256 tokenAmount) public payable {
        IOptionHelper Ioptionhelper = IOptionHelper(0xCb674dF88EC8103fef28d1995efD400905c6adF6);
        IPodOption option = IPodOption(0x049dfA51Cdc5c68fcb57dF1B43a03B4494623159);
        Ioptionhelper.mintAndAddLiquidity(option, optionAmount, tokenAmount);
    }

}
