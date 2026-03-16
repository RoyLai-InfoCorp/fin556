# 在测试网上部署 ERC20 代币

⚠️ 您必须先完成上一节关于 HD 钱包的课程，才能继续本课程。否则，请参考：

-   [分层确定性钱包](../../day-1/home-assignments/06-hd-wallet/README.md)
    -   您需要了解 .env 文件如何工作，因为您需要为测试网配置网络设置。
    -   使用助记词创建的账户将用于接收测试 ETH 并部署智能合约。

到目前为止，您应该熟悉在本地 Hardhat Network 上编写和部署智能合约。在本实验中，您将把学到的知识应用到名为 **Hoodi** 的公共测试网上。Hoodi 是以太坊主网的分支，用于测试目的。关于 Hoodi 的更多信息可以在这里找到：https://github.com/eth-clients/hoodi

本实验有两个部分：

1. 在公共测试网上发送交易
2. 在公共测试网上部署 ERC20 代币

## 🛠️ 实验实践：在公共测试网上发送交易

💀⚠️ **重要：切勿将您的真实生产钱包密钥用于实验**

### 步骤 1：为测试钱包生成助记词短语

由于本实验不再使用默认的 Hardhat Network，我们将需要使用助记词短语创建自己的测试钱包账户。

-   从上一节课[分层确定性钱包](../../day-1/home-assignments/06-hd-wallet/README.md)中将 **.env** 文件复制到此目录。

    您的 `.env` 文件应该类似如下：

    ```.env
    FIN556_MNEMONIC=用您的密码短语替换
    ```

-   记下账户地址，因为您稍后需要用它来领取测试 ETH。

    如果您"丢失"了您的地址，您可以从 hardhat console 获取：

    ```js
    > accounts = await ethers.getSigners();
    > accounts[0].address
    // 示例输出：
    // '0x6976827c1fC851546a202a5159a48Cac2b0649FF'
    ```

### 步骤 2：注册 Alchemy 账户

Alchemy 是一个 web3 网关提供商。他们不拥有测试网，只是提供访问连接到测试网的节点。
要使用他们的 API，您需要在 Alchemy 创建账户并获取 API 密钥。

a) 在 Alchemy 注册账户（https://www.alchemy.com/）

b) 创建新应用：

-   名称：FIN556
-   描述：FIN556 Testing
-   选择链：以太坊
-   选择网络：Hoodi

c) 记下提供的**网络 URL**。

![Alchemy App](./img/testnet.png)

### 步骤 3：为 Hoodi 配置 Hardhat

a) 创建包含助记词和 Alchemy URL 及 API 密钥的 `.env` 文件。

```.env
FIN556_MNEMONIC=用您的密码短语替换
FIN556_ALCHEMY_URL=用 Alchemy URL 替换
```

b) 在 hardhat.config.js 中更新，为 Hoodi 添加网络条目。

```js
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();
module.exports = {
    solidity: "0.8.20",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
            accounts: {
                mnemonic: process.env.FIN556_MNEMONIC,
            },
        },
        hoodi: {
            chainId: 560048,
            url: process.env.FIN556_ALCHEMY_URL,
            accounts: {
                mnemonic: process.env.FIN556_MNEMONIC,
            },
        },
        hardhat: {
            accounts: {
                mnemonic: process.env.FIN556_MNEMONIC,
            },
        },
    },
};
```

### 步骤 5：请求测试 ETH

**注意：** 确保您使用上面步骤 2 中获取的测试钱包地址来请求测试 ETH。

a) 转到此仓库 https://github.com/pk910/PoWFaucet 并参考"Hoodi Testnet"的链接。按照说明挖掘测试 ETH。

### 步骤 6：使用 Etherscan 检查您的测试 ETH 余额

-   转到 Etherscan（https://hoodi.etherscan.io）并输入上面步骤 2 中获取的钱包地址。例如 https://hoodi.etherscan.io/address/0x...

-   您应该在钱包中看到测试 ETH 余额。

    ![Hoodi Etherscan](./img/etherscan-balance.png)

### 步骤 7：使用 Hardhat console 转账 ETH

-   通过连接到 Hoodi 网络启动 Hardhat console

    ```bash
    hh console --network hoodi
    ```

-   获取账户列表

    ```javascript
    > const { ethers } = require("hardhat");
    > let accounts = await ethers.getSigners();
    ```

-   检查第一个账户的余额

    ```javascript
    > await ethers.provider.getBalance(accounts[0].address);

    // 示例输出：
    // 91150338056558588n
    ```

    如果您收到了测试 ETH，您应该看到非零余额。
    否则，在此停止并检查前面的步骤。

