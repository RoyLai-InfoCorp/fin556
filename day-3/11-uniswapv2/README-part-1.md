# DEFI（Uniswap V2）- 第一部分

去中心化交易所（DEX）是指与币安等中心化交易所完全去中心化和链上的代币交易所。

在本节课中，您将学习如何创建和为流动性池提供资金、常数函数如何用于定价交易，以及如何使用您的开发网络执行使用 Uniswap 合约的交易。本实验使用的 Uniswap 合约版本基于版本 2（当前版本是 3）。

**为什么选择 Uniswap V2 而不是 V3？** 流动性池和常数函数做市商的概念在 Uniswap V2 中得到了最好的说明。Uniswap V3 引入了更高级的概念，如集中流动性和多层级费用，这可能会使理解基本 AMM 原则变得复杂。

---

## 1. 什么是 Uniswap？

（https://docs.uniswap.org/whitepaper.pdf）

### 自动化做市商（AMM）

在订单簿交易所，您的交易需要以您的价格匹配订单。在流动性不足的市场中，这意味着等待、部分成交或当您的订单最终执行时价格大幅波动。为了在加密交易中解决这个问题，使用了一种称为**自动化做市商（AMM）**的合约类型。AMM 允许您与**流动性池**而不是订单簿进行交易。价格根据池的代币余额通过数学公式设定。这意味着您始终可以立即以当前价格进行交易，无需等待或部分成交。（注意：您的最终执行仍取决于交易规模和滑点设置。）

Uniswap 在 2018 年推广了 AMM，此后已成为在以太坊和其他区块链上交换代币的主导方式。Uniswap 是一个**常数函数做市商**：不是将您与交易对手匹配，您的交易通过应用于池余额的固定规则定价。

---

### 常数乘积函数

（https://docs.uniswap.org/contracts/V2/concepts/protocol-overview/how-uniswap-works）

在 Uniswap v2 中，该规则是**常数乘积函数**：

<center>
𝑥 ⋅ 𝑦 = 𝑘
</center>

其中 𝑥 和 𝑦 是两种代币的储备，𝑘 是一个常数（也称为常数乘积不变量）。由于 𝑥 ⋅ 𝑦 永远不会改变，向一个方向推动价格会自动向另一个方向推动。

为了说明，如果您从池中**购买**代币 𝑥，您取出 𝑥（其储备减少）并添加 𝑦（其储备增加）。由于每单位 𝑦 剩下的 𝑥 减少，𝑥 的价格上涨。如果您继续购买，每个下一个单位的价格会更高——小额交易使价格变动一点；大额交易使价格变动很大。这种渐进式转变就是用户经历的**滑点**。

---

### 流动性池

流动性池是持有两种代币（𝑥,𝑦）储备的智能合约。用户（也称为**流动性提供者**）可以通过向池中存入等值的两种代币来添加流动性，从而获得流动性代币（**LP 代币**）作为回报。这些代币代表他们在池中的份额，可以在以后赎回底层资产以及交易费用的一部分。

### 计算 LP 代币

在 Uniswap v2 中，LP 代币的余额代表池中的流动性份额。最初铸造的份额数量等于存入金额的几何平均值：

<center>

$S_{minted} = \sqrt{x_{deposited} \cdot y_{deposited}}$

</center>

其中 $x_{deposited}$ 和 $y_{deposited}$ 分别是存入的 $token_0$ 和 $token_1$ 的数量。

由于 Uniswap v2 燃烧了最初的 1000 单位份额，有效余额变为：

<center>

𝐸𝑓𝑓𝑒𝑐𝑡𝑖𝑣𝑒 $S_{minted} = \sqrt{x_{deposited} \cdot y_{deposited}} - 1000$

</center>

**示例：**

LP 创建一个池（假设代币金额以以太坊计价，1 * $10^{18}$）：

-   token0 的初始储备 = 1000
-   token1 的初始储备 = 5000

因此，LP 获得 $\sqrt{(1000 \cdot 5000)}$ ∗ $10^{18} −1000$ ≈ 2236.068 ∗ $10^{18}$ LP 代币

