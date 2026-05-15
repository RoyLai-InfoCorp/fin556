const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test DemoToken", () => {it("Should approve 1 DEMO and receive Approval event", async () => {
    const response = await erc20.approve(accounts[1].address, 1);
    const receipt = await response.wait();

    const approvalLog = receipt.logs.find(
        (x) => x.fragment.name === "Approval"
    );

    const args = approvalLog.args.toObject();

    expect(args.owner).to.equal(accounts[0].address);
    expect(args.spender).to.equal(accounts[1].address);
    expect(args.value).to.equal(1n);
});it("Should transfer 1 DEMO and receive Transfer event", async () => {
    const response = await erc20.transfer(accounts[1].address, 1);
    const receipt = await response.wait();

    const transferLog = receipt.logs.find(
        (x) => x.fragment.name === "Transfer"
    );

    const args = transferLog.args.toObject();

    expect(args.from).to.equal(accounts[0].address);
    expect(args.to).to.equal(accounts[1].address);
    expect(args.value).to.equal(1n);
});
    it("Should transfer 1 DEMO from accounts[0] to accounts[1]", async () => {
    const before = await erc20.balanceOf(accounts[1].address);

    const response = await erc20.transfer(accounts[1].address, 1);
    await response.wait();

    const after = await erc20.balanceOf(accounts[1].address);
    expect(before + 1n).equals(after);
});
it("Should approve and transferFrom 1 DEMO from accounts[0] to accounts[1]", async () => {
    const before = await erc20.balanceOf(accounts[1].address);

    let response = await erc20.approve(accounts[1].address, 1);
    await response.wait();

    response = await erc20
        .connect(accounts[1])
        .transferFrom(accounts[0].address, accounts[1].address, 1);
    await response.wait();

    const after = await erc20.balanceOf(accounts[1].address);
    expect(before + 1n).equals(after);
});
    let erc20;
    let accounts;

    beforeEach(async () => {
        accounts = await ethers.getSigners();

        const factory = await ethers.getContractFactory("DemoToken");

        erc20 = await factory.deploy(
            ethers.parseUnits("1000", "ether"),
            accounts[0].address
        );

        await erc20.waitForDeployment();
    });

    it("Should call name() and get DemoToken", async () => {
        let name = await erc20.name();
        expect(name).to.equals("DemoToken");
    });

    it("Should call balanceOf() and get 1000 DEMO", async () => {
        let balance = await erc20.balanceOf(accounts[0].address);
        expect(balance).to.equals(ethers.parseUnits("1000", "ether"));
    });
});