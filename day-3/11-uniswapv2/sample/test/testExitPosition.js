const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("Test Exit Position", function () {
    let signer;
    let factory, router, token0, token1, pair;

    beforeEach(async function () {
        [signer] = await ethers.getSigners();

        // Deploy UniswapV2Factory
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await Factory.deploy(signer.address);

        // Deploy UniswapV2Router02
        const Router = await ethers.getContractFactory("UniswapV2Router02");
        router = await Router.deploy(
            factory.target,
            "0x0000000000000000000000000000000000000000" // WETH address (not used in this test)
        );

        // Deploy Token0
        const TokenA = await ethers.getContractFactory("DemoTokenA");
        token0 = await TokenA.deploy();

        // Deploy Token1
        const TokenB = await ethers.getContractFactory("DemoTokenB");
        token1 = await TokenB.deploy();

        // Deploy Pair
        await factory.createPair(
            await token0.getAddress(),
            await token1.getAddress()
        );

        // Add 1000 token0 and 5000 token1 as liquidity
        amount0 = ethers.parseEther("1000");
        amount1 = ethers.parseEther("5000");
        await token0.approve(await router.getAddress(), amount0);
        await token1.approve(await router.getAddress(), amount1);
        await router.addLiquidity(
            await token0.getAddress(),
            await token1.getAddress(),
            amount0,
            amount1,
            0,
            0,
            signer.address,
            ethers.MaxUint256
        );

        // buy 100 token0 with token1 to change the price
        const amountOut = ethers.parseEther("100");
        const path = [await token1.getAddress(), await token0.getAddress()];
        const to = signer.address;
        amountIn =
            (amount1 * amountOut * 1000n) / ((amount0 - amountOut) * 997n) + 1n;
        await token1.approve(await router.getAddress(), amountIn);
        await router.swapTokensForExactTokens(
            amountOut,
            amountIn,
            path,
            to,
            ethers.MaxUint256
        );
    });

    it("Should remove liquidity and receive tokens", async function () {
        const pairAddress = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

        // Get LP token balance
        const lpBalance = await pair.balanceOf(signer.address);
        console.log("LP Balance:", ethers.formatEther(lpBalance));

        // Check balances before liquidation
        const beforeLiquidation0 = await token0.balanceOf(signer.address);
        const beforeLiquidation1 = await token1.balanceOf(signer.address);

        // Liquidate full position
        await pair.approve(await router.getAddress(), lpBalance);
        let block = await ethers.provider.getBlock("latest");
        let deadline = block.timestamp + 1000;
        await router.removeLiquidity(
            await token0.getAddress(),
            await token1.getAddress(),
            lpBalance,
            0,
            0,
            signer.address,
            deadline
        );

        // Check balances after liquidation
        const afterLiquidation0 = await token0.balanceOf(signer.address);
        const afterLiquidation1 = await token1.balanceOf(signer.address);

        // Should be close to 900 token0
        console.log(
            "Receives Token0:",
            ethers.formatEther(afterLiquidation0 - beforeLiquidation0)
        );

        // Should be close to 5557.23 token1
        console.log(
            "Receives Token1:",
            ethers.formatEther(afterLiquidation1 - beforeLiquidation1)
        );

        // Total supply should left with exactly 1000 wei (minimum liquidity) after full withdrawal
        const totalSupply = await pair.totalSupply();
        console.log("Total Supply:", totalSupply);
        expect(totalSupply).to.equal(1000n);
    });
});
