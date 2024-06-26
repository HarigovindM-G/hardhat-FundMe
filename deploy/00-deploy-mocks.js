const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
} = require("../helper-hardhat-config");
module.exports = async () => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();


  if (developmentChains.includes(network.name)) {
    console.log("Local development Chain detected. Deploying mocks....");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    console.log("Mock Deployed");
    console.log("-------------------------------------------------------");
  }
};
module.exports.tags = ["all", "mocks"];
