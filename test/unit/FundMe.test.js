const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe;
          let deployer;
          let mockV3;

          const sendValue = "1000000000000000000";

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3 = await ethers.getContract("MockV3Aggregator", deployer);
          });

          describe("constructor", async () => {
              it("Sets the price feed correctly", async () => {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, await mockV3.getAddress());
              });

              it("Sets the deployer address as the contract owner address", async () => {
                  const owner = await fundMe.getOwner();
                  assert.equal(owner, deployer);
              });
          });

          describe("fund", async () => {
              it("Fails if you dont send enough ETH ", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Dint send enough Ether"
                  );
              });
              it("Funder gets added to the address array", async () => {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunders(0);
                  assert.equal(deployer, funder);
              });
              it("Address of the Funder is mapped to the amount he funded ", async () => {
                  await fundMe.fund({ value: sendValue });
                  const value = await fundMe.getAddresstoAmt(deployer);
                  assert.equal(sendValue, value);
              });
          });

          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });
              it("Withdraws the amount to the owners address", async () => {
                  //before
                  const ContractIntialBal = await ethers.provider.getBalance(
                      fundMe.target
                  );
                  const DeployerIntialBal = await ethers.provider.getBalance(
                      deployer
                  );

                  //inbetween
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReciept = await transactionResponse.wait(1);
                  //after
                  const { gasPrice, gasUsed } = transactionReciept;
                  const gasCost = gasPrice * gasUsed;

                  const ContractFinalBal = await ethers.provider.getBalance(
                      fundMe.target
                  );
                  const DeployerFinalBal = await ethers.provider.getBalance(
                      deployer
                  );

                  assert.equal(ContractFinalBal, 0);
                  assert.equal(
                      DeployerFinalBal + gasCost,
                      DeployerIntialBal + ContractIntialBal
                  );
              });
              it("Withdraws with multiple funders ", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < 5; i++) {
                      const fundMeconnected = await fundMe.connect(accounts[i]);
                      await fundMeconnected.fund({
                          value: sendValue,
                      });
                  }
                  const ContractIntialBal = await ethers.provider.getBalance(
                      fundMe.target
                  );
                  const DeployerIntialBal = await ethers.provider.getBalance(
                      deployer
                  );

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReciept = await transactionResponse.wait(1);
                  const { gasPrice, gasUsed } = transactionReciept;
                  const gasCost = gasPrice * gasUsed;

                  const ContractFinalBal = await ethers.provider.getBalance(
                      fundMe.target
                  );
                  const DeployerFinalBal = await ethers.provider.getBalance(
                      deployer
                  );

                  assert.equal(ContractFinalBal, 0);
                  assert.equal(
                      DeployerFinalBal + gasCost,
                      DeployerIntialBal + ContractIntialBal
                  );

                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  for (let i = 0; i < 5; i++) {
                      assert.equal(
                          await fundMe.getAddresstoAmt(accounts[i].address),
                          0
                      );
                  }
              });
              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const fundMeconnected = await fundMe.connect(attacker);
                  await expect(fundMeconnected.withdraw()).to.be.reverted;
              });
          });

          describe("cheapWithdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });
              it("Withdraws the amount to the owners address", async () => {
                  //before
                  const ContractIntialBal = await ethers.provider.getBalance(
                      fundMe.target
                  );
                  const DeployerIntialBal = await ethers.provider.getBalance(
                      deployer
                  );

                  //inbetween
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReciept = await transactionResponse.wait(1);
                  //after
                  const { gasPrice, gasUsed } = transactionReciept;
                  const gasCost = gasPrice * gasUsed;

                  const ContractFinalBal = await ethers.provider.getBalance(
                      fundMe.target
                  );
                  const DeployerFinalBal = await ethers.provider.getBalance(
                      deployer
                  );

                  assert.equal(ContractFinalBal, 0);
                  assert.equal(
                      DeployerFinalBal + gasCost,
                      DeployerIntialBal + ContractIntialBal
                  );
              });

              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const fundMeconnected = await fundMe.connect(attacker);
                  await expect(fundMeconnected.cheaperWithdraw()).to.be
                      .reverted;
              });
              it("Withdraws with multiple funders using cheaperWithdraw ", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < 5; i++) {
                      const fundMeconnected = await fundMe.connect(accounts[i]);
                      await fundMeconnected.fund({
                          value: sendValue,
                      });
                  }
                  const ContractIntialBal = await ethers.provider.getBalance(
                      fundMe.target
                  );
                  const DeployerIntialBal = await ethers.provider.getBalance(
                      deployer
                  );

                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReciept = await transactionResponse.wait(1);
                  const { gasPrice, gasUsed } = transactionReciept;
                  const gasCost = gasPrice * gasUsed;

                  const ContractFinalBal = await ethers.provider.getBalance(
                      fundMe.target
                  );
                  const DeployerFinalBal = await ethers.provider.getBalance(
                      deployer
                  );

                  assert.equal(ContractFinalBal, 0);
                  assert.equal(
                      DeployerFinalBal + gasCost,
                      DeployerIntialBal + ContractIntialBal
                  );

                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  for (let i = 0; i < 5; i++) {
                      assert.equal(
                          await fundMe.getAddresstoAmt(accounts[i].address),
                          0
                      );
                  }
              });
          });
      });
