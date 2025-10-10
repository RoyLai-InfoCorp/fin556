# DEFI(Uniswap V2) - Part 1

Decentralized Exchange (DEX) refers to token exchanges that are fully decentralized and on-chain as opposed to centralized exchanges like Binance.

In this session, you will learn about creating and funding liquidity pools, how a constant function is used to price trades, and executing trades using Uniswap contracts using your Development Network. The version of Uniswap contract used for this lab is based on version 2 (current version is 3).

**Why Uniswap V2 and not V3?** The concept of liquidity pools and constant function market makers are best illustrated using Uniswap V2. Uniswap V3 introduces more advanced concepts like concentrated liquidity and multiple fee tiers, which can complicate the understanding of basic AMM principles.

---

## 1. What is Uniswap?

(https://docs.uniswap.org/whitepaper.pdf)

### Automated Market Maker (AMM)

On order-book exchanges, your trade needs a matching order at your price. In thin markets, that means waiting, partial fills, or big price jumps when your order finally executes. To solve this in crypto trading, a type of contract called an **Automated Market Maker (AMM)** is used. AMMs let you trade against a **pool of liquidity** instead of an order book. The price is set by a mathematical formula based on the pool’s token balances. This means you can always trade immediately at the current price, with no waiting or partial fills. (Caveat: Your final execution still depends on trade size and slippage settings.)

Uniswap popularized AMMs in 2018, and it has since become the dominant way to swap tokens on Ethereum and other blockchains. Uniswap is a **Constant-Function Market Maker**: instead of matching you with a counterparty, your trade is priced by a fixed rule applied to the pool’s balances.

---

### Constant-Product Function

(https://docs.uniswap.org/contracts/V2/concepts/protocol-overview/how-uniswap-works)

In Uniswap v2 that rule is the **constant-product function**:

<center>
𝑥 ⋅ 𝑦 = 𝑘
</center>

where 𝑥 and 𝑦 are the reserves of the two tokens, and 𝑘 is a constant (also known as constant product invariant). Since 𝑥 ⋅ 𝑦 never changes, pushing price one way automatically pushes back the other.

For illustration, if you **buy token** 𝑥 from the pool, you take 𝑥 out(its reserve falls) and add 𝑦(its reserve rises). With fewer 𝑥 left per 𝑦, the price of 𝑥 goes up. If you keep buying, each next unit costs a bit more - small trades move price a little; big trades move it a lot. This progressive shift is what users experience as **slippage**.

---

### Liquidity Pool

A liquidity pool is a smart contract that holds reserves of two tokens (𝑥,𝑦). Users (also known as **Liquidity Providers**) can add liquidity by depositing equal values of both tokens into the pool, receiving liquidity tokens (**LP tokens**) in return. These tokens represent their share of the pool and can be redeemed later for the underlying assets plus a portion of the trading fees.

### Calculating LP Tokens

In Uniswap v2, the balance of LP tokens represents shares of liquidity in the pool. The amount of shares initially minted is equal to the geometric mean of the amounts deposited:

<center>

$S_{minted} = \sqrt{x_{deposited} \cdot y_{deposited}}$

</center>

where $x_{deposited}$ and $y_{deposited}$ are the amounts of $token_0$ and $token_1$ deposited, respectively.

Since Uniswap v2 burns the initial 1000 units of shares, the effective balance becomes

<center>

𝐸𝑓𝑓𝑒𝑐𝑡𝑖𝑣𝑒 $S_{minted} = \sqrt{x_{deposited} \cdot y_{deposited}} - 1000$

</center>

**Example:**

LP creates a pool (assuming token amounts are denominated in ether, 1 \* $10^{18}$):

-   Initial reserve of token0 = 1000
-   Initial reserve of token1 = 5000

Therefore, the LP gets $\sqrt{(1000 \cdot 5000)}$ ∗ $10^{18} −1000$ ≈ 2236.068 ∗ $10^{18}$ LP Tokens

---

## 2. Uniswap V2 Contracts

There are 3 Uniswap V2 Contracts that you should be familiar with:

-   **UniswapV2Pair** — A contract deployed for each liquidity pool (e.g., ETH/DAI, USDC/USDT) by the **UniswapV2Factory**.

    -   Stores the two token reserves.
    -   Acts as an **ERC-20 token**: the **LP token** that represents ownership shares in the pool.
    -   Mints **LP tokens** when liquidity is added and burns them when liquidity is removed.
    -   Executes swaps between the two tokens using the constant-product formula (x \* y = k).

-   **UniswapV2Factory** — The contract that manages and creates pools from **UniswapV2Pair**.

    -   Ensures there’s only one pool for each token pair.
    -   Pool addresses are predictable (using CREATE2).
    -   Can turn protocol fees on or off.
    -   Important functions:
        -   createPair(): Creates a new pool for a token pair.
        -   getPair(): Returns the address of an existing pool.

-   **UniswapV2Router02** — The main entry point for trades and liquidity management.
    -   Makes it easy and safe to interact with pools.
    -   Handles token transfers, checks for slippage, enforces deadlines, and supports multi-hop swaps.
    -   Important functions:
        -   **addLiquidity()**: Add liquidity and receive LP tokens.
        -   **removeLiquidity()**: Remove liquidity and get tokens back.
        -   **swapExactTokensForTokens()**: Swap a fixed amount of input tokens for as many output tokens as possible.

---

## 🛠️ Lab Practise: Create Liquidity Pool

In this lab, we will demonstrate how to create a Uniswap V2 liquidity pool and add liquidity to it using Hardhat.

### Create test/testCreatePool.js

Create the file `testCreatePool.js` in the `test` directory with an empty test suite:

```js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Create Pool", function () {
    let signer;
    let factory, router, token0, token1;

}
```

For the subsequent stages involving the beforeEach setup and test cases, ensure to place the code inside the describe block.

### Insert the beforeEach setup into the describe block

The beforeEach function will setup up the testing environment before each test:

-   Deploy UniswapV2Factory
-   Deploy UniswapV2Router02
-   Deploy two demo ERC-20 tokens (DemoTokenA and DemoTokenB)

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
    });

