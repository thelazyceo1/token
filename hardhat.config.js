require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-solhint");
require("@tenderly/hardhat-tenderly");
require("@ubeswap/hardhat-celo");
require("dotenv/config");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-waffle");
require("hardhat-spdx-license-identifier");
require("hardhat-watcher");
require("solidity-coverage");



// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const accounts = {
  mnemonic:
    process.env.MNEMONIC ||
    "test test test test test test test test test test test junk",
  path: "m/44'/52752'/0'/0/",
};


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.7.3",
  defaultNetwork: "hardhat",
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    excludeContracts: ["contracts/mocks/", "contracts/libraries/"],
  },
  networks: {
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts,
      chainId: 44787,
      live: true,
      gasPrice: 0.5 * 10 ** 9,
      gas: 8000000,
    },
    baklava: {
      url: "https://baklava-forno.celo-testnet.org",
      accounts,
      chainId: 62320,
      live: true,
      gasPrice: 0.5 * 10 ** 9,
      gas: 8000000,
    },
    mainnet: {
      url: "https://forno.celo.org",
      accounts,
      chainId: 42220,
      live: true,
      gasPrice: 0.5 * 10 ** 9,
      gas: 8000000,
    },
    hardhat: {},
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  tenderly: {
    project: process.env.TENDERLY_PROJECT,
    username: process.env.TENDERLY_USERNAME,
  },
  watcher: {
    compile: {
      tasks: ["compile"],
      files: ["./contracts"],
      verbose: true,
    },
  },
};
