# 在测试网上执行 UniswapV2 代币交换和添加流动性

⚠️ 您必须先完成上一节[在测试网上部署 ERC20 代币](../../day-3/12-testnet/README.md) 才能继续本课程。否则，请参考：

-   [在测试网上部署 ERC20 代币](../../day-3/12-testnet/README.md)
    -   您需要使用相同的 .env 文件，因为它包含您的钱包助记词以及 Alchemy API 密钥和 URL。
    -   您需要拥有测试 ETH 余额才能部署智能合约并支付 Gas 费用。

## 🛠️ 实验实践：使用脚本在本地 Hardhat 节点上部署和交换代币

**注意：** 以下步骤包括在本地部署 UniswapV2 合约。这仅用于本地测试。对于公共测试网，您可以跳过 UniswapV2 合约的部署，因为它们已经部署在测试网上。

### 步骤 1. 创建包含您的钱包助记词和 Alchemy API 密钥的 .env 文件

-   **创建 .env 文件**

    将 **.env** 文件从 **../../day-3/12-testnet** 复制到此文件夹。

### 步骤 2. 创建部署库文件

-   **创建 scripts/deployLib.js**

    在 `scripts` 文件夹中创建一个名为 `deployLib.js` 的新文件，用于读取合约地址并将其保存到 JSON 文件中。

    ```javascript
    const fs = require("fs");

    // 函数安全更新 JSON 文件
    function saveJson(filePath, updates) {
        let data = {};

        // 如果文件存在则读取现有文件
        if (fs.existsSync(filePath)) {
            try {
                const fileContent = fs.readFileSync(filePath, "utf8");
                data = JSON.parse(fileContent);
            } catch (error) {
                console.error("Error reading JSON file:", error);
                data = {};
            }
        }

        // 将更新与现有数据合并
        data = { ...data, ...updates };

        // 写回文件
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`✅ Updated ${filePath} successfully`);
        } catch (error) {
            console.error("Error writing JSON file:", error);
            throw error;
        }

        return data;
    }

    // 函数按键获取特定地址
    function getAddress(filePath, key) {
        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            console.error(`File ${filePath} does not exist`);
            return null;
        }

        try {
            const fileContent = fs.readFileSync(filePath, "utf8");
            const data = JSON.parse(fileContent);

            if (key in data) {
                return data[key];
            } else {
                console.error(`Key "${key}" not found in ${filePath}`);
                return null;
            }
        } catch (error) {
            console.error("Error reading JSON file:", error);
            return null;
        }
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    exports = { saveJson, getAddress, delay };
    module.exports = { saveJson, getAddress, delay }; // 兼容 CommonJS 和 ES 模块
    ```

### 步骤 3. 创建部署 WETH9 合约的脚本

-   **创建 scripts/1_deployWETH9.js**

    在 `scripts` 文件夹中创建一个名为 `1_deployWETH9.js` 的新文件来部署 WETH9 合约。

    WETH9 只是一个用于包装 ETH 的 ERC20 代币，以便在 UniswapV2 中使用。部署 UniswapV2 Router 合约需要它。

    ```javascript
    const { ethers } = require("hardhat");
    const { saveJson, delay } = require("./deployLib.js");
    const path = require("path");
    const ADDRESS_FILE = "addresses.json";
    const filePath = path.join(__dirname, ADDRESS_FILE);

    async function main() {
        // 获取第一个签名者/账户来部署合约
        const signer = (await ethers.getSigners())[0];
        console.log(`Using account: ${await signer.getAddress()}`);

        // 部署 WETH9 合约
        const WETH9 = await ethers.getContractFactory(
            "contracts/v2-periphery/test/WETH9.sol:WETH9"
        );
        const weth9 = await WETH9.deploy();
        await weth9.waitForDeployment();
        weth9Address = await weth9.getAddress();
        console.log(`WETH9 deployed to: ${weth9Address}`);
        // weth9Address = "0x412E840F46ec463D26B540d1C326fCc929003B76"

        await delay(3000);

        // 保存 token1 地址
        saveJson(filePath, { weth9: weth9Address });
    }
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

### 步骤 4. 创建部署您自己的 ERC20 代币的脚本

-   **创建 scripts/2_deployTokens.js**

    在 `scripts` 文件夹中创建一个名为 `2_deployTokens.js` 的新文件来部署您自己的 ERC20 代币。请注意，代币被硬编码为 `DemoTokenA` 和 `DemoTokenB`，铸造的数量各为 1,000,000 ether。

    ```javascript
    const { ethers } = require("hardhat");
    const { saveJson, delay } = require("./deployLib.js");
    const path = require("path");
    const ADDRESS_FILE = "addresses.json";
    const filePath = path.join(__dirname, ADDRESS_FILE);

    async function main() {
        // 获取第一个签名者/账户来部署合约
        const signer = (await ethers.getSigners())[0];
        console.log(`Using account: ${await signer.getAddress()}`);

        // 部署 Token0
        const TokenA = await ethers.getContractFactory("DemoTokenA");
        token0 = await TokenA.deploy();
        await token0.waitForDeployment();
        token0Address = await token0.getAddress();
        console.log(`Token0 deployed to: ${token0Address}`);
        await delay(3000);

        // 保存 token0 地址
        saveJson(filePath, { token0: token0Address });

        // 部署 Token1
        const TokenB = await ethers.getContractFactory("DemoTokenB");
        token1 = await TokenB.deploy();
        await token1.waitForDeployment();
        token1Address = await token1.getAddress();
        console.log(`Token1 deployed to: ${token1Address}`);
        await delay(3000);

        // 保存 token1 地址
        saveJson(filePath, { token1: token1Address });
    }

    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

