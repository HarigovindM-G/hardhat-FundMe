const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
  console.log("Verifying the contract ...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already been verified")) {
      console.log("Already verified");
    } else {
      console.log(error);
    }
  }
};

module.exports = {verify};
