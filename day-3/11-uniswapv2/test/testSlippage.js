const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Slippage Protection", function () {
    let signer;
    let factory, router, token0, token1;

    beforeEach(async function () {
        [signer] = await ethers.getSigners();

        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await Factory.deploy(signer.address);

        const Router = await ethers.getContractFactory("UniswapV2Router02");
        router = await Router.deploy(
            factory.target,
            "0x0000000000000000000000000000000000000000"
        );

        const TokenA = await ethers.getContractFactory("DemoTokenA");
        token0 = await TokenA.deploy();

        const TokenB = await ethers.getContractFactory("DemoTokenB");
        token1 = await TokenB.deploy();

        await factory.createPair(
            await token0.getAddress(),
            await token1.getAddress()
        );

        const amount0 = ethers.parseEther("1000");
        const amount1 = ethers.parseEther("5000");

        await token0.approve(await router.getAddress(), amount0);
        await token1.approve(await router.getAddress(), amount1);

        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600;

        await router.addLiquidity(
            await token0.getAddress(),
            await token1.getAddress(),
            amount0,
            amount1,
            amount0,
            amount1,
            await signer.getAddress(),
            deadline
        );
    });

    it("Should fail if amountOutMin is too high", async function () {
        const swapAmountIn = ethers.parseEther("10");

        const path = [
            await token0.getAddress(),
            await token1.getAddress(),
        ];

        const amountsOut = await router.getAmountsOut(swapAmountIn, path);
        const expectedAmountOut = amountsOut[1];

        console.log("Expected token1 out:", ethers.formatEther(expectedAmountOut));

        // 故意设置一个不可能达到的最低输出
        const tooHighAmountOutMin = expectedAmountOut + 1n;

        await token0.approve(await router.getAddress(), swapAmountIn);

        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600;

        let failed = false;

        try {
            await router.swapExactTokensForTokens(
                swapAmountIn,
                tooHighAmountOutMin,
                path,
                await signer.getAddress(),
                deadline
            );
        } catch (error) {
            failed = true;
            console.log("Swap failed as expected because amountOutMin is too high");
        }

        expect(failed).to.equal(true);
    });

    it("Should pass if amountOutMin is lower than expected output", async function () {
        const swapAmountIn = ethers.parseEther("10");

        const path = [
            await token0.getAddress(),
            await token1.getAddress(),
        ];

        const amountsOut = await router.getAmountsOut(swapAmountIn, path);
        const expectedAmountOut = amountsOut[1];

        // 设置 1% 滑点容忍度
        const amountOutMin = (expectedAmountOut * 99n) / 100n;

        console.log("Expected token1 out:", ethers.formatEther(expectedAmountOut));
        console.log("Minimum acceptable token1 out:", ethers.formatEther(amountOutMin));

        await token0.approve(await router.getAddress(), swapAmountIn);

        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600;

        const token1Before = await token1.balanceOf(await signer.getAddress());

        const tx = await router.swapExactTokensForTokens(
            swapAmountIn,
            amountOutMin,
            path,
            await signer.getAddress(),
            deadline
        );

        await tx.wait();

        const token1After = await token1.balanceOf(await signer.getAddress());

        expect(token1After).to.be.greaterThan(token1Before);
    });
});