### 步骤 5. 创建部署 UniswapV2 Factory 和 Router 合约的脚本

-   **创建 scripts/3_deployUniswap.js**

    在 `scripts` 文件夹中创建一个名为 `3_deployUniswap.js` 的新文件来部署 UniswapV2 Factory 和 Router 合约。

    ```javascript
    const { ethers } = require("hardhat");
    const { saveJson, getAddress, delay } = require("./deployLib.js");
    const path = require("path");
    const ADDRESS_FILE = "addresses.json";
    const filePath = path.join(__dirname, ADDRESS_FILE);

    async function main() {
        // 获取第一个签名者/账户来部署合约
        const signer = (await ethers.getSigners())[0];
        console.log(`Using account: ${await signer.getAddress()}`);

        // 部署 UniswapV2Factory
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await Factory.deploy(signer.address);
        await factory.waitForDeployment();
        factoryAddress = await factory.getAddress();
        setTimeout(() => {}, 3000);
        console.log(`UniswapV2Factory deployed to: ${factoryAddress}`);
        saveJson(filePath, { factory: factoryAddress });
        await delay(3000);

        // 部署 UniswapV2Router02
        const Router = await ethers.getContractFactory("UniswapV2Router02");
        const weth9Address = getAddress(filePath, "weth9");
        router = await Router.deploy(
            factory.target,
            weth9Address // WETH 地址（本测试中未使用）
        );
        await router.waitForDeployment();
        routerAddress = await router.getAddress();
        console.log(`UniswapV2Router02 deployed to: ${routerAddress}`);
        saveJson(filePath, { router: routerAddress });
        await delay(3000);
    }
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

### 步骤 6. 创建为两种代币创建流动性池的脚本

-   **创建 scripts/4_createPool.js**

    ```js
    const { ethers } = require("hardhat");
    const addresses = require("./addresses.json");

    async function getPairAddress(token0, token1) {
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
            "0x215a032792ab9f4a5eb14f1f4c1daed5017b1eee4de72ddb42e06c967b16c5d4" // 初始化代码哈希（来自 getInitHashCode.js）
        );
        return pairAddress2;
    }

    async function main() {
        const [signer] = await ethers.getSigners();

        // 创建配对
        token0 = await ethers.getContractAt("DemoTokenA", addresses.token0);
        token1 = await ethers.getContractAt("DemoTokenB", addresses.token1);
        factory = await ethers.getContractAt(
            "UniswapV2Factory",
            addresses.factory
        );

        pairAddress1 = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        if (pairAddress1 === ethers.ZeroAddress) {
            const tx = await factory.createPair(
                await token0.getAddress(),
                await token1.getAddress()
            );
            await tx.wait();
            pairAddress1 = await factory.getPair(
                await token0.getAddress(),
                await token1.getAddress()
            );
        }

        console.log(`Pair Address1: ${pairAddress1}`);

        pairAddress2 = await getPairAddress(token0, token1);
        console.log(`Pair address2: ${pairAddress2}`);
    }
    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

### 步骤 7. 创建向代币对添加流动性的脚本

