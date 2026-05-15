# DEFI（Uniswap V2）- 第二部分

## Uniswap V2 定价如何运作

### 现货价格

在 Uniswap v2 池中，现货价格来自储备比率。

给定流动性池中的代币 $token_0$ 和 $token_1$，设：

-   $x$ 为 $token_0$ 的储备
-   $y$ 为 $token_1$ 的储备

那么：

-   $token_0$ 的价格（$P_0$）以 $token_1$ 表示：

    $P_0$ = $\dfrac{y}{x}$

-   $token_1$ 的价格（$P_1$）以 $token_0$ 表示：

    $P_1$ = $\dfrac{x}{y}$

⚠️ 现货价格只是一个参考——一旦您交易，储备就会改变，因此执行价格会有所不同（滑点 + 费用）。

---

### 交易（执行）价格

让我们逐步推导实际交易价格：

1.  **来自常数乘积规则**

    常数乘积公式指出：

    <center>

    $x$ \* $y$ = $k$

    </center>

    如果我们支付 $\Delta{x}$ 的 $token_0$ 来获得 $\Delta{y}$ 的 $token_1$，新的储备将是：

     <center>

    $(x + \Delta{x}) * (y - \Delta{y}) = k$

     </center>

    其中：

    -   $x$ = 输入代币的储备
    -   $y$ = 输出代币的储备
    -   $k$ = 常数乘积不变量
    -   $\Delta{x}$ = 输入代币的数量
    -   $\Delta{y}$ = 输出代币的数量

2.  **包含交易费用**

    Uniswap v2 对输入金额（$\Delta{x}$）收取 0.3% 的费用。这意味着只有 99.7% 的 $\Delta{x}$ 有效地添加到池中：

    <center>

    $r = 1 - 交易费用 = 1 - 0.003 = 0.997$

    </center>

    所以真正的方程是：

    <center>

    $(x + r \Delta{x}) \cdot (y - \Delta{y}) = k$

    </center>

3.  **重新排列以找出交易结果**

    -   从 _(1)_ 和 _(2)_：

    <center>

    $x \cdot y = (x + r \Delta{x}) \cdot (y - \Delta{y})$

    </center>

    -   **买入公式（getAmountIn）**

        当给定精确的输出代币数量（$\Delta{y}$）时，找出输入代币的数量（$\Delta{x}$）

            <center>

        $\Delta{x} = \dfrac{x \cdot \Delta{y}}{r (y - \Delta{y})}$

            </center>

    -   **卖出公式（getAmountOut）**

        当给定精确的输入代币数量（$\Delta{x}$）时，找出输出代币的数量（$\Delta{y}$）

            <center>

        $\Delta{y} = \dfrac{y \cdot r \Delta{x}}{x + r \Delta{x}}$

            </center>

---

### 示例 - 用 token1 买入 100 个 token0

考虑以下情况（假设代币金额以以太坊计价，1 * $10^{18}$）：

-   $token_0$ 的初始储备 = 1000
-   $token_1$ 的初始储备 = 5000
-   交易者想买入 100 $token_0$

需要支付多少 $token_1$？

由于交易者知道精确的输出代币数量（$\Delta{y}$ = 100），我们使用买入公式找出所需的输入金额（$\Delta{x}$）。

使用买入公式，其中 x = 5000，y = 1000，$\Delta{y}$ = 100，r = 0.997：

$\Delta{x} = \dfrac{x \cdot \Delta{y}}{r (y - \Delta{y})}$ = $\dfrac{5000 \cdot 100}{0.997 (1000 - 100)} \approx 557.23$

因此，我们需要支付约 557.23 个 token1 来购买 100 个 token0。

---

### 费用影响：为什么每次交易后 k 都会增长

当交易发生时，交易费用（输入金额的 0.3%）被添加到池中，这增加了总储备。

**之前(1)：**

$(x + r\Delta{x})(y - \Delta{y}) = k$

**之后(2)：**

$k' = (x + \Delta{x})(y - \Delta{y})$

**差异（增长）：**

