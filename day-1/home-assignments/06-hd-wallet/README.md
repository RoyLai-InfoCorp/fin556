# 分层确定性（HD）钱包

📌 **注意：此作业是必修的。您需要完成此作业以生成您自己的助记词，并将其存储在 .env 文件中，供后续实验使用。**

## 1. 从密钥到钱包

我们已经了解到，以太坊账户由从私钥派生的地址表示。然而在实践中，用户通常需要多个地址——为了隐私、账户分离或与不同应用交互。由于私钥是加密的，管理数十个不相关的私钥既麻烦又有风险。为了解决这个问题，现代钱包使用一种称为分层确定性（HD）钱包的系统，可以从单个主种子生成和管理无限数量的地址。

### 核心概念

HD 钱包使用加密原理从单个种子短语（助记词）生成多个地址。此系统提供：

-   **确定性生成**：相同的种子总是产生相同的地址序列
-   **无限地址**：可以从一个种子生成无限数量的地址
-   **备份简单**：一个助记词备份整个钱包
-   **跨钱包兼容性**：标准确保钱包互操作性

### 助记词种子短语

通常由 12 个或 24 个单词组成，这些单词编码用于地址生成的主种子。每个单词来自 2048 个单词的标准化列表（BIP39 标准）。

### 保护您的助记词

此助记词被导入钱包软件以生成您的私钥和地址，例如 Metamask。但有时，我们可能需要在服务器端应用程序（如 Hardhat Network）中保存助记词，用于自动化任务，如合约部署或计划交易。

我们从实验实践中生成的助记词是敏感信息，不应作为纯文本存储在配置文件或硬编码在您的代码库中。

-   **单点故障**：泄露的助记词暴露所有派生地址
-   **备份关键**：丢失助记词意味着丢失所有资金
-   **存储最佳实践**：永远不要数字存储，使用安全的物理存储

在以下实验中，我们将学习如何使用 `dotenv` 包安全管理环境变量，如助记词。

---

## 🛠️ 实验实践：使用助记词

在此实验中，我们将学习如何在 Hardhat Network 中配置 HD 钱包并使用环境变量安全管理助记词。

Hardhat 为其本地网络使用一个众所周知的默认助记词：

```txt
test test test test test test test test test test test junk
```

我们将通过比较由此助记词生成的地址与 Hardhat Network 提供的账户来证明这确实是默认助记词。

### 步骤 1：启动 Hardhat 本地节点

-   **安装软件包**

    ```bash
    cd /workspace/day-1/home-assignments/06-hd-wallet
    npm i
    ```

-   **启动 Hardhat 独立网络**

    如果节点已从之前的实验运行，请先按 `Ctrl+C` 停止它，然后再重新启动。

    ```bash
     hh node

     # 输出：

     # Accounts
     # ========
     #
     # WARNING: These accounts, and their private keys, are publicly known.
     # Any funds sent to them on Mainnet or any other live network WILL BE  # LOST.
     #
     # Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
     # Private Key:  # 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    ```

    保持此运行到实验结束，因为我们希望比较在配置文件中设置助记词后从助记词生成的地址。

### 步骤 2：使用默认助记词配置 Hardhat Network

-   **为 Hardhat Network 设置助记词**

    打开 hardhat.config.js 并添加一个 **hardhat** 网络配置，助记词为 "test test test test test test test test test test test junk"

    ```javascript
    module.exports = {
        solidity: "0.8.20",
        networks: {
            localhost: {
                url: "http://localhost:8545",
            },
            hardhat: {
                accounts: {
                    mnemonic:
                        "test test test test test test test test test test test junk",
                },
            },
        },
    };
    ```

-   **启动 Hardhat 控制台**

    打开一个并行的终端窗口并运行：

    ```bash
    hh console
    ```

    注意：不要连接到 localhost，因为我们想要使用 Hardhat Network 内置提供程序，它使用我们刚刚在配置文件中设置的助记词。

-   **获取账户地址**

    在 Hardhat 控制台中运行以下命令以获取第一个账户的地址：

    ```js
    > const { ethers } = require("hardhat");
    > accounts = await ethers.getSigners();
    > accounts[0].address
    // '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

    ```

    将此地址与 Hardhat Node 终端中打印的第一个账户地址进行比较。它们应该匹配。

### 步骤 3：生成自定义助记词并配置 Hardhat Network

**注意：📌** 这是实验最重要的部分。请仔细按照说明操作。

-   **生成新助记词**

    在 Hardhat 控制台中，在 `>` 提示符后逐行运行以下命令以生成新的助记词短语：

    ```js
    > mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;

    // 示例输出：
    // 'hill drive sure whip bargain horn raven sunny claw example merit income'
    ```

    记录生成的助记词，因为我们在下一步需要它。

    输入 "CTRL+C" 退出 Hardhat 控制台。