-   **创建 scripts/5_addLiquidity.js**

    ```js
    const { ethers } = require("hardhat");
    const addresses = require("./addresses.json");

    async function main() {
        console.log("Adding liquidity...");

        const [deployer] = await ethers.getSigners();
        console.log("Deployer address:", deployer.address);

        // 获取代币
        const tokenA = await ethers.getContractAt(
            "DemoTokenA",
            addresses.token0
        );
        const tokenB = await ethers.getContractAt(
            "DemoTokenB",
            addresses.token1
        );

        // 检查配对是否存在，如果不存在则返回错误
        const factory = await ethers.getContractAt(
            "UniswapV2Factory",
            addresses.factory
        );
        const pairAddress = await factory.getPair(
            await tokenA.getAddress(),
            await tokenB.getAddress()
        );
        if (pairAddress === ethers.ZeroAddress) {
            console.error("Error: Pair does not exist. Deploy the pair first.");
            return;
        }

        console.log("Pair address:", pairAddress);

        // 批准代币
        const amountA = ethers.parseUnits("1000", "ether");
        const amountB = ethers.parseUnits("5000", "ether");
        let tx = await tokenA.approve(addresses.router, amountA);
        await tx.wait();
        tx = await tokenB.approve(addresses.router, amountB);
        await tx.wait();

        // 添加流动性
        const router = await ethers.getContractAt(
            "UniswapV2Router02",
            addresses.router
        );
        const block = await ethers.provider.getBlock();
        const timestamp = block.timestamp + 600;
        tx = await router.addLiquidity(
            addresses.token0,
            addresses.token1,
            amountA,
            amountB,
            0,
            0,
            deployer.address,
            timestamp
        );
        await tx.wait();
        console.log("Liquidity added.");

        // 获取配对
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

        // 检查 LP 余额
        const lpBalance = await pair.balanceOf(deployer.address);
        console.log(
            `LP Balance of ${deployer.address}:`,
            ethers.formatUnits(lpBalance, 18)
        );

        // 检查储备
        const reserves = await pair.getReserves();
        const [reserves0, reserves1] =
            (await tokenA.getAddress()) < (await tokenB.getAddress())
                ? [reserves[0], reserves[1]]
                : [reserves[1], reserves[0]];

        console.log(
            `Reserves: ${ethers.formatUnits(
                reserves0,
                18
            )} / ${ethers.formatUnits(reserves1, 18)}`
        );
    }

    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

### 步骤 8. 在本地 Hardhat 节点上部署和为池提供资金

-   **启动本地 Hardhat 节点**

    ```bash
    hh node
    ```

-   **在并行终端中，部署合约并创建池**

    ```bash
    hh run scripts/1_deployWETH9.js --network localhost
    hh run scripts/2_deployTokens.js --network localhost
    hh run scripts/3_deployUniswap.js --network localhost
    hh run scripts/4_createPool.js --network localhost
    hh run scripts/5_addLiquidity.js --network localhost
    ```

### 步骤 9. 在公共测试网上部署和为池提供资金

在公共测试网上测试时，您不必自己部署 UniswapV2 合约，因为假设它们已经部署。在这种情况下，您只需要在脚本中使用已部署的合约地址。

-   WETH9_ADDRESS: `0x7a1fd5C3185fe6261577AccEe220844Dc9026225`
-   UNISWAPV2_FACTORY_ADDRESS: `0x342D7aeC78cd3b581eb67655B6B7Bb157328590e`
-   UNISWAPV2_ROUTER02_ADDRESS: `0x5b491662E508c2E405500C8BF9d67E5dF780cD8e`

-   **更新 addresses.json 文件**

    将 `scripts/addresses.json` 文件中的 `weth9`、`factory` 和 `router` 地址替换为上述地址。

-   **部署您的代币**

    ```bash
    hh run scripts/2_deployTokens.js --network hoodi

     # 示例输出：
     #
     # Using account: 0x6976827c1fC851546a202a5159a48Cac2b0649FF
     # Token0 deployed to: 0xd46ac798612964d992dc7ebCff6B903A76C667db
     # ✅ Updated /workspace/day-4/14-testnet-uniswap/scripts/addresses.json successfully
     # Token1 deployed to: 0x3c6AfCB44E34346ccB2d930e2B9FD028Ce98d7f3
     # ✅ Updated /workspace/day-4/14-testnet-uniswap/scripts/addresses.json successfully
    ```

-   **创建池**

    ```bash
    hh run scripts/4_createPool.js --network hoodi

     # 示例输出：
     # Pair Address1: 0x205a8873316e4629b4d8997F7CAaA92F7A6dAC44
     # Pair address2: 0x205a8873316e4629b4d8997F7CAaA92F7A6dAC44
    ```

-   **为池提供资金**

    ```bash
    hh run scripts/5_addLiquidity.js --network hoodi

     # 示例输出：
     # Adding liquidity...
     # Deployer address: 0x6976827c1fC851546a202a5159a48Cac2b0649FF
     # Pair address: 0x205a8873316e4629b4d8997F7CAaA92F7A6dAC44
     # Liquidity added.
     # LP Balance of 0x6976827c1fC851546a202a5159a48Cac2B0649FF: 2236.067977499789695409
     # Reserves: 1000.0 / 5000.0
    ```