$\Delta{k}=k' - k$
$= (x + \Delta{x})(y - \Delta{y})$ - $(x + r\Delta{x})(y - \Delta{y})$  
$= (\Delta{x}-r\Delta{x})(y - \Delta{y})$  
$= (1 - r)\Delta{x}(y - \Delta{y})$

由于 $\Delta{x}$ > 0，因此 $\Delta{k}$ > 0，并且 k 在每次交易后都会增长。

---

## 🛠️ 实验实践：执行 Uniswap 交易

在本实验中，我们将演示如何使用 hardhat 从测试脚本在 Uniswap V2 AMM 上执行代币交换。

### 创建 test/testSwapTokens.js

在 `test` 目录中创建包含空测试套件的文件 `testSwapTokens.js`：

```js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Swap Tokens", function () {
    let signer;
    let factory, router, token0, token1;
});
```

对于涉及 beforeEach 设置和测试用例的后续阶段，确保将代码放在 describe 块内。

### 在 describe 块中插入 beforeEach 设置

beforeEach 函数将在每个测试之前设置测试环境：

-   部署 UniswapV2Factory
-   部署 UniswapV2Router02
-   部署两个演示 ERC20 代币（DemoTokenA 和 DemoTokenB）
-   为两种代币创建流动性池并添加流动性

<!-- prettier-ignore -->
```js
    beforeEach(async function () {
        [signer] = await ethers.getSigners();

        // 部署 UniswapV2Factory
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await Factory.deploy(signer.address);

        // 部署 UniswapV2Router02
        const Router = await ethers.getContractFactory("UniswapV2Router02");
        router = await Router.deploy(
            factory.target,
            "0x0000000000000000000000000000000000000000" // WETH 地址（本测试中未使用）
        );

        // 部署 Token0
        const Token0 = await ethers.getContractFactory("DemoTokenA");
        token0 = await Token0.deploy();

        // 部署 Token1
        const Token1 = await ethers.getContractFactory("DemoTokenB");
        token1 = await Token1.deploy();

        // 部署配对
        await factory.createPair(
            await token0.getAddress(),
            await token1.getAddress()
        );

        // 批准代币给路由器
        const amount0 = ethers.parseEther("1000");
        const amount1 = ethers.parseEther("5000");
        await token0.approve(await router.getAddress(), amount0);
        await token1.approve(await router.getAddress(), amount1);

        // 添加流动性
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

### 测试：用精确输入的 ERC20 代币交换 ERC20 代币

在 describe 块中添加以下测试用例。

<!-- prettier-ignore -->
```js
    it("Should buy exact 100 * 10^18 of token0 for token1", async function () {


    });
