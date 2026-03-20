## 🛠️ 实验实践：DApp - 部署合约

**注意：** 部署合约的脚本在[在测试网上执行 UniswapV2 代币交换和添加流动性](../14-testnet-uniswap/README.md)中说明。

**DApp 高级目标：**

我们要构建的 DApp 将具有以下功能：

-   连接到 Metamask 钱包。
-   与部署在本地 Hardhat 节点上的合约交互。
-   显示用户当前的代币余额。
-   显示当前池储备。
-   允许用户交换代币。

实验将分为以下部分：

a) 设置 Web 框架（React）
b) 使用硬编码数据创建 DApp 模型
c) 扩展 DApp 以集成 Metamask
d) 将 Uniswap 合约部署到本地 Hardhat 节点 - 这部分 ✅
e) 完成 DApp 以允许代币交换

### 步骤 1：设置

1.  **转到课程目录**

    ```bash
    cd /workspace/day-4/15-dapp/d-dapp-network
    ```

2.  **从 12-testnet 目录复制 .env 文件**

    在测试网课程中，我们创建了一个".env"文件来存储助记词和 Alchemy URL。我们将在此处使用相同的助记词。
    将"day-3/home-assignments/12-testnet"目录中的".env"文件复制到当前目录。

    ```bash
    cp ../../../day-3/home-assignments/12-testnet/.env .
    ```

### 步骤 2：启动本地 hardhat 节点

1.  **启动本地 hardhat 节点**

    如果您的节点成功启动，意味着它正在 localhost:8545 上运行，并使用 .env 文件中的助记词。您已准备好部署合约，并且还将能够使用 Metamask 显示从助记词生成的账户。

    ```bash
    npm i
    hh node
    ```

    ⚠️ 您必须在本节 DApp 开发过程中保持此终端窗口运行。如果停止了它，您需要重新启动它并重新部署合约。

### 步骤 3：部署 Uniswap 和 ERC20 合约

1.  **打开一个并行终端窗口**

2.  **部署 Uniswap 合约和代币**

    部署合约的脚本在 **day-4/14-DApp/scripts** 目录中，您只需要通过部署到 localhost 网络来依次运行它们。

    ```bash
    hh run scripts/1_deployWETH9.js --network localhost
    hh run scripts/2_deployTokens.js --network localhost
    hh run scripts/3_deployUniswap.js --network localhost
    ```

    这些脚本还将部署两个演示 ERC-20 代币（DemoTokenA 和 DemoTokenB）。

### 步骤 4：创建和资助流动性池

1.  **创建流动性池**

    ```bash
    hh run scripts/4_createPool.js --network localhost

     # 示例输出
     # Pair Address1: 0xC98f156B72ed9bA72C1c135F17B66C13c239Bd64
     # Pair address2: 0xC98f156B72ed9bA72C1c135F17B66C13c239Bd64
    ```

2.  **资助流动性池**

    该脚本被硬编码为向流动性池添加 1000 个 DemoTokenA 和 5000 个 DemoTokenB。

    ```bash
    hh run scripts/5_addLiquidity.js --network localhost

     # 示例输出
     # Deployer address: 0x6976827c1fC851546a202a5159a48Cac2B0649FF
     # Pair address: 0xC98f156B72ed9bA72C1c135F17B66C13c239Bd64
     # Liquidity added.
     # LP Balance of 0x6976827c1fC851546a202a5159a48Cac2B0649FF: 2236.067977499789695409
     # Reserves: 1000.0 / 5000.0
    ```

### 获取合约地址

-   **打开 scripts/addresses.json**：

    您应该看到以下合约的地址：

    -   UniswapV2Router02 地址
    -   UniswapV2Factory 地址
    -   Demo TokenA 地址
    -   Demo TokenB 地址

    **示例**

    ```json
    {
        "weth9": "0xB590338490D26a4dCF10b531B038aC6DA54329b9",
        "token0": "0x1A023B00f7a96f35319C740369d858787EE3e6f9",
        "token1": "0x6D6970ee7480F2BFAed31FAd535E29CA04987549",
        "factory": "0xEb8e214fc8bC4a4ED2C174635A01cD8e13Fc59d9",
        "router": "0x4fcaaD9DB6C7Aa0e9c3764fB216DcECeAf3A5BF8"
    }
    ```

    记下这些地址，因为我们在 DApp 中需要它们。

4.  **任务完成 ✅**

    您已成功设置本地 Hardhat 节点，部署 Uniswap 合约，创建和资助流动性池。

⚠️ **重要：** 您可以关闭并行终端窗口，但保持第一个终端窗口中的 hardhat 节点运行，因为它将在实验的下一部分中使用。
