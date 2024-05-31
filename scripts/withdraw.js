const { deployments, getNamedAccounts, ethers } = require("hardhat");

async function main(){
    console.log("Funding .... ")
    const deployer =(await getNamedAccounts()).deployer;
    const fundMe = await ethers.getContract("FundMe",deployer)
    const response = await fundMe.withdraw()
    await response.wait(1);
    console.log("Fund withdrawn ")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