---

## 2. Uniswap V2 合约

您应该熟悉 3 个 Uniswap V2 合约：

-   **UniswapV2Pair** — 为每个流动性池（例如 ETH/DAI、USDC/USDT）由 **UniswapV2Factory** 部署的合约。

    -   存储两种代币的储备。
    -   作为 **ERC-20 代币**：代表池中所有权份额的 **LP 代币**。
    -   添加流动性时铸造 LP 代币，移除流动性时燃烧它们。
    -   使用常数乘积公式（x * y = k）在两种代币之间执行交换。

-   **UniswapV2Factory** — 管理并从 **UniswapV2Pair** 创建池的合约。

    -   确保每个对只有一个池。
    -   池地址是可预测的（使用 CREATE2）。
    -   可以开启或关闭协议费用。
    -   重要函数：
        -   createPair()：为代币对创建新池。
        -   getPair()：返回现有池的地址。

-   **UniswapV2Router02** — 交易和流动性管理的主要入口点。
    -   使与池的交互变得简单和安全。
    -   处理代币转移、检查滑点、执行截止日期，并支持多跳交换。
    -   重要函数：
        -   **addLiquidity()**：添加流动性并接收 LP 代币。
        -   **removeLiquidity()**：移除流动性并取回代币。
        -   **swapExactTokensForTokens()**：将固定数量的输入代币交换为尽可能多的输出代币。

---

## 🛠️ 实验实践：创建流动性池

在本实验中，我们将演示如何使用 Hardhat 创建 Uniswap V2 流动性池并向其添加流动性。

### 创建 test/testCreatePool.js

在 `test` 目录中创建包含空测试套件的文件 `testCreatePool.js`：

```js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Create Pool", function () {
    let signer;
    let factory, router, token0, token1;
});
```

对于涉及 beforeEach 设置和测试用例的后续阶段，确保将代码放在 describe 块内。

### 在 describe 块中插入 beforeEach 设置

beforeEach 函数将在每个测试之前设置测试环境：

-   部署 UniswapV2Factory
-   部署 UniswapV2Router02
-   部署两个演示 ERC-20 代币（DemoTokenA 和 DemoTokenB）

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
        const TokenA = await ethers.getContractFactory("DemoTokenA");
        token0 = await TokenA.deploy();

        // 部署 Token1
        const TokenB = await ethers.getContractFactory("DemoTokenB");
        token1 = await TokenB.deploy();
    });

```

### 创建测试用例 - 创建并为流动性池提供资金

在 describe 块中添加以下测试用例。

<!-- prettier-ignore -->
```js
    it("Should create and fund a liquidity pool", async function () {

    });
