# DEFI(Uniswap V2) - Part 3

## Exit Position

When you add liquidity to a Uniswap V2 pool, you receive LP tokens representing your proportional ownership of the pool.
To exit, you simply burn your LP tokens through removeLiquidity().
This returns your share of token0 and token1 from the pool’s reserves.

Your share of the pool is always:

<center>

$\text{Share} = \dfrac{\text{Your LP Tokens}}{\text{Total LP Supply}}$

</center>

When you remove liquidity, the pool sends you that same proportion of both token reserves.

### Example - Exit Position

Consider the following (assuming token amounts are denominated in ether, 1 \* $10^{18}$):

-   Current Reserve of $token_0$ = 900
-   Current Reserve of $token_1$ = 5557.23
-   Your LP token balance = 2,236.06

So you redeem all your LP tokens (2,236.06):

-   Amount of $token_0$ you receive = 900
-   Amount of $token_1$ you receive = 5557.23

Note: In real Uniswap V2, a tiny MINIMUM_LIQUIDITY is permanently locked. For teaching clarity, we ignore that dust here.

---

## Impermanent Loss vs Fee Income

Consider the following (assuming token amounts are denominated in ether, 1 \* 1018):

Pool Value before Trade:

-   Initial reserve of token0 = 1000 (1 token0 is worth $5)
-   Initial reserve of token1 = 5000 (1 token1 is worth $1)
-   Initial Pool Value = 1000 _ $5 + 5000 _ $1 = $10,000

Reserve Amount after Trade:

-   Current reserve of token0 = 900
-   Current reserve of token1 = 5557.23

**Scenario 1: Assume no change in tokens' price**

-   Current reserve of token0 = 900
-   Current reserve of token1 = 5557.23
-   Current Pool Value = 900 _ $5 + 5557.23 _ $1 = $10,057.23
-   Profit/Loss = $10,057.23 - $10,000 = 57.23

In this scenario, there is no opportunity cost involved since token price is stagnant. The profit comes entirely from the 0.3% fee.

**Scenario 2: Assume price of token0 right now is $10**

-   Current reserve of token0 = 900
-   Current reserve of token1 = 5557.23
-   Current Pool Value = 900 _ $10 + 5557.23 _ $1 = $14,557.23
-   Profit/Loss = $14,557.23 - $10,000 = 4,557.23

But you would have made $15,000 - $10,000 = $5,000 if you held onto your tokens. This difference of $5000 - $4557.23 = $442.77 is known as **impermanent loss**. It represents the opportunity cost of providing liquidity versus simply holding.

When the pool contains stable-value assets (e.g., DAI/USDC), price divergence is minimal, and trading fees tend to outweigh impermanent loss — leading to steady growth in value.

---

## 🛠️ Lab Practise: Exit Position

In this lab, we will demonstrate how to redeem LP tokens to exit a liquidity position.

### Create test/testSwapTokens.js

Create the file `testSwapTokens.js` in the `test` directory with an empty test suite:

```js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Exit Position", function () {
    let signer;
    let factory, router, token0, token1;
});
```

For the subsequent stages involving the beforeEach setup and test cases, ensure to place the code inside the describe block.

### Insert the beforeEach setup into the describe block

The beforeEach function will setup up the testing environment before each test by deploying fresh instances of UniswapV2Factory, UniswapV2Router02, and two demo tokens.

Since the focus is on exit position, we will also create a liquidity pool, add liquidity to it and execute a trade to generate some fees.

<!-- prettier-ignore -->
```js
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
```

### Test: Remove liquidity using all LP tokens and receive tokens back

Add the following test case inside the describe block.

<!-- prettier-ignore -->
```js
    it("Should remove liquidity and receive tokens", async function () {


    });
```

In the subsequent steps below, make sure to place the code inside this test case.

-   **Step 1: Create an Instance of the Pair Contract**

    To trade between two tokens, you need to find the Uniswap V2 Pair contract that holds the liquidity pool for those tokens. You can do this by calling the `getPair(token0, token1)` function on the Uniswap V2 Factory contract and use it to create a contract instance.

    <!-- prettier-ignore -->
    ```javascript
        // Get the pair contract
        const pairAddress = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
    ```

-   **Step 2: Check Your LP Token Balance**

    When you add liquidity to a Uniswap V2 pool, you receive LP tokens representing your share of the pool. You can check your LP token balance by calling the `balanceOf(address)` function on the Pair contract.

    <!-- prettier-ignore -->
    ```javascript
        // Check LP token balance
        const lpBalance = await pair.balanceOf(signer.address);
        console.log("LP Token Balance:", ethers.formatEther(lpBalance));
    ```

    Check your balance of token0 and token1 before removing liquidity so that we can compute the amounts received later.

-   **Step 3: Liquidate Position**

    We will liquidate our entire position by removing all our LP tokens. To do this, we first need to approve the Uniswap V2 Router to spend our LP tokens. Then, we call the `removeLiquidity()` function on the Router contract.

    <!-- prettier-ignore -->
    ```javascript
        // Approve the router to spend your LP tokens
        await pair.approve(await router.getAddress(), lpBalance);
    ```

    Next, call the `removeLiquidity()` function:

    ```javascript
    // Remove liquidity
    const amount0Min = 0; // Accept any amount of token0
    const amount1Min = 0; // Accept any amount of token1
    let block = await ethers.provider.getBlock("latest");
    let deadline = block.timestamp + 1000;
    const tx = await router.removeLiquidity(
        await token0.getAddress(),
        await token1.getAddress(),
        lpBalance,
        amount0Min,
        amount1Min,
        signer.address,
        deadline
    );
    ```

-   **Step 4: Verify Received Amounts**

    Finally, check your balances of token0 and token1 after removing liquidity to see how much you received.

    <!-- prettier-ignore -->
    ```javascript
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

    ```

### Run the tests

Run the test using Hardhat.

```bash
hh test test/testExitPosition.js

#   Test Exit Position
# LP Balance: 2236.067977499789695409
# Receives Token0: 899.999999999999999597
# Receives Token1: 5557.227237267357625955
# Total Supply: 1000n
#     ✔ Should remove liquidity and receive tokens
```

The result shows that we successfully removed liquidity and received approximately 900 token0 and 5557.23 token1 which matches the result from [Example - Exit Position](#example---exit-position).