```

在下面的后续步骤中，确保将代码放在此测试用例内。

-   **步骤 1：获取配对合约**

    要在两种代币之间交易，您需要找到持有这些代币流动性池的 Uniswap V2 配对合约。您可以通过在 Uniswap V2 Factory 合约上调用 `getPair(token0, token1)` 函数来做到这一点，并使用它创建合约实例。

    <!-- prettier-ignore -->
    ```javascript
        // 步骤 1：获取配对合约
        // -----------------------------------------------------------------

        const pairAddress = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
    ```

-   **步骤 2：获取初始池储备**

    从配对合约，您现在可以使用 `getReserves()` 函数获取池中两种代币的当前储备。这将根据它们的地址按 token0 和 token1 的顺序返回储备。

    **重要**：`getReserves()` 返回的储备顺序对应于代币地址的顺序。这就是为什么我们需要通过比较地址值来正确映射它们。

    <!-- prettier-ignore -->
    ```javascript
        // 步骤 2：获取初始池储备
        // -----------------------------------------------------------------
        const reserves = await pair.getReserves();
        const [reserve0, reserve1] =
            (await token0.getAddress()).toLowerCase() < (await token1.getAddress()).toLowerCase()
                ? [reserves._reserve0, reserves._reserve1]
                : [reserves._reserve1, reserves._reserve0];
    ```

    我们还可以在此时找出 token0 和 token1 的当前余额，以便以后交换后进行比较。

    <!-- prettier-ignore -->
    ```javascript
        // 检查初始余额以供以后比较
        const initialBalanceToken0 = await token0.balanceOf(signer.address);
        const initialBalanceToken1 = await token1.balanceOf(signer.address);

    ```

-   **步骤 3：决定使用哪个交换函数**

    UniswapV2Router02 合约有 6 个交换函数（参见文件 **contracts/v2-periphery/UniswapV2Router02.sol**）。

    为了选择正确的函数，我们需要知道我们是**卖出精确输入**数量的代币还是**买入精确输出**数量的代币。

    -   **精确输入（您知道要卖出的数量）**

        通过提供您想要交换的精确输入代币数量（amountIn），选择下面其中一个函数。

        使用卖出公式 $\Delta{y} = \frac{yr\Delta{x}}{x + r\Delta{x}}$ 计算预期的输出数量（amountOutMin）。

        | 名称                                                              | 描述                 |
        | ------------------------------------------------------------------- | --------------------------- |
        | `swapExactTokensForTokens(amountIn,amountOutMin,path,to,deadline)`  | 给出 ERC-20，接收 ERC-20 |
        | `swapExactETHForTokens(amountOutMin,path,to,deadline)`              | 给出 ETH，接收 ERC-20    |
        | `swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline)` | 给出 ERC-20，接收 ETH    |

    -   **精确输出（您知道要接收的数量）**

        通过提供您想要接收的精确输出代币数量（amountOut），选择下面其中一个函数。

        使用买入公式 $\Delta{x} = \frac{x \Delta{y}}{r (y - \Delta{y})}$ 计算所需的输入金额（amountInMax）。

        | 名称                                                                | 描述                 |
        | ------------------------------------------------------------------- | --------------------------- |
        | `swapTokensForExactTokens(amountOut,amountInMax,path,to,deadline)`  | 给出 ERC-20，接收 ERC-20 |
        | `swapETHForExactTokens(amountOut, path, to, deadline)`              | 给出 ETH，接收 ERC-20    |
        | `swapTokensForExactETH(amountOut, amountInMax, path, to, deadline)` | 给出 ERC-20，接收 ETH    |

    对于此测试，由于我们用 token1 买入精确数量的 token0，我们将使用 `swapTokensForExactTokens` 函数。

-   **步骤 4：准备交换参数**

    `swapExactTokensForTokens` 交换函数需要 5 个参数，因此我们将逐一组装它们。

    **注意：** 函数通常相似且直接，但不同之处在于您是提供 **amountOutMin** 还是 **amountInMax**，并使用相应的公式找出它们。如果您选择不同的函数，需要相应调整。参见 **contracts/v2-periphery/UniswapV2Router02.sol** 了解函数签名。

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

    1.  `amountOut`：要买入的精确输出代币数量（在本例中为 token0）
    2.  `amountInMax`：最大输入代币数量（以防止下面解释的**滑点**）（在本例中为 token1）

    3.  `path`：表示交换路径的代币地址数组。始终以输入的代币开始，以输出的代币结束（在本例中从 token1 到 token0）
    4.  `to`：输出代币的接收者地址（您的地址）
    5.  `deadline`：这指定交易何时过期。在现实世界中，您会将其设置为合理的值（例如，从当前时间起 10 分钟）。

    #### a) 定义 `amountOut`

    我们要买入正好 100 ether 的 token0，因此我们将 `amountOut` 设置为 100 ether。

    <!-- prettier-ignore -->
    ```javascript
        // 参数 1：amountOut（要买入的 token0 数量）
        const amountOut = ethers.parseEther("100");

    ```

    #### b) 定义 `amountInMax`（带滑点容忍度）

    **什么是滑点？**

    在本课程中，我们已经表明 k（池的乘积）在每次交易时都会变化——由于费用留在池中，它通常会增长一点。您 UI 中看到的报价基于报价时刻的当前储备。但您的交易不会立即被挖掘。如果其他交易在您之前成交，储备（从而价格）会变动。当您的交易最终执行时，您收到的代币可能比报价少。这个差额就是**滑点**。这就是为什么在调用交换函数时，我们指定 `amountOutMin` 或 `amountInMax` 作为滑点的容忍度。

    在这种情况下，我们想找出 `amountInMax`（要支付的最大 token1 数量）。

    要找出 `amountInMax`，由于我们知道要买入的 token0 的精确输出数量，我们将用它来找出要支付的 token1 的预期输入数量：

    $\Delta{x} = \frac{x \Delta{y}}{r (y - \Delta{y})}$

    <!-- prettier-ignore -->
    ```javascript
        // 参数 2：amountInMax（要支付的最大 token1 数量）

        // 使用 0.3% 费用计算预期输入金额

        const reserveIn = reserve1; // token1 是输入代币
        const reserveOut = reserve0; // token0 是输出代币
        const expectedAmountIn =
            (reserveIn * amountOut * 1000n) /
                ((reserveOut - amountOut) * 997n) +
            1n;

    ```

    出于测试目的，我们将通过将链下计算与 UniswapV2Router02 合约的链上函数 `getAmountOut()` 进行比较来验证我们的链下计算是否正确。

    <!-- prettier-ignore -->
    ```javascript
        // 检查链下计算与链上函数是否一致。
        const contractAmountIn = await router.getAmountIn(
            amountOut,
            reserveIn,
            reserveOut
        );
        expect(contractAmountIn).to.equal(expectedAmountIn);
    ```

    现在，我们可以设置最大数量，上限为 5% 的滑点容忍度。

    <!-- prettier-ignore -->
    ```javascript
        // 设置最大数量，5% 滑点容忍度

        const amountInMax = (expectedAmountIn * 105n) / 100n;
    ```

    #### c) 定义 `path`

    `path` 是表示交换路径的代币地址数组。它始终以输入的代币开始，以输出的代币结束。在这种情况下，我们从 token1 开始，到 token0 结束。

    <!-- prettier-ignore -->
    ```javascript
        // 参数 3：path（从输入代币 token1 到输出代币 token0）
        const path = [await token1.getAddress(), await token0.getAddress()];
    ```

    #### d) 定义 `to`

    `to` 参数是输出代币的接收者地址。在这种情况下，我们将设置为我们自己的地址。

    <!-- prettier-ignore -->
    ```javascript
        // 参数 4：to（接收者地址）
        const to = signer.address;
    ```

    #### e) 定义 `deadline`

    `deadline` 参数是指定交易何时过期的参数。在现实世界中，您会将其设置为合理的值（例如，从当前时间起 10 分钟）。

    <!-- prettier-ignore -->
    ```javascript
        // 参数 5：deadline（稍后设置）
        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600;
    ```

-   **步骤 4：批准 Uniswap 路由器花费输入代币**

    在执行交换之前，我们需要批准路由器合约花费我们的 token0。

    <!-- prettier-ignore -->
    ```javascript
        // 步骤 4：批准 Uniswap 路由器花费输入代币
        // -----------------------------------------------------------------
        await token1.approve(await router.getAddress(), amountInMax);
    ```

-   **步骤 5：执行交换**

    现在我们准备好了所有参数，我们可以调用路由器合约上的 `swapTokensForExactTokens` 函数来执行交换。

    <!-- prettier-ignore -->
    ```javascript
        // 步骤 5：执行交换
        // -----------------------------------------------------------------
        await router.swapTokensForExactTokens(
            amountOut,
            amountInMax,
            path,
            to,
            deadline
        );
    ```

    我们还将验证 token0 和 token1 的最终余额以确保交换成功。

    <!-- prettier-ignore -->
    ```javascript
        // 检查最终余额
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

### 运行测试

使用 Hardhat 运行测试。

```bash
hh test test/testSwapTokens.js

#   Test Swap Tokens
# Amount of token0 increased: 100.0
# Amount of token1 decreased: 557.227237267357628441
#     ✔ Should buy exact 100 * 10^18 of ERC20 tokens for ERC20 tokens
```

结果表明，我们成功通过支付约 557.23 个 token1 购买了正好 100 个 token0，这与 [示例 - 用 token1 买入 100 个 token0](#example---buy-100-token0-with-token1) 的结果匹配。

### 任务完成 ✅

在本实验中，您学习了如何使用 Uniswap V2 和 hardhat 用 ERC20 代币买入精确输入数量的 ERC20 代币。

## 测验：用 token1 卖出精确 100 ether 的 token0

在 describe 块内实现一个新的测试用例，用 token1 卖出精确数量的 token0。
