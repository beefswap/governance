require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

//普通task
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

//带参数的task
task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async taskArgs => {
    const account = web3.utils.toChecksumAddress(taskArgs.account);
    const balance = await web3.eth.getBalance(account);
    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
});
  
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "ropsten",
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/30bf4bface004c04b0ee6fa05753adca",
      accounts: ['8cbbd8190746b7df88b5fd311d7fb73fe37c0267328fb4b23005dfe8e1d74be6'],
      gasPrice: 20000000000   
    },
    ropsten: {
      //测试网节点
      url: "https://ropsten.infura.io/v3/87f22cd7f536407d82b4b044c6c6e15e",
      //账号私钥
      accounts: ['7a0865964b27ab50e3aa959ae17ebf9889932021a2add3c9cb8f607b7715fc0a']
    }
  },
  solidity: {
    version: "0.5.16",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999
      },
      evmVersion : "istanbul"
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  //etherscan的配置
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "3T7VS1VVHKTR292A6BUTTBT4MNKGU54G7Q"
  }

};

//npx hardhat --network ropsten etherscan-verify etherscan