-   **安装 dotenv 包**

    我们需要安装一个名为 `dotenv` 的包，允许我们从 `.env` 文件加载环境变量。

    ```bash
    npm i dotenv
    ```

-   **创建 .env 文件**
    在课程目录中创建一个名为 `.env` 的文件，并添加以下内容：

    ```env
    FIN556_MNEMONIC="your mnemonic phrase here"
    ```

    将 `your mnemonic phrase here` 替换为您之前生成的助记词。

-   **更新 hardhat.config.js**

    打开 `hardhat.config.js`。

    将 **hardhat** 网络配置中的助记词从：

    ```javascript
    mnemonic:
        "test test test test test test test test test test test junk",
    ```

    替换为：

    ```javascript
    mnemonic: process.env.FIN556_MNEMONIC,
    ```

### 步骤 4：验证新助记词被使用

-   **重启 Hardhat 控制台**

    ```bash
    hh console
    ```

-   **再次获取账户地址**

    在 Hardhat 控制台中运行以下命令以获取第一个账户的地址：

    ```js
    > const { ethers } = require("hardhat");
    > accounts = await ethers.getSigners();
    > accounts[0].address

    // '0x...' 您的新助记词生成的新地址将显示在这里

    ```

    将此地址与 Hardhat Node 终端中打印的第一个账户地址进行比较。它们不会匹配，因为我们更改了助记词。

**注意：📌** 请注意您在实验中制作的 **".env"** 文件和 **hardhat.config.js** 更改。它将在未来的实验中使用。

---

## 2. 派生路径

您可能已经注意到 Hardhat 本地节点默认生成 20 个账户。每次您运行以下命令时：

```js
const accounts = await ethers.getSigners();
accounts[0].address
accounts[1].address
accounts[2].address
...
```

您会得到相同的 20 个地址。

这是因为与单一私钥钱包不同，HD 钱包可以使用称为派生路径的概念从相同的助记词生成多个地址。

地址使用如下派生路径生成，例如 `m/44'/60'/0'/0`，其中：

-   `m`：主密钥
-   `44'`：目的（HD 钱包）
-   `60'`：币种类型（以太坊）
-   `0'`：账户索引
-   `0`：更改索引（外部地址）

通过更改派生路径的最后一段，我们可以从相同的助记词生成不同的地址。

例如，前三个地址使用以下路径派生：

-   第一个地址：`m/44'/60'/0'/0/0`
-   第二个地址：`m/44'/60'/0'/0/1`
-   第三个地址：`m/44'/60'/0'/0/2`

请注意，只有最后一段改变以生成不同的地址。

---

## 🛠️ 实验实践：使用派生路径

-   **启动 Hardhat 控制台**

    ```bash
    hh console
    ```

-   **生成新助记词**

    生成新的助记词短语并保存到变量中：

    ```js
    > const { ethers } = require("ethers");
    > mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;

    // 示例输出：
    // 'hill drive sure whip bargain horn raven sunny claw example merit income'
    ```

-   **生成账户**

    使用生成的助记词，使用标准派生路径 `m/44'/60'/0'/0/n` 派生前三个以太坊账户，其中 `n` 是账户索引（0、1、2）。

    ```js

    // 派生第一个账户（以太坊派生路径：m/44'/60'/0'/0/0）

    > const wallet0 = ethers.HDNodeWallet.fromPhrase(
        mnemonic,
        null,
        "m/44'/60'/0'/0/0"
    );
    > wallet0.address

    // 示例输出：
    // '0x18b2Ba693Fc01A6e7e6031e5a31936AC8ED8Aef5'

    // ------------------------------------------------------------------

    // 派生第二个账户（m/44'/60'/0'/0/1）

    > const wallet1 = ethers.HDNodeWallet.fromPhrase(
        mnemonic,
        null,
        "m/44'/60'/0'/0/1"
    );
    > wallet1.address

    // 示例输出：
    // '0x1B1256AD2F06d73F44C211660124c3d1ad706369'

    // ------------------------------------------------------------------

    // 派生第三个账户（m/44'/60'/0'/0/2）

    > const wallet2 = ethers.HDNodeWallet.fromPhrase(
        mnemonic,
        null,
        "m/44'/60'/0'/0/2"
    );
    > wallet2.address

    // 示例输出：
    //'0x56EDa570299e4e28B8dA016E1eFABc2FB8872A4f'

    ```

    记录生成的助记词和前三个账户地址。

    您可以看到，通过更改派生路径的最后一段，我们可以从相同的助记词生成不同的地址。

-   **任务完成 ✅**
