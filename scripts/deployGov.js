// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {

  //部署投票合约，需要（时间锁地址，beef地址）
  //时间锁地址
  var time_lock_addr = "0xbA1665611b0395038D807Bd98dD87895cf91FfB7";
  var beef_addr = "0x833e7d4C9C943dD7b734fB7127e5e3f9C1a541E5";

  const Greeter = await hre.ethers.getContractFactory("GovernorAlpha");
  const greeter = await Greeter.deploy(time_lock_addr,beef_addr);
  await greeter.deployed();
  console.log("GovernorAlpha deployed to:", greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
