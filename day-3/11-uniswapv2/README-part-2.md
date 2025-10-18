# DEFI(Uniswap V2) - Part 2

## How Uniswap V2 Pricing Works

### Spot Price

In a Uniswap v2 pool, the spot price comes from the reserve ratio.

Given tokens $token_0$ and $token_1$ in a liquidity pool, denote:

-   $x$ as the reserve of $token_0$
-   $y$ as the reserve of $token_1$

Then:

-   Price of $token_0$ ($P_0$) in $token_1$ is:

    $P_0$ = $\dfrac{y}{x}$

-   Price of $token_1$ ($P_1$) in $token_0$ is:

    $P_1$ = $\dfrac{x}{y}$

⚠️ The spot price is only a reference — the moment you trade, reserves change, so the execution price will differ (slippage + fee).

---

### Trading (Execution) Price

Let's derive tha actual trading price step by step:

1.  **From the constant-product rule**

    The constant product formula states that:

    <center>

    $x$ \* $y$ = $k$

    </center>

    If we pay $\Delta{x}$ of $token_0$ to get $\Delta{y}$ of $token_1$, the new reserves will be:

     <center>

    $(x + \Delta{x}) * (y - \Delta{y}) = k$

     </center>

    where:

    -   $x$ = reserve of input token
    -   $y$ = reserve of ouput token
    -   $k$ = constant product invariant
    -   $\Delta{x}$ = amount of input token
    -   $\Delta{y}$ = amount of output token

2.  **Include the trading fee**

    Uniswap v2 charges a 0.3% fee on the input amount($\Delta{x}$). This means only 99.7% of $\Delta{x}$ is effectively added to the pool:

    <center>

    $r = 1 - trading fee = 1 - 0.003 = 0.997$

    </center>

    So the real equation is:

    <center>

    $(x + r \Delta{x}) \cdot (y - \Delta{y}) = k$

    </center>

3.  **Rearrange to find trade outcomes**

    -   from _(1)_ and _(2)_:

    <center>

    $x \cdot y = (x + r \Delta{x}) \cdot (y - \Delta{y})$

    </center>

    -   **Buy formula (getAmountIn)**

        Find amount of input token ($\Delta{x}$) when given exact amount of output token ($\Delta{y}$)

            <center>

        $\Delta{x} = \dfrac{x \cdot \Delta{y}}{r (y - \Delta{y})}$

            </center>

    -   **Sell formula (getAmountOut)**

        Find amount of output token ($\Delta{y}$) when given exact amount of input token ($\Delta{x}$)

            <center>

        $\Delta{y} = \dfrac{y \cdot r \Delta{x}}{x + r \Delta{x}}$

            </center>

---

### Example - Buy 100 token0 with token1

Consider the following (assuming token amounts are denominated in ether, 1 \* $10^{18}$):

-   Initial reserve of $token_0$ = 1000
-   Initial reserve of $token_1$ = 5000
-   A trader wants to buy 100 $token_0$

How many $token_1$ is needed to pay?

Since trader knows the exact amount of output token ($\Delta{y}$ = 100), we use the buy formula to find the required input amount ($\Delta{x}$).

Using the buy formula, where x = 5000, y = 1000, $\Delta{y}$ = 100, r = 0.997:

$\Delta{x} = \dfrac{x \cdot \Delta{y}}{r (y - \Delta{y})}$ = $\dfrac{5000 \cdot 100}{0.997 (1000 - 100)} \approx 557.23$

Therefore, we need to pay approximately 557.23 token1 to buy 100 token0.

---

### Fee Impact: Why 𝑘 Grows After Each Trade

When a trade happens, the trading fee (0.3% of the input amount) is added to the pool, which increases the total reserves.

**Before(1):**

$(x + r\Delta{x})(y - \Delta{y}) = k$

**After(2):**

$k' = (x + \Delta{x})(y - \Delta{y})$

**Difference(growth):**

$\Delta{k}=k' - k$
$= (x + \Delta{x})(y - \Delta{y})$ - $(x + r\Delta{x})(y - \Delta{y})$  
$= (\Delta{x}-r\Delta{x})(y - \Delta{y})$  
$= (1 - r)\Delta{x}(y - \Delta{y})$

Since $\Delta{x}$ > 0, therefore $\Delta{k}$ > 0, and 𝑘 grows after each trade.

---

## 🛠️ Lab Practise: Making a Uniswap trade

In this lab, we will demonstrate how to perform a token swap on a Uniswap V2 AMM using hardhat from a test script.

### Create test/testSwapTokens.js

Create the file `testSwapTokens.js` in the `test` directory with an empty test suite:

```js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Swap Tokens", function () {
    let signer;
    let factory, router, token0, token1;
});
```

For the subsequent stages involving the beforeEach setup and test cases, ensure to place the code inside the describe block.

### Insert the beforeEach setup into the describe block

The beforeEach function will setup up the testing environment before each test:

