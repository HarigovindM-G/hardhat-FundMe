const { network } = require("hardhat");

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

const { verify } = require("../utils/verify")

module.exports = async ({getNamedAccounts, deployments }) => {
//   const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await network.chainId;
  const chainName = await network.name;

  let ethUsdPriceFeed;

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeed = await ethUsdAggregator.address;
  }
  else{
    ethUsdPriceFeed = networkConfig[chainName]["ethUsdPriceFeed"];
  }

  const FundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeed],
    log: true,
  });
  console.log("Contract Deployed")
  console.log("-------------------------------------------------------");

  if(!developmentChains.includes(network.name)){
    await verify(FundMe.address,[ethUsdPriceFeed])
  }
};
module.exports.tags=["all","fundme"]
