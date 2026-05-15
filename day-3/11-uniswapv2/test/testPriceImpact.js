const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Price Impact and Constant Product", function () {
    let signer;
    let factory, router, token0, token1, pair;

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

        const pairAddress = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );

        pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

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

    async function getMappedReserves() {
        const reserves = await pair.getReserves();

        const token0Address = await token0.getAddress();
        const token1Address = await token1.getAddress();

        return token0Address < token1Address
            ? [reserves[0], reserves[1]]
            : [reserves[1], reserves[0]];
    }

    it("Should update reserves after swap and keep product increasing due to fee", async function () {
        const [reserve0Before, reserve1Before] = await getMappedReserves();

        const kBefore = reserve0Before * reserve1Before;

        console.log("Reserve0 before:", ethers.formatEther(reserve0Before));
        console.log("Reserve1 before:", ethers.formatEther(reserve1Before));
        console.log("K before:", kBefore.toString());

        const swapAmountIn = ethers.parseEther("10");

        const path = [
            await token0.getAddress(),
            await token1.getAddress(),
        ];

        const amountsOut = await router.getAmountsOut(swapAmountIn, path);
        const amountOutMin = amountsOut[1];

        await token0.approve(await router.getAddress(), swapAmountIn);

        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600;

        await router.swapExactTokensForTokens(
            swapAmountIn,
            amountOutMin,
            path,
            await signer.getAddress(),
            deadline
        );

        const [reserve0After, reserve1After] = await getMappedReserves();

        const kAfter = reserve0After * reserve1After;

        console.log("Reserve0 after:", ethers.formatEther(reserve0After));
        console.log("Reserve1 after:", ethers.formatEther(reserve1After));
        console.log("K after:", kAfter.toString());

        expect(reserve0After).to.be.greaterThan(reserve0Before);
        expect(reserve1After).to.be.lessThan(reserve1Before);

        // Because Uniswap charges a 0.3% fee, k usually increases after swap.
        expect(kAfter).to.be.greaterThan(kBefore);
    });

    it("Should show larger trades have worse average price", async function () {
        const smallInput = ethers.parseEther("10");
        const largeInput = ethers.parseEther("200");

        const path = [
            await token0.getAddress(),
            await token1.getAddress(),
        ];

        const smallOut = (await router.getAmountsOut(smallInput, path))[1];
        const largeOut = (await router.getAmountsOut(largeInput, path))[1];

        const smallAverageRate = (smallOut * ethers.parseEther("1")) / smallInput;
        const largeAverageRate = (largeOut * ethers.parseEther("1")) / largeInput;

        console.log("Small trade output:", ethers.formatEther(smallOut));
        console.log("Large trade output:", ethers.formatEther(largeOut));
        console.log("Small average rate:", ethers.formatEther(smallAverageRate));
        console.log("Large average rate:", ethers.formatEther(largeAverageRate));

        expect(largeAverageRate).to.be.lessThan(smallAverageRate);
    });
});
