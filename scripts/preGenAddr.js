// // We require the Hardhat Runtime Environment explicitly here. This is optional 
// // but useful for running the script in a standalone fashion through `node <script>`.
// //
// // When running the script with `hardhat run <script>` you'll find the Hardhat
// // Runtime Environment's members available in the global scope.

const hre = require("hardhat");
var util = require('ethereumjs-util');
const rlp = require('rlp');
const keccak = require('keccak');
var Web3 = require("web3");
const EthereumTx = require('ethereumjs-tx').Transaction

  //
  var web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/87f22cd7f536407d82b4b044c6c6e15e'));
  console.log("main");
  //console.log(web3.eth);
  //账号地地址
  const walllet_addr = "0x79DE52CF8d9d0358Abc38b3b01A14C52A47d84d7";
  //获取nonce,使用本地私钥发送交易
  web3.eth.getTransactionCount(walllet_addr).then(
    nonce => {
        console.log("approve nonce: ",nonce+1);
        var sender = '0x79DE52CF8d9d0358Abc38b3b01A14C52A47d84d7'; //Requires a hex string as input!
        var input_arr = [ sender, nonce+1 ];
        var rlp_encoded = rlp.encode(input_arr);
        var contract_address_long = keccak('keccak256').update(rlp_encoded).digest('hex');
        var contract_address = contract_address_long.substring(24); //Trim the first 24 characters.
        console.log("contract_address: " + contract_address);
    },
    e => console.log(e)
  );

  //e119fcc37f5e209a2f57581cd4af2845c237de09 15