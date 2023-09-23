const hardhat = require("hardhat");
const ethers = hardhat.ethers;

async function main() {
  const DChat = await ethers.getContractFactory("DChat");
  const DChat_F = await DChat.deploy();

  await DChat_F.waitForDeployment();

  console.log(await DChat_F.getAddress());
}

main().catch((err) => {
  console.error(err);
});
