// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;

interface IERC20Mintable {
    function mint(uint256 amount) external returns (bool);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function decimals() external returns (uint8);
}
