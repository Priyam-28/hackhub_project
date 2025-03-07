// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BilluCoins is ERC20, Ownable {
    uint256 public constant TOKEN_PRICE = 500; // 500 BUC per 0.1 ETH
    uint256 public constant ETH_PRICE = 0.1 ether;

    constructor() ERC20("Billu Coins", "BUC") Ownable(msg.sender) {
        _mint(msg.sender, 10000 * 10**decimals()); // Initial supply for deployer
        _mint(address(this), 50000 * 10**decimals()); // Supply for contract to sell
    }

    function mintTokens(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function buyTokens() public payable {
        require(msg.value == ETH_PRICE, "Send exactly 0.1 ETH");

        uint256 tokensToTransfer = TOKEN_PRICE * 10**decimals();
        require(balanceOf(address(this)) >= tokensToTransfer, "Not enough tokens in contract");

        _transfer(address(this), msg.sender, tokensToTransfer);
    }

    function getBalance(address user) public view returns (uint256) {
        return balanceOf(user);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
