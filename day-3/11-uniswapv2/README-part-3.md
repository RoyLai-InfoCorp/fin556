# DEFI（Uniswap V2）- 第三部分

## 退出头寸

当您向 Uniswap V2 池添加流动性时，您会收到代表您在池中比例所有权的 LP 代币。
要退出，您只需通过 removeLiquidity() 燃烧您的 LP 代币。
这会从池的储备中返回您的代币份额。

您在池中的份额始终是：

<center>

$\text{Share} = \dfrac{\text{您的 LP 代币}}{\text{总 LP 供应量}}$

</center>

当您移除流动性时，池会向您发送两种代币储备的相同比例。

### 示例 - 退出头寸

考虑以下情况（假设代币金额以以太坊计价，1 * $10^{18}$）：

-   $token_0$ 的当前储备 = 900
-   $token_1$ 的当前储备 = 5557.23
-   您的 LP 代币余额 = 2,236.06

因此，您赎回所有 LP 代币（2,236.06）：

-   您收到的 $token_0$ 数量 = 900
-   您收到的 $token_1$ 数量 = 5557.23

注意：在真实的 Uniswap V2 中，极少量的 MINIMUM_LIQUIDITY 被永久锁定。为教学清晰起见，我们在此忽略那个灰尘。

---

## 无常损失 vs 费用收入

考虑以下情况（假设代币金额以以太坊计价，1 * $10^{18}$）：

交易前的池价值：

-   token0 的初始储备 = 1000（1 token0 价值 $5）
-   token1 的初始储备 = 5000（1 token1 价值 $1）
-   初始池价值 = 1000 * $5 + 5000 * $1 = $10,000

交易后的储备金额：

-   token0 的当前储备 = 900
-   token1 的当前储备 = 5557.23

**场景 1：假设代币价格没有变化**

-   token0 的当前储备 = 900
-   token1 的当前储备 = 5557.23
-   当前池价值 = 900 * $5 + 5557.23 * $1 = $10,057.23
-   盈利/亏损 = $10,057.23 - $10,000 = 57.23

在这种情况下，由于代币价格停滞，没有机会成本。盈利完全来自 0.3% 的费用。

**场景 2：假设 token0 当前价格为 $10**

-   token0 的当前储备 = 900
-   token1 的当前储备 = 5557.23
-   当前池价值 = 900 * $10 + 5557.23 * $1 = $14,557.23
-   盈利/亏损 = $14,557.23 - $10,000 = 4,557.23

但如果您持有您的代币，您将获得 $15,000 - $10,000 = $5,000。这种 $5000 - $4557.23 = $442.77 的差异称为**无常损失**。它代表了提供流动性与简单持有的机会成本。

当池包含稳定价值资产（例如 DAI/USDC）时，价格差异最小，交易费用往往超过无常损失——导致价值稳步增长。

---

## 🛠️ 实验实践：退出头寸

在本实验中，我们将演示如何赎回 LP 代币以退出流动性头寸。

### 创建 test/testSwapTokens.js

在 `test` 目录中创建包含空测试套件的文件 `testSwapTokens.js`：

```js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Exit Position", function () {
    let signer;
    let factory, router, token0, token1;
});
```

对于涉及 beforeEach 设置和测试用例的后续阶段，确保将代码放在 describe 块内。

### 在 describe 块中插入 beforeEach 设置

beforeEach 函数将通过部署 UniswapV2Factory、UniswapV2Router02 和两个演示代币的新实例在每个测试之前设置测试环境。

由于重点是退出头寸，我们还将创建流动性池，向其添加流动性并执行交易以产生一些费用。

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

        // 部署配对
        await factory.createPair(
            await token0.getAddress(),
            await token1.getAddress()
        );

        // 添加 1000 token0 和 5000 token1 作为流动性
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

        // 买入 100 token0 用 token1 以改变价格
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

### 测试：移除所有 LP 代币并取回代币

在 describe 块中添加以下测试用例。

<!-- prettier-ignore -->
```js
    it("Should remove liquidity and receive tokens", async function () {


    });
```

在下面的后续步骤中，确保将代码放在此测试用例内。

-   **步骤 1：创建配对合约的实例**

    要在两种代币之间交易，您需要找到持有这些代币流动性池的 Uniswap V2 配对合约。您可以通过在 Uniswap V2 Factory 合约上调用 `getPair(token0, token1)` 函数来做到这一点，并使用它创建合约实例。

    <!-- prettier-ignore -->
    ```javascript
        // 获取配对合约
        const pairAddress = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
    ```

-   **步骤 2：检查您的 LP 代币余额**

    当您向 Uniswap V2 池添加流动性时，您会收到代表您在池中份额的 LP 代币。您可以通过在配对合约上调用 `balanceOf(address)` 函数来检查您的 LP 代币余额。

    <!-- prettier-ignore -->
    ```javascript
        // 检查 LP 代币余额
        const lpBalance = await pair.balanceOf(signer.address);
        console.log("LP Token Balance:", ethers.formatEther(lpBalance));
    ```

    在移除流动性之前检查您的 token0 和 token1 余额，以便我们以后可以计算收到的金额。

-   **步骤 3：清算头寸**

    我们将通过移除所有 LP 代币来清算我们的整个头寸。为此，我们首先需要批准 Uniswap V2 Router 花费我们的 LP 代币。然后，我们在 Router 合约上调用 `removeLiquidity()` 函数。

    <!-- prettier-ignore -->
    ```javascript
        // 批准路由器花费您的 LP 代币
        await pair.approve(await router.getAddress(), lpBalance);
    ```

    然后，调用 `removeLiquidity()` 函数：

    ```javascript
    // 移除流动性
    const amount0Min = 0; // 接受任何数量的 token0
    const amount1Min = 0; // 接受任何数量的 token1
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

-   **步骤 4：验证收到的金额**

    最后，检查移除流动性后您的 token0 和 token1 余额，看看您收到了多少。

    <!-- prettier-ignore -->
    ```javascript
        // 检查清算后的余额
        const afterLiquidation0 = await token0.balanceOf(signer.address);
        const afterLiquidation1 = await token1.balanceOf(signer.address);

        // 应该接近 900 token0
        console.log(
            "Receives Token0:",
            ethers.formatEther(afterLiquidation0 - beforeLiquidation0)
        );

        // 应该接近 5557.23 token1
        console.log(
            "Receives Token1:",
            ethers.formatEther(afterLiquidation1 - beforeLiquidation1)
        );

        // 完全提款后，总供应量应正好剩下 1000 wei（最小流动性）
        const totalSupply = await pair.totalSupply();
        console.log("Total Supply:", totalSupply);
        expect(totalSupply).to.equal(1000n);

    ```

### 运行测试

使用 Hardhat 运行测试。

```bash
hh test test/testExitPosition.js

#   Test Exit Position
# LP Balance: 2236.067977499789695409
# Receives Token0: 899.999999999999999597
# Receives Token1: 5557.227237267357625955
# Total Supply: 1000n
#     ✔ Should remove liquidity and receive tokens
```

结果表明，我们成功移除了流动性并收到了约 900 个 token0 和 5557.23 个 token1，这与 [示例 - 退出头寸](#example---exit-position) 的结果匹配。