-   Deploy UniswapV2Factory
-   Deploy UniswapV2Router02
-   Deploy two demo ERC20 tokens (DemoTokenA and DemoTokenB)
-   Create a liquidity pool for the two tokens and add liquidity

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
        const Token0 = await ethers.getContractFactory("DemoTokenA");
        token0 = await Token0.deploy();

        // Deploy Token1
        const Token1 = await ethers.getContractFactory("DemoTokenB");
        token1 = await Token1.deploy();

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
```

### Test: Sell exact input of ERC20 tokens for ERC20 tokens

Add the following test case inside the describe block.

<!-- prettier-ignore -->
```js
    it("Should buy exact 100 * 10^18 of token0 for token1", async function () {


    });
```

In the subsequent steps below, make sure to place the code inside this test case.

-   **Step 1: Get the Pair Contract**

    To trade between two tokens, you need to find the Uniswap V2 Pair contract that holds the liquidity pool for those tokens. You can do this by calling the `getPair(token0, token1)` function on the Uniswap V2 Factory contract and use it to create a contract instance.

    <!-- prettier-ignore -->
    ```javascript
        // Step 1: Get the pair contract
        // -----------------------------------------------------------------

        const pairAddress = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
    ```

-   **Step 2: Get Initial Pool Reserves**

    From the pair contract, you can now fetch the current reserves of both tokens in the pool using the `getReserves()` function. This will return the reserves in the order of token0 and token1 based on their addresses.

    **Important**: The order of reserves returned by `getReserves()` corresponds to the order of token addresses. That is why we need to map them correctly by comparing the address values.

    <!-- prettier-ignore -->
    ```javascript
        // Step 2: Get Initial Pool Reserves
        // -----------------------------------------------------------------
        const reserves = await pair.getReserves();
        const [reserve0, reserve1] =
            (await token0.getAddress()).toLowerCase() < (await token1.getAddress()).toLowerCase()
                ? [reserves._reserve0, reserves._reserve1]
                : [reserves._reserve1, reserves._reserve0];
    ```

    We can also find the current balance of token0 and token1 at this point, so it can be compared later after the swap.

    <!-- prettier-ignore -->
    ```javascript
        // Check initial balances for comparison later
        const initialBalanceToken0 = await token0.balanceOf(signer.address);
        const initialBalanceToken1 = await token1.balanceOf(signer.address);

    ```

-   **Step 3: Decide the swap function to use**

    There are 6 swap functions in the UniswapV2Router02 contract (Refer to the file **contracts/v2-periphery/UniswapV2Router02.sol**).

    In order to choose the right one, we need to know whether we are **selling exact input** amount tokens or **buying exact output** amount of tokens.

    -   **Exact-In (You sell a known amount)**

        Choose one of the following functions below by providing the exact amount of input tokens you want to swap (amountIn).

        Calculate the expected output amount (amountOutMin) using sell formula $\Delta{y} = \frac{yr\Delta{x}}{x + r\Delta{x}}$.

        | Name                                                                | Description                 |
        | ------------------------------------------------------------------- | --------------------------- |
        | `swapExactTokensForTokens(amountIn,amountOutMin,path,to,deadline)`  | Give ERC-20, receive ERC-20 |
        | `swapExactETHForTokens(amountOutMin,path,to,deadline)`              | Give ETH, receive ERC-20    |
        | `swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline)` | Give ERC-20, receive ETH    |

    -   **Exact-Out (You buy a known amount)**

        Choose one of the following functions below by providing the exact amount of output tokens you want to receive (amountOut).

        Calculate the required input amount (amountInMax) using buy formula $\Delta{x} = \frac{x \Delta{y}}{r (y - \Delta{y})}$.

        | Name                                                                | Description                 |
        | ------------------------------------------------------------------- | --------------------------- |
        | `swapTokensForExactTokens(amountOut,amountInMax,path,to,deadline)`  | Give ERC-20, receive ERC-20 |
        | `swapETHForExactTokens(amountOut, path, to, deadline)`              | Give ETH, receive ERC-20    |
        | `swapTokensForExactETH(amountOut, amountInMax, path, to, deadline)` | Give ERC-20, receive ETH    |

    For this test, since we are buying an exact amount of token0 with token1, we will use the `swapTokensForExactTokens` function.

-   **Step 4: Prepare Swap Parameters**

    The `swapExactTokensForTokens` swap function requires 5 arguments so we will assemble them one by one.

    **Note:** The functions are generally similar and straight forward but differ in whether you are providing **amountOutMin** or **amountInMax** and find them using the corresponding formula. You need to adjust accordingly if you choose a different function. Refer to **contracts/v2-periphery/UniswapV2Router02.sol** understand the function signature.

    **contracts/v2-periphery/UniswapV2Router02.sol**

    ```solidity
        function swapTokensForExactTokens(
            uint amountOut,
            uint amountInMax,
            address[] calldata path,
            address to,
            uint deadline
            )
    ```

    1.  `amountOut`: The exact amount of output tokens to buy (token0 in this case)
    2.  `amountInMax`: The maximum amount (to protect against **slippage** explained below) of input tokens to pay (token1 in this case)

    3.  `path`: An array of token addresses representing the swap path. Always starts with the token going in and ends with the token coming out (from token1 to token0 in this case)
    4.  `to`: The recipient address of the output tokens (your address)
    5.  `deadline`: This is to specify when the transaction should expire. In a real-world scenario, you would want to set this to a reasonable value (e.g., 10 minutes from the current time).

    #### a) Define `amountOut`

    We want to buy exactly 100 ether of token0 so we will set `amountOut` to 100 ether.

    <!-- prettier-ignore -->
    ```javascript
        // argument 1: amountOut (amount of token0 to buy)
        const amountOut = ethers.parseEther("100");

    ```

    #### b) Define `amountInMax` (with slippage tolerance)

    **What is Slippage?**

    In this course we’ve shown that 𝑘 (the pool’s product) changes on every trade—it usually grows a little because fees stay in the pool. Quotes you see in a UI are based on the current reserves at the moment of quoting. But your transaction isn’t mined instantly. If other trades land before yours, the reserves (and thus the price) move. When your tx finally executes, you can receive fewer tokens than quoted. That shortfall is **slippage**. That is the reason why when calling the swap functions, we specify `amountOutMin` or `amountInMax` as the tolerance for slippage.

    In this case, we want to find `amountInMax` (maximum amount of token1 to pay).

    To find `amountInMax`, since we know the exact output amount of token0 to buy, we will use that to find the expected input amount of token1 to pay:

    $\Delta{x} = \frac{x \Delta{y}}{r (y - \Delta{y})}$

    <!-- prettier-ignore -->
    ```javascript
        // argument 2: amountInMax (maximum amount of token1 to pay)

        // Calculate expected amount in using buy formula with 0.3% fee

        const reserveIn = reserve1; // token1 is input token
        const reserveOut = reserve0; // token0 is output token
        const expectedAmountIn =
            (reserveIn * amountOut * 1000n) /
                ((reserveOut - amountOut) * 997n) +
            1n;

    ```

    For testing purposes, we will confirm that our offchain calculation is correct by comparing it with the onchain contract function `getAmountOut()` from the UniswapV2Router02 contract.

    <!-- prettier-ignore -->
    ```javascript
        // Check offchain calculation against onchain function.
        const contractAmountIn = await router.getAmountIn(
            amountOut,
            reserveIn,
            reserveOut
        );
        expect(contractAmountIn).to.equal(expectedAmountIn);
    ```

    Now, we can set the maximum amount out with an upper bound of 5% slippage tolerance.

    <!-- prettier-ignore -->
    ```javascript
        // Set maximum amount in with 5% slippage tolerance

        const amountInMax = (expectedAmountIn * 105n) / 100n;
    ```

    #### c) Define `path`

    The `path` is an array of token addresses representing the swap path. It always starts with the token going in and ends with the token coming out. In this case, we are starting from token1 and ending with token0.

    <!-- prettier-ignore -->
    ```javascript
        // argument 3: path (starts from input token1 to output token0)
        const path = [await token1.getAddress(), await token0.getAddress()];
    ```

    #### d) Define `to`

    The `to` parameter is the recipient address of the output tokens. In this case, we will set it to our own address.

    <!-- prettier-ignore -->
    ```javascript
        // argument 4: to (recipient address)
        const to = signer.address;
    ```

    #### e) Define `deadline`

    The `deadline` parameter is to specify when the transaction should expire. In a real-world scenario, you would want to set this to a reasonable value (e.g., 10 minutes from the current time).

    <!-- prettier-ignore -->
    ```javascript
        // argument 5: deadline (set later)
        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600;
    ```

-   **Step 4: Approve Uniswap Router to Spend Input Tokens**

    Before performing the swap, we need to approve the router contract to spend our token0.

    <!-- prettier-ignore -->
    ```javascript
        // Step 4: Approve Uniswap Router to Spend Input Tokens
        // -----------------------------------------------------------------
        await token1.approve(await router.getAddress(), amountInMax);
    ```

-   **Step 5: Execute the Swap**

    Now that we have all the parameters ready, we can call the `swapTokensForExactTokens` function on the router contract to perform the swap.

    <!-- prettier-ignore -->
    ```javascript
        // Step 5: Execute the Swap
        // -----------------------------------------------------------------
        await router.swapTokensForExactTokens(
            amountOut,
            amountInMax,
            path,
            to,
            deadline
        );
    ```

    We will also verify the final balances of token0 and token1 to ensure the swap was successful.

    <!-- prettier-ignore -->
    ```javascript
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
    ```

### Run the tests

Run the test using Hardhat.

```bash
hh test test/testSwapTokens.js

#   Test Swap Tokens
# Amount of token0 increased: 100.0
# Amount of token1 decreased: 557.227237267357628441
#     ✔ Should buy exact 100 * 10^18 of ERC20 tokens for ERC20 tokens
```

The result shows that we successfully bought exactly 100 token0 by paying approximately 557.23 token1 which matches the result from [Example - Buy 100 token0 with token1](#example---buy-100-token0-with-token1).

### Task completed ✅

In this lab, you have learned how to buy an exact input of ERC20 tokens for ERC20 tokens using Uniswap V2 with hardhat.

## Quiz: Sell token1 for exact 100 ether of token0

Implement a new test case inside the describe block to sell an exact amount of token0 with token1.
