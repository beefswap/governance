// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {

  //治理合约地址
  var wallet_addr = "1937d7886c8004acb443dd685d994452edfbfd64";
  //时间设定
  var lock_time = 7*3600*24;  //最小2天，最大30天

  //部署时间锁，需要（地址和delay参数）
  const Greeter1 = await hre.ethers.getContractFactory("Timelock");
  const greeter1 = await Greeter1.deploy(wallet_addr,lock_time);
  await greeter1.deployed();
  console.log("Timelock deployed to:", greeter1.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
