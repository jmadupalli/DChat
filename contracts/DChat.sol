// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract DChat {
    struct User {
        string name;
        address original;
        bool reg;
        uint n_msgs;
    }

    struct Message {
        address from;
        address to;
        string data;
    }

    mapping(address => string) public pub_keys;

    mapping(address => User) public users;

    mapping(address => Message[]) public messages;

    mapping(address => uint) public latest_timestamp;

    public n_users;

    modifier onlyNew(){
        require(users[msg.sender].reg == false, "Address is already registered");
        _;
    }
    modifier onlyRegistered() {
        require(users[msg.sender].reg == true, "User must be registered");
        _;
    }

    function registerUser(
        string memory _name,
        string memory _pubKey
    ) public onlyNewUser {
        n_users++;
        users[msg.sender] = User(_name, msg.sender, true, 0);
        pub_keys[msg.sender] = _pubKey;
    }

    function fetchPubKey(address to) public onlyRegistered returns(string memory) {
        require(users[to].reg == true, "Recipient is not a registered user");
        return pub_keys[to];
    }

    function sendMessage(address from, address to, string data) public onlyRegistered {
        Message memory temp = Message(from, to, data)
    }

}