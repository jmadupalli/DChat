const hardhat = require("hardhat");
const ethers = hardhat.ethers;

async function main() {
  const DChat = await ethers.getContractFactory("DChat");
  const DChat_F = await DChat.deploy();

  console.log(DChat_F.target);
}
main().catch((err) => {
  console.error(err);
});
