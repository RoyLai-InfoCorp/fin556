const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Swap", function () {
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
            "0x0000000000000000000000000000000000000000"
        );

        // Deploy token0
        const TokenA = await ethers.getContractFactory("DemoTokenA");
        token0 = await TokenA.deploy();

        // Deploy token1
        const TokenB = await ethers.getContractFactory("DemoTokenB");
        token1 = await TokenB.deploy();

        // Create pair
        const txCreate = await factory.createPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        await txCreate.wait();

        const pairAddress = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );

        pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

        // Add initial liquidity
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

    it("Should swap token0 for token1", async function () {
        const swapAmountIn = ethers.parseEther("10");

        const path = [
            await token0.getAddress(),
            await token1.getAddress(),
        ];

        // Check expected output from router
        const amountsOut = await router.getAmountsOut(swapAmountIn, path);
        const expectedAmountOut = amountsOut[1];

        console.log("Expected token1 out:", ethers.formatEther(expectedAmountOut));

        const signerAddress = await signer.getAddress();

        const token0Before = await token0.balanceOf(signerAddress);
        const token1Before = await token1.balanceOf(signerAddress);

        // Approve router to spend token0
        await token0.approve(await router.getAddress(), swapAmountIn);

        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600;

        // Set amountOutMin slightly lower than expected output
        // Here we use exact expected output for local deterministic test
        const amountOutMin = expectedAmountOut;

        const tx = await router.swapExactTokensForTokens(
            swapAmountIn,
            amountOutMin,
            path,
            signerAddress,
            deadline
        );

        await tx.wait();

        const token0After = await token0.balanceOf(signerAddress);
        const token1After = await token1.balanceOf(signerAddress);

        console.log("Token0 before:", ethers.formatEther(token0Before));
        console.log("Token0 after:", ethers.formatEther(token0After));
        console.log("Token1 before:", ethers.formatEther(token1Before));
        console.log("Token1 after:", ethers.formatEther(token1After));

        expect(token0Before - token0After).to.equal(swapAmountIn);
        expect(token1After - token1Before).to.equal(expectedAmountOut);
    });
});
