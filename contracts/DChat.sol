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

    struct RegCheck {
        bool status;
        string name;
    }

    event NewMessage(Message m);

    mapping(address => string) public pub_keys;

    mapping(address => User) public users;

    mapping(address => Message[]) public messages;

    mapping(address => uint) public latest_timestamp;

    uint public n_users;

    modifier onlyNew(){
        require(users[msg.sender].reg == false, "Address is already registered");
        _;
    }
    modifier onlyRegistered() {
        require(users[msg.sender].reg == true, "User must be registered");
        _;
    }

    function isRegistered(address user) public view returns (RegCheck memory) {
        if(users[user].reg == true){
            return RegCheck(true, users[user].name);
        }
        return RegCheck(false, users[user].name);
    }

    function registerUser(
        string memory _name,
        string memory _pubKey
    ) public onlyNew {
        n_users++;
        users[msg.sender] = User(_name, msg.sender, true, 0);
        pub_keys[msg.sender] = _pubKey;
    }

    function fetchPubKey(address to) public view onlyRegistered returns(string memory) {
        require(users[to].reg == true, "Recipient is not a registered user");
        return pub_keys[to];
    }

    function sendMessage(address to, string memory data) public onlyRegistered {
        Message memory temp = Message(msg.sender, to, data);

        messages[msg.sender].push(temp);
        messages[to].push(temp);
        users[msg.sender].n_msgs++;
        users[to].n_msgs++;
        emit NewMessage(temp);
    }

    function fetchMessageCount() public view onlyRegistered returns(uint) {
        return users[msg.sender].n_msgs;
    }

    function fetchMessages() public view onlyRegistered returns(Message[] memory) {
        return messages[msg.sender];
    }

}