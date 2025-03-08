// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NameWalletMapping {
    // Mapping from wallet address to name
    mapping(address => string) private names;
    
    // Event to log name registration
    event NameRegistered(address indexed user, string name);
    
    // Function to set name for the sender's wallet address
    function setName(string calldata _name) external {
        names[msg.sender] = _name;
        emit NameRegistered(msg.sender, _name);
    }
    
    // Function to get the name associated with a wallet address
    function getName(address _wallet) external view returns (string memory) {
        return names[_wallet];
    }
}