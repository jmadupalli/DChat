# Welcome to Hack Midwest 2023!

<br /><br />

## Getting Started

Ensure you have reviewed the [Rules & FAQ](https://hackmidwest.com/#faq)

1. Clone this repository and rename to the name of your app or idea
2. Make it **private**
3. Add pr@kcitp.com as a user
4. Populate the Team, App & Challenges info below and update as needed

<br /><br />

## Who's on your team?

_List the full names, email address & Github username of your teammates_

1.  **Jayanth Madupalli** || **jayanth8644@missouristate.edu** || **jmadupalli** (flew solo, indeed!)
2.
3.
4.
5.

<br /><br />

## What is the name of your App?

DChat - Decentralized Chat
<br /><br />

## What does your app do?

This application addresses the two biggest concerns involving Web 2.0 messaging apps.

1. Privacy
2. Integrity

### How?

Two words: Blockchain Technology.

Introducing DChat, A pure decentralized application (dApp) for chat that uses the Ethereum, providing a secure, transparent, privacy preserving, and integrity assuring messaging application using the power of Web 3.0.

### Internal working of the Ethereum Smart Contract (Web3.0):

DChat.sol, the backbone of this dApp is equipped with a lot of necessary methods and event emitters to facilitate the functioning of the application.
The dApp creates a new ethereum-identity (new key pair) just for the encryption and decryption process of messages.
A user uses his ETH wallet to register with the smart contract by sending his name, and the newly created public key. This stored public key is used to encrypt messages sent to this specific user.
Any user sending a message, will retrieve the public key of the recipient from the smart contract, encrypt it using the recipients public key and send it through the smart contract.
This message is emitted as an event/fetched from history by the recipient and decrypted with his private key (stored in browser local storage).
Ideally, this process should be done using WebSockets and an actual backend with a database and smart contract should be used to verify hashes accordingly. To maintain the purity as a dApp and simplify the implementation, I've chosen to use the smart contract for this process.

### React Client:

The user does not directly interact with the blockchain/smart contract himself, It is done through the React client. React UI is connected to our hardhat local node which then interacts with the smart contract using the EthersJS library based on user interactions.
We lookup the user name based on recipients address, and fetch the user's public key on the client. We encrypt and decrypt messages using public key, and private key on the react side as well.

### File Sharing (Pinata):

DChat not only supports text, you can also share files! Thanks to Pinata's easy to use API, you can send files using DChat and pinata without compromising on decentralization.
A file is selected to be sent in the chat window, this is then posted to Pinata's IPFS, the IpfsHash is then sent to the recipient after encryption.
On the recipient's end, our React UI decrypts the IpfsHash, and uses Pinata's gateway to let the recipient open/download the file.

### Why is there a lot of encryption?:

Remember the first concern I mentioned? Privacy! The entire code of the application is open source, there is no blackbox anywhere, and the encryption mechanism is ethereum-spec. Moreover, the application is using the Smart Contract to send and deliver messages, and anything on the blockchain is publicly visible. So, one must encrypt or do not send sensitive information over blockchain.

### How does this assure Integrity?:

Blockchain characteristics make sure there is no mutation, there is no probable way for a malicious user to interrupt the message and change its contents, and moreover, even if they wanted to do so, they need the private key that's only on your machine!

### Summary:

This is a great way to utilize web 3.0, and based on the targeted user base, some changes can be easily made to ensure some level of scalability. This application provides the ability to securely chat with another individual while ensuring integrity of the messages as well. Moreover, the application also supports file sharing using Pinata, a decentralized file sharing service!
<br /><br />

## What challenges are you building for? SELECT ALL THAT APPLY

_See hackmidwest.com/#prizes for challenge details_

- [x] Pinata Web3 Challenge
- [x] Pinata Challenge
- [ ] Pinata ERC-6551 Challenge
- [ ] Okta Challenge
- [ ] GEHA Generative AI Emergency Response Challenge
- [ ] Corporate Challenge (only for official company teams)
- [x] College Challenge (only for teams of up to 5 CS students from the same school)

<br /><br />