-   从第一个账户向第二个账户发送 0.00001 ETH

    ```javascript
    > let tx = await accounts[0].sendTransaction({
        to: accounts[1].address,
        value: ethers.parseEther("0.00001", "ether"),
    });
    > await tx.wait();
    > console.log(`txHash = ${tx.hash}`);
    // 示例输出：
    // txHash = 0x2973bea6b1221e61506c65ef6057c9acb7be8b6c1882884ba9086aebbc6619e9
    ```

-   使用上面的交易哈希在 etherscan 上检查交易。例如 https://hoodi.etherscan.io/tx/0x...

    它应该看起来像下面的截图。

    ![Hoodi Etherscan](./img/etherscan-txn.png)

---

## 🛠️ 实验实践：在公共测试网上部署 ERC20 和 Crowdsale 代币

在本节中，您将学习如何将您在**第 8 课（ERC20 代币标准进阶）**中学到的 ERC20 代币合约部署到 Hoodi 测试网。

### 步骤 1. 编写部署和购买代币脚本

-   在 `scripts` 目录中创建 `deployToken.js`。

    此脚本将部署 `OwnableMintableDemoToken` 合约，初始供应量为 1 ether，部署到部署者的地址。

    **scripts/deployToken.js**

    ```javascript
    const { ethers } = require("hardhat");
    async function main() {
        // 获取第一个签名者/账户来部署合约
        const signer = (await ethers.getSigners())[0];
        console.log(`Using account: ${await signer.getAddress()}`);

        // 部署 OwnableMintableDemoToken 合约
        const factory = await ethers.getContractFactory(
            "OwnableMintableDemoToken"
        );
        const demoToken = await factory.deploy(
            ethers.parseUnits("1", "ether"),
            signer.address
        );
        await demoToken.waitForDeployment();
        demoTokenAddress = await demoToken.getAddress();
        console.log(`DemoToken deployed to: ${demoTokenAddress}`);

        // 检查 gas 使用量
        const deploymentTx = demoToken.deploymentTransaction();
        const receipt = await ethers.provider.getTransactionReceipt(
            deploymentTx.hash
        );
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
        console.log(
            `Gas price: ${ethers.formatUnits(
                deploymentTx.gasPrice,
                "gwei"
            )} gwei`
        );
        const totalCost = receipt.gasUsed * deploymentTx.gasPrice;
        console.log(
            `Total deployment cost: ${ethers.formatEther(totalCost)} ETH`
        );
    }
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

-   在 `scripts` 目录中创建 `deployCrowdsale.js`，代码如下。

    此脚本将部署 `Crowdsale` 合约并将 `OwnableMintableDemoToken` 合约的所有权转移给 `Crowdsale` 合约。

    **注意：** `deployCrowdsale.js` 脚本需要设置 `DEMO_TOKEN_ADDRESS` 环境变量才能运行。这意味着必须先部署 `OwnableMintableDemoToken`。之后，`DEMO_TOKEN_ADDRESS` 环境变量应该用于部署 `Crowdsale` 合约。

    **scripts/deployCrowdsale.js**

    ```javascript
    const { ethers } = require("hardhat");
    require("dotenv").config();

    let demoTokenAddress = process.env.DEMO_TOKEN_ADDRESS;

    async function main() {
        if (!demoTokenAddress) {
            throw new Error(
                "Please export DEMO_TOKEN_ADDRESS environment variable."
            );
        }

        // 部署 Crowdsale 合约
        const CrowdsaleFactory = await ethers.getContractFactory("Crowdsale");
        const crowdsale = await CrowdsaleFactory.deploy(
            demoTokenAddress,
            1000 // 1 ETH = 1000 DemoTokens
        );
        await crowdsale.waitForDeployment();
        crowdsaleAddress = await crowdsale.getAddress();
        console.log(`Crowdsale deployed to: ${crowdsaleAddress}`);

        // 将代币所有权转移给 Crowdsale 合约
        const demoToken = await ethers.getContractAt(
            "OwnableMintableDemoToken",
            demoTokenAddress
        );
        const transferTx = await demoToken.transferOwnership(crowdsaleAddress);
        await transferTx.wait();
        console.log(
            `Transferred token ownership to Crowdsale at: ${crowdsaleAddress}`
        );
    }
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1);
    });
    ```

-   在 `scripts` 目录中创建 `buyTokens.js`。

    此脚本将从 `Crowdsale` 合约购买价值 0.0001 ether 的代币，并显示购买后购买者的余额。

    **注意：** `buyToken.js` 脚本需要设置 `CROWDSALE_ADDRESS` 环境变量才能运行。

    **scripts/buyTokens.js**

    ```js
    const { ethers } = require("hardhat");
    require("dotenv").config();
    let crowdsaleAddress = process.env.CROWDSALE_ADDRESS;

    async function main() {
        if (!crowdsaleAddress) {
            throw new Error(
                "Please export CROWDSALE_ADDRESS environment variable."
            );
        }

        // 获取第一个签名者/账户来购买代币
        const signer = (await ethers.getSigners())[0];
        console.log(
            `Purchasing tokens with account: ${await signer.getAddress()}`
        );

        // 获取 Crowdsale 合约
        const crowdsale = await ethers.getContractAt(
            "Crowdsale",
            crowdsaleAddress,
            signer
        );
        console.log(`CrowdSale contract: ${crowdsaleAddress}`);

        // 购买代币
        const ethAmount = ethers.parseUnits("0.0001", "ether"); // 价值 0.0001 ether 的代币
        const tx = await crowdsale.buyTokens({
            value: ethAmount,
        });
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();

        // 检查余额
        const tokenAddr = await crowdsale.token();
        const token = await ethers.getContractAt(
            "OwnableMintableDemoToken",
            tokenAddr
        );
        const balance = await token.balanceOf(signer.getAddress());
        console.log(`Token address: ${tokenAddr}`);
        console.log(
            `Tokens purchased: ${ethers.formatUnits(balance, 18)} DEMO`
        );
    }

    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