```

### Create Test Case - Create and fund a liquidity pool

Add the following test case inside the describe block.

<!-- prettier-ignore -->
```js
    it("Should create and fund a liquidity pool", async function () {

    });
```

In the subsequent steps below, make sure to place the code inside this test case.

-   **Step 1: Create a Pool**

    Use the factory contract to create a new liquidity pool with the addresses of token0 and token1.

    <!-- prettier-ignore -->
    ```js
        // Step 1: Create a Pool
        // -----------------------------------------------------------------

        tx = await factory.createPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        receipt = await tx.wait();
    ```

-   **Step 2: Get the Pool Address**

    There are 3 ways to get the pool address.

    -   **method 1:** From the transaction receipt event logs.

        Use this method when you want to get the pair address immediately after creating it

        <!-- prettier-ignore -->
        ```js
            // Step 2: Get Pool Address
            // ---------------------------------------------------------


            // Method 1 - Events: Get the pair address from PairCreated event after creating the pair.
            
            const logs = await factory.queryFilter(
                factory.filters.PairCreated(null)
            );
            pairAddress = logs[0].args.pair;
            console.log("Pair address:", pairAddress);
        ```

        Check that the pool address is not the zero address.

        <!-- prettier-ignore -->
        ```js
            expect(pairAddress1).to.not.equal(ethers.ZeroAddress);
        ```

        And is a valid address.

        <!-- prettier-ignore -->
        ```js
            expect(pairAddress1).to.be.properAddress;
        ```

    -   **method 2:** Using the `getPair()` function from the factory contract. Use this method when you want to find an existing pair from the reserve token addresses.

        This method requires an on-chain call to the factory contract which is less efficient than method 3 below.

        <!-- prettier-ignore -->
        ```js
            // Method 2 - On-Chain: Get the pair address by calling the Factory contract on-chain

            let pairAddress1 = await factory.getPair(
                await token0.getAddress(),
                await token1.getAddress()
            );
            expect(pairAddress1).to.equal(pairAddress);

        ```

    -   **method 3:** Using an off-chain deterministic calculation with the CREATE2 opcode. Use this method when you want to find an existing pair from the reserve token addresses.

        This is the preferred method as it does not require an on-chain call. However, this method requires knowing the init code hash of the UniswapV2Pair contract in your deployment environment. The init code hash may vary between different environments (e.g., local, testnet, mainnet).

        <!-- prettier-ignore -->
        ```js
            // Method 3 - Off-Chain: Get the pair address using CREATE2 calculation (preferred)
            address0 = (await token0.getAddress()).toLowerCase();
            address1 = (await token1.getAddress()).toLowerCase();
            if (address0 > address1) {
                [address0, address1] = [address1, address0];
            }
            const pairAddress2 = ethers.getCreate2Address(
                factory.target,
                ethers.keccak256(
                    ethers.solidityPacked(
                        ["address", "address"],
                        [address0, address1]
                    )
                ),
                "0x215a032792ab9f4a5eb14f1f4c1daed5017b1eee4de72ddb42e06c967b16c5d4" // init code hash
            );
            expect(pairAddress2).to.equal(pairAddress);
        ```

-   **Step 3: Approve Token Transfers**

    Before adding liquidity, approve the router contract to spend token0 and token1 on behalf of the signer.

    In this case, we will approve 2 ethers of token0 and 3 ethers of token1.

    <!-- prettier-ignore -->
    ```js
        // Step 3: Approve Token Transfers
        // -----------------------------------------------------------------

        const amount0 = ethers.parseEther("1000");
        const amount1 = ethers.parseEther("5000");
        await token0.approve(await router.getAddress(), amount0);
        await token1.approve(await router.getAddress(), amount1);
    ```

-   **Step 4: Add Liquidity**

    Now we are ready to add liquidity to the pool using the router contract's `addLiquidity()` (see **contracts/v2-periphery/UniswapV2Router02.sol**).

    **contracts/v2-periphery/UniswapV2Router02.sol**

    ```solidity
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    )
    ```

    The `addLiquidity()` function requires 8 parameters:

    -   tokenA: Address of token0
    -   tokenB: Address of token1
    -   amountADesired: Amount of token0 to add
    -   amountBDesired: Amount of token1 to add
    -   amountAMin: Minimum amount of token0 to add (slippage protection)
    -   amountBMin: Minimum amount of token1 to add (slippage protection)
    -   to: Recipient of the liquidity tokens (LP tokens)
    -   deadline: Unix timestamp after which the transaction will revert

    The reason why we need to specify a range (min and desired) only matters when we are adding liquidity to an existing pool. In this case, since we are creating a new pool, the min and desired amounts will be the same. We will explain the concept of **slippage** in the next lab in further details.

    The other parameter to observe is the `deadline`. This is to specify when the transaction should expire. In a real-world scenario, you would want to set this to a reasonable value (e.g., 10 minutes from the current time).

    <!-- prettier-ignore -->
    ```js
        // Step 4: Add Liquidity
        // -----------------------------------------------------------------

        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600; // 10 minutes from the current block
    ```

    Now we can call the `addLiquidity()` function to add liquidity to the pool.

    <!-- prettier-ignore -->
    ```js
        tx = await router.addLiquidity(
            await token0.getAddress(),  
            await token1.getAddress(),
            amount0, // amount of token0 to add
            amount1, // amount of token1 to add
            amount0, // min amount of token0 to add (slippage protection)
            amount1, // min amount of token1 to add (slippage protection)
            await signer.getAddress(), // recipient of the liquidity tokens
            deadline // 10 minutes from current block
        );
    ```

-   **Step 5: Check Pool Reserves**

    After adding liquidity, we can check the pool's reserves to ensure that the tokens have been added correctly.

    First, we need to get the pair contract instance using the pool address.

    <!-- prettier-ignore -->
    ```js
        // Step 5: Check Pool Reserves
        // -----------------------------------------------------------------

        // Get the pair contract instance
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
    ```

    From the pair contract, you can now fetch the current reserves of both tokens in the pool using the `getReserves()` function. This will return the reserves in the order of token0 and token1 based on their addresses.

    <!-- prettier-ignore -->
    ```javascript
        // Get current reserves
        const reserves = await pair.getReserves(); 
    ```

    **Important**: The order of reserves returned by `getReserves()` corresponds to the order of token addresses. That is why we need to map them correctly by comparing the address values.

    <!-- prettier-ignore -->
    ```javascript
        // IMPORTANT: Make sure to map reserves correctly based on token addresses
        const [reserve0, reserve1] =
            (await token0.getAddress()) < (await token1.getAddress())
                ? [reserves[0], reserves[1]]
                : [reserves[1], reserves[0]];
    ```

    Display the reserves.

    <!-- prettier-ignore -->
    ```js
        console.log("Reserve0:", ethers.formatEther(reserve0));
        console.log("Reserve1:", ethers.formatEther(reserve1));
    ```

    Finally, verify that the reserves match the amounts we added.

    <!-- prettier-ignore -->
    ```js
        expect(reserve0).to.equal(amount0);
        expect(reserve1).to.equal(amount1);
    ```

-   **Step 6: Check Liquidity Token Balance**

    Remember that when you add liquidity to the pool, you receive liquidity tokens (LP tokens) in return. These tokens represent your share of the pool and can be redeemed later for the underlying assets plus a portion of the trading fees.

    To get the liquidity token balance, you can use the `balanceOf()` function from the pair contract, passing in the signer's address.

    <!-- prettier-ignore -->
    ```js
        // Check liquidity token balance of the signer
        const lpBalance = await pair.balanceOf(await signer.getAddress());
        console.log("LP Token Balance:", ethers.formatEther(lpBalance));
    ```

    The amount of LP tokens minted is based on the geometric mean of the token amounts added. Refer to [Calculating LP Tokens](#calculating-lp-tokens).

    <center>

    $L=\sqrt{x\cdot y}-\text{MINIMUM\_LIQUIDITY}$

    </center>

    where 𝑥 and 𝑦 are the amounts of token0 and token1 added to the pool, respectively, and MINIMUM_LIQUIDITY is a small constant (1000) that is permanently locked in the pool to prevent division-by-zero errors.

    You can verify that the LP token balance matches the expected amount using the formula above.

    NOTE: There is no built-in square root function for BigInt in JavaScript, so we need to implement our own.

    <!-- prettier-ignore -->
    ```js
        // Check LP Balance against formula: sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY (1000)

        // We need to implement sqrt for BigInt since JS Math.sqrt only works with Number type
        function sqrtBigInt(value) {
            if (value < 0n) {
                throw new Error(
                    "Square root of negative numbers is not supported"
                );
            }

            if (value < 2n) {
                return value;
            }

            // Newton's method for integer square root
            let x = value;
            let y = (x + 1n) / 2n;

            while (y < x) {
                x = y;
                y = (x + value / x) / 2n;
            }

            return x;
        }

        const computedLpBalance = sqrtBigInt(amount0 * amount1) - 1000n; // minus MINIMUM_LIQUIDITY (1000)

        console.log(
            "Computed LP Token Balance:",
            ethers.formatEther(computedLpBalance)
        );        
        expect(lpBalance).to.equal(computedLpBalance);
    ```

### Run the test

Run the test using Hardhat.

```bash
hh test test/testCreatePool.js

    # Sample Output:
    # Test Create Pool
    # Token0 address: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
    # Token1 address: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
    # Pair address: 0xc8dA3cE3637828438347eA6bbC9eDEff411c776e
    # Reserve0: 1000.0
    # Reserve1: 5000.0
    # LP Token Balance: 2236.067977499789695409
    # Computed LP Token Balance: 2236.067977499789695409
    #   ✔ Should create a new pair and add liquidity successfully (51ms)

```

The resulting LP token balance should match the computed value from [LP Token Example](#calculating-lp-tokens) above.

### Task completed ✅

In this lab, you have learned how to create and fund a Uniswap V2 liquidity pool using Hardhat. You have also learned how to check the amount of liquidity token (LP token) minted to your address after adding liquidity.
