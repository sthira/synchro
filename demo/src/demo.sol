// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Demo {
    // address of the owner
    address public owner;

    bytes32 public NUMBER_ROLE = 0x4e554d4245525f524f4c455f4f50455241544f52000000000000000000000000; // NUMBER_ROLE_OPERATOR
    bytes32 public STRING_ROLE = 0x535452494e475f524f4c455f4f50455241544f52000000000000000000000000; // STRING_ROLE_OPERATOR

    // tracking authorized operators and their assigned roles
    mapping(address => mapping(bytes32 => bool)) public operatorRoleAuth;

    uint256 public paramNumber;
    string public paramString;

    constructor(address owner_, uint256 paramNumber_) {
        owner = owner_;
        paramNumber = paramNumber_;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function addOperator(bytes32 role, address operator) public onlyOwner {
        operatorRoleAuth[operator][role] = true;
    }

    function removeOperator(bytes32 role, address operator) public onlyOwner {
        operatorRoleAuth[operator][role] = false;
    }

    modifier authorizedForRole(bytes32 role) {
        require(operatorRoleAuth[msg.sender][role], string(abi.encodePacked("Not authorized for ", role, " role")));
        _;
    }

    function updateNumber(uint256 newNumber) public authorizedForRole(NUMBER_ROLE) {
        paramNumber = newNumber;
    }

    function addString(string memory newString) public authorizedForRole(STRING_ROLE) {
        paramString = newString;
    }

    function removeString() public authorizedForRole(STRING_ROLE) {
        paramString = "";
    }
}
