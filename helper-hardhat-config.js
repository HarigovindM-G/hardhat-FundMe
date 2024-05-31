const networkConfig = {
  "sepolia": {
    name: "Sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

const developmentChains = ["localhost", "hardhat"];

const DECIMALS = 8;
const INITIAL_PRICE = 200000000000;
module.exports = { networkConfig, developmentChains ,DECIMALS, INITIAL_PRICE};