```

在下面的后续步骤中，确保将代码放在此测试用例内。

-   **步骤 1：创建池**

    使用工厂合约创建具有 token0 和 token1 地址的新流动性池。

    <!-- prettier-ignore -->
    ```js
        // 步骤 1：创建池
        // -----------------------------------------------------------------

        tx = await factory.createPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        receipt = await tx.wait();
    ```

-   **步骤 2：获取池地址**

    有 3 种方式获取池地址。

    -   **方法 1：** 从交易收据事件日志中获取。

        在创建配对后立即获取配对地址时使用此方法

        <!-- prettier-ignore -->
        ```js
            // 步骤 2：获取池地址
            // ---------------------------------------------------------


            // 方法 1 - 事件：创建配对后从 PairCreated 事件获取配对地址。
            
            const logs = await factory.queryFilter(
                factory.filters.PairCreated(null)
            );
            pairAddress = logs[0].args.pair;
            console.log("Pair address:", pairAddress);
        ```

        检查池地址不是零地址。

        <!-- prettier-ignore -->
        ```js
            expect(pairAddress).to.not.equal(ethers.ZeroAddress);
        ```

        并且是有效地址。

        <!-- prettier-ignore -->
        ```js
            expect(pairAddress).to.be.properAddress;
        ```

    -   **方法 2：** 使用工厂合约的 `getPair()` 函数。当您想从储备代币地址查找现有配对时使用此方法。

        此方法需要调用链上工厂合约，效率低于下面的方法 3。

        <!-- prettier-ignore -->
        ```js
            // 方法 2 - 链上：通过调用链上工厂合约获取配对地址

            let pairAddress1 = await factory.getPair(
                await token0.getAddress(),
                await token1.getAddress()
            );
            expect(pairAddress1).to.equal(pairAddress);

        ```

    -   **方法 3：** 使用 CREATE2 操作码进行链下确定性计算。当您想从储备代币地址查找现有配对时使用此方法。

        这是首选方法，因为它不需要链上调用。但是，此方法需要知道您部署环境中 UniswapV2Pair 合约的初始化代码哈希。初始化代码哈希可能在不同环境之间有所不同（例如本地、测试网、主网）。

        <!-- prettier-ignore -->
        ```js
            // 方法 3 - 链下：使用 CREATE2 计算获取配对地址（首选）
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
                "0x215a032792ab9f4a5eb14f1f4c1daed5017b1eee4de72ddb42e06c967b16c5d4" // 初始化代码哈希
            );
            expect(pairAddress2).to.equal(pairAddress);
        ```

-   **步骤 3：批准代币转移**

    在添加流动性之前，批准路由器合约代表签名者花费 token0 和 token1。

    在这种情况下，我们将批准 2 个以太坊的 token0 和 3 个以太坊的 token1。

    <!-- prettier-ignore -->
    ```js
        // 步骤 3：批准代币转移
        // -----------------------------------------------------------------

        const amount0 = ethers.parseEther("1000");
        const amount1 = ethers.parseEther("5000");
        await token0.approve(await router.getAddress(), amount0);
        await token1.approve(await router.getAddress(), amount1);
    ```

-   **步骤 4：添加流动性**

    现在我们可以使用路由器合约的 `addLiquidity()` 向池中添加流动性（参见 **contracts/v2-periphery/UniswapV2Router02.sol**）。

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

    `addLiquidity()` 函数需要 8 个参数：

    -   tokenA: token0 的地址
    -   tokenB: token1 的地址
    -   amountADesired: 要添加的 token0 数量
    -   amountBDesired: 要添加的 token1 数量
    -   amountAMin: 要添加的 token0 最小数量（滑点保护）
    -   amountBMin: 要添加的 token1 最小数量（滑点保护）
    -   to: 流动性代币（LP 代币）的接收者
    -   deadline: 交易将回滚的 Unix 时间戳

    我们需要指定范围（最小值和期望值）的原因仅在我们向现有池添加流动性时才重要。在这种情况下，由于我们正在创建新池，最小值和期望值将是相同的。我们将在下一个实验中更详细地解释**滑点**的概念。

    要观察的另一个参数是 `deadline`。这是指定交易何时过期。在现实世界中，您会将其设置为合理的值（例如，从当前时间起 10 分钟）。

    <!-- prettier-ignore -->
    ```js
        // 步骤 4：添加流动性
        // -----------------------------------------------------------------

        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600; // 从当前区块起 10 分钟
    ```

    现在我们可以调用 `addLiquidity()` 函数向池中添加流动性。

    <!-- prettier-ignore -->
    ```js
        tx = await router.addLiquidity(
            await token0.getAddress(),  
            await token1.getAddress(),
            amount0, // 要添加的 token0 数量
            amount1, // 要添加的 token1 数量
            amount0, // 要添加的 token0 最小数量（滑点保护）
            amount1, // 要添加的 token1 最小数量（滑点保护）
            await signer.getAddress(), // 流动性代币的接收者
            deadline // 从当前区块起 10 分钟
        );
    ```

-   **步骤 5：检查池储备**

    添加流动性后，我们可以检查池的储备以确保代币已正确添加。

    首先，我们需要使用池地址获取配对合约实例。

    <!-- prettier-ignore -->
    ```js
        // 步骤 5：检查池储备
        // -----------------------------------------------------------------

        // 获取配对合约实例
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
    ```

    从配对合约，您现在可以使用 `getReserves()` 函数获取池中两种代币的当前储备。这将根据它们的地址按 token0 和 token1 的顺序返回储备。

    <!-- prettier-ignore -->
    ```javascript
        // 获取当前储备
        const reserves = await pair.getReserves(); 
    ```

    **重要**：`getReserves()` 返回的储备顺序对应于代币地址的顺序。这就是为什么我们需要通过比较地址值来正确映射它们。

    <!-- prettier-ignore -->
    ```javascript
        // 重要：确保根据代币地址正确映射储备
        const [reserve0, reserve1] =
            (await token0.getAddress()) < (await token1.getAddress())
                ? [reserves[0], reserves[1]]
                : [reserves[1], reserves[0]];
    ```

    显示储备。

    <!-- prettier-ignore -->
    ```js
        console.log("Reserve0:", ethers.formatEther(reserve0));
        console.log("Reserve1:", ethers.formatEther(reserve1));
    ```

    最后，验证储备与我们添加的金额匹配。

    <!-- prettier-ignore -->
    ```js
        expect(reserve0).to.equal(amount0);
        expect(reserve1).to.equal(amount1);
    ```

-   **步骤 6：检查流动性代币余额**

    请记住，当您向池中添加流动性时，您会收到代表您在池中份额的流动性代币（LP 代币）。这些代币可以在以后赎回底层资产以及交易费用的一部分。

    要获取流动性代币余额，您可以使用配对合约的 `balanceOf()` 函数，传入签名者的地址。

    <!-- prettier-ignore -->
    ```js
        // 检查签名的流动性代币余额
        const lpBalance = await pair.balanceOf(await signer.getAddress());
        console.log("LP Token Balance:", ethers.formatEther(lpBalance));
    ```

    铸造的 LP 代币数量基于添加的代币数量的几何平均值。参见 [计算 LP 代币](#calculating-lp-tokens)。

    <center>

    $L=\sqrt{x\cdot y}-\text{MINIMUM\_LIQUIDITY}$

    </center>

    其中 𝑥 和 𝑦 分别是添加到池中的 token0 和 token1 的数量，MINIMUM_LIQUIDITY 是一个小的常数（1000），永久锁定在池中以防止除以零错误。

    您可以使用上面的公式验证 LP 代币余额是否与预期金额匹配。

    注意：JavaScript 的 BigInt 没有内置的平方根函数，所以我们需要自己实现。

    <!-- prettier-ignore -->
    ```js
        // 根据公式检查 LP 余额：sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY (1000)

        // 我们需要为 BigInt 实现 sqrt，因为 JS Math.sqrt 只适用于 Number 类型
        function sqrtBigInt(value) {
            if (value < 0n) {
                throw new Error(
                    "Square root of negative numbers is not supported"
                );
            }

            if (value < 2n) {
                return value;
            }

            // 牛顿法求整数平方根
            let x = value;
            let y = (x + 1n) / 2n;

            while (y < x) {
                x = y;
                y = (x + value / x) / 2n;
            }

            return x;
        }

        const computedLpBalance = sqrtBigInt(amount0 * amount1) - 1000n; // 减去 MINIMUM_LIQUIDITY (1000)

        console.log(
            "Computed LP Token Balance:",
            ethers.formatEther(computedLpBalance)
        );        
        expect(lpBalance).to.equal(computedLpBalance);
    ```

### 运行测试

使用 Hardhat 运行测试。

```bash
hh test test/testCreatePool.js

    # 示例输出：
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

产生的 LP 代币余额应与上面 [LP 代币示例](#calculating-lp-tokens) 中的计算值匹配。

### 任务完成 ✅

在本实验中，您学习了如何使用 Hardhat 创建和为 Uniswap V2 流动性池提供资金。您还学习了如何在添加流动性后检查铸造到您地址的流动性代币（LP 代币）数量。
