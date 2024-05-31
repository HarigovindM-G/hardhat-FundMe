const { deployments, getNamedAccounts, ethers } = require("hardhat");

async function main(){
    console.log("Funding .... ")
    const deployer =(await getNamedAccounts()).deployer;
    const fundMe = await ethers.getContract("FundMe",deployer)
    const response = await fundMe.fund({value:ethers.parseEther("1")})
    await response.wait(1);
    console.log("1 Ether Funded to the contract ")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
