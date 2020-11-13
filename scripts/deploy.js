// // We require the Hardhat Runtime Environment explicitly here. This is optional 
// // but useful for running the script in a standalone fashion through `node <script>`.
// //
// // When running the script with `hardhat run <script>` you'll find the Hardhat
// // Runtime Environment's members available in the global scope.

const hre = require("hardhat");
const rlp = require('rlp');
const keccak = require('keccak');
var Web3 = require("web3");

//
var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/87f22cd7f536407d82b4b044c6c6e15e'));
console.log("main");
//console.log(web3.eth);
//账号地地址
const walllet_addr = "0x79DE52CF8d9d0358Abc38b3b01A14C52A47d84d7";

//部署时间锁
async function deloy( addr_gov ,addr_tl ) {
  addr_gov = "0x" + addr_gov;
  console.log("deloyTL addr:", addr_gov);
  //var wallet_addr = "1937d7886c8004acb443dd685d994452edfbfd64";
  //时间设定
  var lock_time = 7*3600*24;  //最小2天，最大30天
  //部署时间锁，需要（地址和delay参数）
  const Greeter1 = await hre.ethers.getContractFactory("Timelock");
  const greeter1 = await Greeter1.deploy(addr_gov,lock_time);
  await greeter1.deployed();
  console.log("Timelock deployed to:", greeter1.address);
  //
  //部署投票合约，需要（时间锁地址，beef地址）
  addr_tl = "0x" + addr_tl;
  console.log("deloyGov addr:", addr_tl);
  //时间锁地址
  var beef_addr = "0x833e7d4C9C943dD7b734fB7127e5e3f9C1a541E5";
  const Greeter = await hre.ethers.getContractFactory("GovernorAlpha");
  const greeter = await Greeter.deploy(addr_tl,beef_addr);
  await greeter.deployed();
  console.log("GovernorAlpha deployed to:", greeter.address);
}

//部署治理
async function deloyGov( addr_tl ) {
  //部署投票合约，需要（时间锁地址，beef地址）
  var addr = "0x" + addr_tl;
  console.log("deloyGov addr:", addr);
  //时间锁地址
  var beef_addr = "0x833e7d4C9C943dD7b734fB7127e5e3f9C1a541E5";
  const Greeter = await hre.ethers.getContractFactory("GovernorAlpha");
  const greeter = await Greeter.deploy(addr,beef_addr);
  await greeter.deployed();
  console.log("GovernorAlpha deployed to:", greeter.address);
}

//获取nonce,使用本地私钥发送交易
web3.eth.getTransactionCount(walllet_addr).then(
  nonce => {
    //
    console.log("approve nonce: ",nonce);
    var sender = '0x79DE52CF8d9d0358Abc38b3b01A14C52A47d84d7'; //Requires a hex string as input!
    console.log("sender: ",sender);
    //
    var input_arr_0 = [ sender, nonce ];
    var rlp_encoded_0 = rlp.encode(input_arr_0);
    var contract_address_long_0 = keccak('keccak256').update(rlp_encoded_0).digest('hex');
    var contract_address_0 = contract_address_long_0.substring(24); //Trim the first 24 characters.
    console.log("nonce: " + input_arr_0[1] + " contract_address_0: " + contract_address_0);
    //
    var input_arr_1 = [ sender, nonce+1 ];
    var rlp_encoded_1 = rlp.encode(input_arr_1);
    var contract_address_long_1 = keccak('keccak256').update(rlp_encoded_1).digest('hex');
    var contract_address_1 = contract_address_long_1.substring(24); //Trim the first 24 characters.
    console.log("nonce: " + input_arr_1[1] + " contract_address_1: " + contract_address_1);
    //部署合约
    deloy( contract_address_1 ,contract_address_0 );
  },
  e => console.log(e)
);

// npx hardhat run --network ropsten scripts/deploy.js