### 步骤 2. 在本地 Hardhat Network 上测试脚本

-   启动本地 Hardhat Network

    ```bash
    hh node
    ```

-   在另一个终端，运行部署脚本将 `OwnableMintableDemoToken` 合约部署到本地 Hardhat Network。

    ```bash
    hh run scripts/deployToken.js --network localhost

     # 示例输出：
     # Using account: 0x6976827c1fC851546a202a5159a48Cac2b0649FF
     # DemoToken deployed to: 0xa0fd5073B66aB43a76523e9c648af62D72560A09
     # Gas used: 1187601
     # Gas price: 1.875 gwei
     # Total deployment cost: 0.002226751875 ETH
    ```

-   现在，通过传递 `DEMO_TOKEN_ADDRESS` 环境变量，运行部署脚本将 `Crowdsale` 合约部署到本地 Hardhat Network。

    ```bash
    DEMO_TOKEN_ADDRESS=替换为-demo-token-地址 hh run scripts/deployCrowdsale.js --network localhost

     # 示例输出：
     # Crowdsale deployed to: 0x8E7d01da12C167B35604A8F288Ad4a6d3F099412
     # Transferred token ownership to Crowdsale at: 0x8E7d01da12C167B35604A8F288Ad4a6d3F099412
    ```

-   现在，通过传递 `CROWDSALE_ADDRESS` 环境变量，运行购买代币脚本从 `Crowdsale` 合约购买代币。

    ```bash
    CROWDSALE_ADDRESS=替换为-crowdsale-地址 hh run scripts/buyTokens.js --network localhost
     # 示例输出：
     # Purchasing tokens with account: 0x6976827c1fC851546a202a5159a48Cac2b0649FF
     # CrowdSale contract: 0x1D05A2919220e944bDDc54C5A37d4738D2944110
     # Transaction sent: 0xcdc1cb51b952a8e835eceae9b9519b700d25acbc1bdcbdd3d4461c5cab93d184
     # Token address: 0xa0fd5073B66aB43a76523e9c648af62D72560A09
     # Tokens purchased: 1.4 DEMO
    ```

-   您可以多次运行购买代币脚本，每次都应该看到代币余额增加 0.1 DEMO。

### 步骤 3. 在测试网上运行脚本

-   运行部署脚本将 `OwnableMintableDemoToken` 合约部署到测试网

    ```bash
    hh run scripts/deployToken.js --network hoodi

     # 示例输出：
    ```

-   现在，通过传递 `DEMO_TOKEN_ADDRESS` 环境变量，运行部署脚本将 `Crowdsale` 合约部署到本地 Hardhat Network。
    **注意：** 确保使用上面测试网部署输出中的 `DEMO_TOKEN_ADDRESS`。

    ```bash
    DEMO_TOKEN_ADDRESS=替换为-demo-token-地址 hh run scripts/deployCrowdsale.js --network hoodi

     # 示例输出：
    ```

-   现在，通过传递 `CROWDSALE_ADDRESS` 环境变量，运行购买代币脚本从 `Crowdsale` 合约购买代币。
    **注意：** 确保使用上面测试网部署输出中的 `CROWDSALE_ADDRESS`。

    ```bash
    CROWDSALE_ADDRESS=替换为-crowdsale-地址 hh run scripts/buyTokens.js --network hoodi

     # 示例输出：
    ```
