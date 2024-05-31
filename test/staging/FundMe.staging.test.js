const { assert, expect } = require("chai");
const { ethers, getNamedAccounts, deployments, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config.js");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Fund me ", async () => {
          let deployer;
          let fundMe;
          const sendValue = ethers.parseEther("0.05");
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });
          it("allows people to fund and send ETH", async () => {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });
