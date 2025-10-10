const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Swap Tokens", function () {
    let signer;
    let factory, router, token0, token1;

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

        // Approve tokens to router
        const amount0 = ethers.parseEther("1000");
        const amount1 = ethers.parseEther("5000");
        await token0.approve(await router.getAddress(), amount0);
        await token1.approve(await router.getAddress(), amount1);

        // Add liquidity
        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 1000;
        await router.addLiquidity(
            await token0.getAddress(),
            await token1.getAddress(),
            amount0,
            amount1,
            0,
            0,
            signer.address,
            deadline
        );
    });

    it("Should buy exact 100 * 10^18 of token0 for token1", async function () {
        // Step 1: Get the pair contract
        // -----------------------------------------------------------------

        const pairAddress = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

        // Step 2: Get Initial Pool Reserves
        // -----------------------------------------------------------------

        const reserves = await pair.getReserves();
        const [reserve0, reserve1] =
            (await token0.getAddress()) < (await token1.getAddress())
                ? [reserves._reserve0, reserves._reserve1]
                : [reserves._reserve1, reserves._reserve0];

        // Check initial balances for comparison later
        const initialBalanceToken0 = await token0.balanceOf(signer.address);
        const initialBalanceToken1 = await token1.balanceOf(signer.address);

        // Step 3: Decide the swap function to use
        // -----------------------------------------------------------------

        /*
        From UniswapV2Router02.sol contract:

        function swapTokensForExactTokens(
            uint amountOut,
            uint amountInMax,
            address[] calldata path,
            address to,
            uint deadline
            )
        */

        // argument 1: amountOut (amount of token0 to buy)
        const amountOut = ethers.parseEther("100");

        // argument 2: maxAmountIn (maximum amount of token1 to pay)

        // Calculate expected amount in using buy formula with 0.3% fee

        const reserveIn = reserve1; // token1 is input token
        const reserveOut = reserve0; // token0 is output token
        const expectedAmountIn =
            (reserveIn * amountOut * 1000n) /
                ((reserveOut - amountOut) * 997n) +
            1n;

        // Check offchain calculation against onchain function.
        const contractAmountIn = await router.getAmountIn(
            amountOut,
            reserveIn,
            reserveOut
        );
        expect(contractAmountIn).to.equal(expectedAmountIn);

        // Set maximum amount in with 5% slippage tolerance

        const amountInMax = (expectedAmountIn * 105n) / 100n;

        // argument 3: path (starts from input token1 to output token0)
        const path = [await token1.getAddress(), await token0.getAddress()];

        // argument 4: to (recipient address)
        const to = signer.address;

        // argument 5: deadline (set later)
        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 1000;

        // Step 4: Approve Uniswap Router to Spend Input Tokens
        // -----------------------------------------------------------------
        await token1.approve(await router.getAddress(), amountInMax);

        // Step 5: Execute the Swap
        // -----------------------------------------------------------------
        await router.swapTokensForExactTokens(
            amountOut,
            amountInMax,
            path,
            to,
            deadline
        );

        // Check final balances
        const finalBalanceToken0 = await token0.balanceOf(signer.address);
        const finalBalanceToken1 = await token1.balanceOf(signer.address);

        console.log(
            "Amount of token0 increased:",
            ethers.formatEther(finalBalanceToken0 - initialBalanceToken0)
        );
        console.log(
            "Amount of token1 decreased:",
            ethers.formatEther(initialBalanceToken1 - finalBalanceToken1)
        );

        expect(finalBalanceToken0).to.equal(initialBalanceToken0 + amountOut);
        expect(finalBalanceToken1).to.equal(
            initialBalanceToken1 - expectedAmountIn
        );
    });
});
