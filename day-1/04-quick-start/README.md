# Solidity 快速入门

本课程将带您了解使用 Solidity 和 Hardhat 编写、编译、测试和部署智能合约的基本步骤。

## 1. 典型的智能合约开发工作流程

智能合约开发与传统软件不同，因为**部署的代码无法更改**。一旦在区块链上，就是永久的。这意味着仔细测试和分阶段部署至关重要。

典型的工作流程如下：

### 步骤 1：编写合约

-   在 `contracts/` 目录中编写 Solidity 代码。
-   使用良好实践：注释、清晰的命名和模块化。

### 步骤 2：编译

-   运行 `npx hardhat compile`。
-   验证 `artifacts/` 文件夹中的**字节码**和 **ABI** 输出。
-   在继续之前修复任何编译器警告。

### 步骤 3：本地测试

-   在 `test/` 目录中编写自动化测试（使用 Mocha + Chai）。
-   运行 `npx hardhat test` 检查合约逻辑是否符合预期。
-   使用 **Hardhat 控制台** 进行交互式实验。

### 步骤 4：部署脚本（本地/独立网络）

-   在 `scripts/` 目录中编写部署脚本。
-   针对 **Hardhat Network（独立）** 运行它们以模拟部署。
-   示例：
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```

在以下部分，我们将更详细地介绍每个步骤。

---

## 2. 编写一个简单的合约

让我们从一个简单但完整的示例开始，展示 Solidity 智能合约的基本组件：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public count;

    constructor(uint256 initial) {
        count = initial;
    }

    function increment() public {
        count += 1;
    }

    function get() public view returns (uint256) {
        return count;
    }
}
```

让我们逐行分解这个简单的计数器合约：

-   **1. 许可证标识符**

    ```solidity
    // SPDX-License-Identifier: MIT
    ```

    -   **目的**：指定代码的软件许可证
    -   **为什么重要**：编译器需要它以避免警告
    -   **MIT 许可证**：常用的宽松开源许可证

-   **2. Pragma 指令**

    ```solidity
    pragma solidity ^0.8.20;
    ```

    -   **目的**：告诉编译器使用哪个版本的 Solidity
    -   **^0.8.20**：与版本 0.8.20 及 0.8.x 内更新的版本兼容
    -   **为什么重要**：不同版本具有不同的功能和安全性改进

-   **为什么本课程使用 0.8.20**：虽然不是最新版本，我们使用 0.8.20 是出于实际原因：更容易找到已建立版本的在线材料和文档，而且它与 OpenZeppelin 的 ERC20 实现使用的版本相同，使其成为经过验证的行业标准

-   **3. 合约声明**

    ```solidity
    contract Counter {
    ```

    -   **目的**：定义一个新的智能合约（类似于其他语言中的类）
    -   **Counter**：我们合约的名称
    -   **作用域**：大括号 `{}` 之间的所有内容都属于这个合约

-   **4. 状态变量**

    ```solidity
    uint256 public count;
    ```

    -   **uint256**：一个无符号整数（不能为负），可以容纳从 0 到 2^256-1 的值
    -   **public**：创建一个自动的 getter 函数，任何人都可以读取此值
    -   **count**：存储我们计数器值的变量名
    -   **存储**：此数据永久存储在区块链上

-   **5. 构造函数**

    ```solidity
    constructor(uint256 initial) {
        count = initial;
    }
    ```

    -   **目的**：只在合约部署时运行一次的特殊函数
    -   **参数**：接受一个 `initial` 值来设置起始计数
    -   **初始化**：将我们的 `count` 变量设置为提供的初始值

-   **6. 状态修改函数**

    ```solidity
    function increment() public {
        count += 1;
    }
    ```

    -   **function**：声明函数的关键字
    -   **increment**：函数名
    -   **public**：任何人都可以调用此函数
    -   **效果**：将计数增加 1（消耗 Gas，因为它修改了区块链状态）

-   **7. View 函数**

    ```solidity
    function get() public view returns (uint256) {
        return count;
    }
    ```

    -   **view**：此函数只读取数据，不修改状态
    -   **returns (uint256)**：指定此函数返回一个无符号整数
    -   **免费调用**：读取数据在外部调用时不消耗 Gas
    -   **注意**：`public count` 已经创建了一个 getter，所以这个函数是多余的，但为了学习目的展示

---

## 🛠️ 实验实践：基础合约

-   **安装项目依赖**

    ```bash
    cd /workspace/day-1/04-quick-start
    npm i
    ```

-   **创建 `contracts` 目录**

    此目录用于存储所有合约文件。

    ```bash
    mkdir contracts
    ```

-   **创建新的 Solidity 文件**

    在 `contracts` 目录中创建一个名为 `Counter.sol` 的文件。

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    contract Counter {
        uint256 public count;

        constructor(uint256 initial) {
            count = initial;
        }

        function increment() public {
            count += 1;
        }

        function get() public view returns (uint256) {
            return count;
        }
    }
    ```

---

## 3. 编译合约

可以把编译想象成把一本书从英语翻译成另一种语言。您的计算机无法直接读取 Solidity——它需要将代码翻译成机器语言。

**为什么需要编译？**

当您编写 Solidity 代码时，您是为人类编写的。但区块链计算机（称为 EVM）只懂数字和机器代码。编译就是翻译过程。

**编译后会得到什么？**

编译器为您提供两个重要的东西：

1. **字节码** - 合约的翻译版本，区块链可以运行
2. **ABI** - 描述其他程序您的合约能做什么

**理解 ABI（应用程序二进制接口）**

ABI 是合约接口的描述。它告诉其他程序：

-   合约有哪些函数
-   每个函数需要什么参数
-   每个函数返回什么

这是我们 Counter 合约的 ABI 样子：

```json
[
    {
        "type": "constructor",
        "inputs": [{ "name": "initial", "type": "uint256" }]
    },
    {
        "type": "function",
        "name": "count",
        "outputs": [{ "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "increment",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "get",
        "outputs": [{ "type": "uint256" }],
        "stateMutability": "view"
    }
]
```

**读取 ABI：**

-   **constructor**：需要一个名为 `initial` 的 `uint256` 参数来创建合约
-   **count**：一个返回 `uint256` 的函数，不修改状态（`view`）
-   **increment**：一个没有输入或输出的函数，修改合约状态
-   **get**：一个返回 `uint256` 而不修改状态的函数（`view`）

**为什么 ABI 重要：**

ABI 使外部程序能够与您的合约交互。没有它，应用程序就不会知道存在哪些函数或如何正确调用它们。

---

## 🛠️ 实验实践：合约编译

**理解编译过程**：学习如何编译 Solidity 合约并检查输出。

-   **验证编译器版本**

    打开 `hardhat.config.js`，确保它指定的版本与您的合约 pragma 相同：0.8.20。

    ```js
    require("@nomicfoundation/hardhat-toolbox");

    module.exports = {
        solidity: {
            version: "0.8.20",
        },
    };
    ```

-   **编译合约**

    ```bash
    hh compile
     # Compiled 1 Solidity file successfully (evm target: paris).
    ```

-   **检查编译输出**

    ```bash
     # 查看 artifacts 目录结构
     ls -la artifacts/contracts/Counter.sol/

     # drwxr-xr-x 2 vscode vscode 4096 Sep 26 08:19 .
     # drwxr-xr-x 3 vscode vscode 4096 Sep 26 08:19 ..
     # -rw-r--r-- 1 vscode vscode  105 Sep 26 08:19 Counter.dbg.json
     # -rw-r--r-- 1 vscode vscode 3000 Sep 26 08:19 Counter.json


     # 查看编译后的字节码和 ABI
     cat artifacts/contracts/Counter.sol/Counter.json

     # {
     #   "_format": "hh-sol-artifact-1",
     #   "contractName": "Counter",
     #   "sourceName": "contracts/Counter.sol",
     #   "abi": [
     #     {
     #       "inputs": [
     #         {
     #           "internalType": "uint256",
     #           "name": "initial",
     #           "type": "uint256"
     #         }
     #       ],
     #       "stateMutability": "nonpayable",
     #       "type": "constructor"
     #     },
     #     ...
     #   ],
     #   "bytecode": "0x60806040523480156...",
     #   "deployedBytecode":"0x608060..."
     # }

    ```

### 测验

比较 Counter.sol 与 Counter.json 中的函数数量。为什么它们不同？

---

## 4. 部署合约

一旦您的合约编译通过并通过测试，下一步就是部署。部署意味着将您合约的字节码广播到区块链网络，使其成为一个具有地址的实时智能合约。

### 关键概念

-   **部署脚本**  
    部署是通过请求区块链创建一个新合约的脚本执行的。脚本指定：

    -   合约的字节码（来自编译）。
    -   应用程序二进制接口（ABI）。
    -   任何构造函数参数。
    -   支付 Gas 费用的账户。

-   **合约地址**  
    每个部署的合约在区块链上都有一个唯一的地址。此地址用于在合约上线后与其交互。

-   **交易成本**  
    部署合约是一笔交易，因此消耗 Gas。在 Hardhat 这样的本地网络上，Gas 是免费的，因为账户已经预充值。在公共网络上，部署需要真实的 ETH。

-   **部署目标**
    -   **本地开发网络**：快速、安全且免费。用于迭代。
    -   **公共测试网**：模拟主网条件而无真实风险。
    -   **主网**：实时以太坊网络，真实价值处于风险中。

---

## 🛠️ 实验实践：部署合约

现在让我们通过将 `Counter` 合约部署到本地 Hardhat Network 来实践理论。

_注意：我们不会在本快速入门中介绍测试网部署，但稍后的模块会探索它。现在，您只需要知道部署到公共测试网涉及类似步骤，但需要配置网络设置和使用测试网 ETH 的钱包。_

1. **启动 Hardhat 节点**

    ```bash
    hh node
    ```

2. **打开一个新的终端窗口**

    在第一个终端中保持节点运行，在新终端中运行后续命令。

3. **创建 `scripts` 目录**

    ```bash
    cd /workspace/day-1/04-quick-start
    mkdir scripts
    ```

4. **编写部署脚本**

    创建 `scripts/deploy.js`，内容如下：

    ```javascript
    const { ethers } = require("hardhat");

    async function main() {
        const Counter = await ethers.getContractFactory("Counter");
        const counter = await Counter.deploy(42); // initial value
        await counter.waitForDeployment();
        console.log(`Counter deployed to: ${counter.target}`);
    }

    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

5. **运行部署脚本**

    在新终端中运行以下命令：

    ```bash

    hh run scripts/deploy.js --network localhost

     # 输出：
     # Counter deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
    ```

    请记下输出中打印的地址。这是您的合约在本地 Hardhat Network 上部署的位置。

---

## 5. 与已部署合约交互

部署合约使其在区块链上具有永久存在，但要使用它，您需要与它交互。在开始调用函数或读取状态之前，您必须掌握一些基本信息。

### 基本要求

1. **合约地址**

    -   每个部署的合约在区块链上都有一个唯一的地址。
    -   这是您的合约所在的"位置"，类似于网站的 URL。
    -   没有地址，您无法访问合约。

2. **ABI（应用程序二进制接口）**

    -   ABI 描述了合约的函数、参数和事件。
    -   把它想象成合约的菜单：它告诉您可以调用什么以及如何调用。
    -   ABI 在编译合约时生成（在 `artifacts` 文件夹中）。

3. **网络**

    -   您必须知道合约部署在哪个区块链网络（本地 Hardhat、Sepolia 测试网或主网）。
    -   合约地址仅在部署的网络上有效。
    -   与错误的网络交互将导致"合约未找到"错误。

4. **账户（签名者）**
    -   从合约读取只需要一个提供者。
    -   写入（发送交易）需要签名者——一个拥有私钥来授权交易并支付 Gas 费用的账户。
    -   在本地 Hardhat 上，账户已预充值。在测试网/主网，您需要真实的 ETH 或测试网 ETH。

---

## 🛠️ 实验实践：使用 Hardhat Console 与合约交互

现在我们将与上一个实验中部署的 `Counter` 合约进行交互。

1. **打开 Hardhat Console**

    确保您的 Hardhat 节点仍在运行，然后打开一个新终端：

    ```bash
    hh console --network localhost
    ```

    这为您提供了一个连接到本地区块链的交互式环境。

2. **附加到已部署的合约**

    将下面的地址替换为部署时打印的实际地址：

    ```javascript
    > const { ethers } = require("hardhat");
    > const Counter = await ethers.getContractFactory("Counter");
    > const counter = await Counter.attach(
        "replace-with-your-deployed-contract-address"
    );
    ```

    现在 `counter` 代表已部署的合约实例。

3. **读取当前计数**

    ```javascript
    await counter.count();

    //输出：
    // 42n
    ```

    预期结果：您在构造函数中设置的数字（例如 `42`）。

4. **增加计数**

    ```javascript
    tx = await counter.increment();

    //输出：
    //ContractTransactionResponse {
    //  ...
    //  hash: '0xa6da0147e111360546d66...',
    //  to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    //  from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    //  nonce: 1,
    //  gasLimit: 30000000n,
    //  gasPrice: 970481224n,
    //  maxPriorityFeePerGas: 232421875n,
    //  maxFeePerGas: 970481224n,
    //  value: 0n,
    //  ...
    //}
    ```

    这会发送一笔交易。等待确认。

    ```javascript
    await tx.wait();
    //输出：
    //ContractTransactionReceipt {
    //  ...
    //  transactionHash: '0xa6da0147e111360546d66...',
    //  ...
    //  gasUsed: 26445n,
    //  ...
    //  }
    ```

5. **验证新计数**

    ```javascript
    await counter.count();
    // 43n
    ```

    预期结果：之前的值加一。

## 🛠️ 实验实践：使用 JavaScript 与合约交互

虽然 Hardhat 控制台对快速实验很有用，但在实际项目中，您通常通过 JavaScript 脚本与合约交互。让我们编写一个简单的脚本来读取和更新 `Counter` 合约。

1. **创建脚本文件**
   在 `scripts` 目录中，创建一个名为 `interact.js` 的文件：

    ```javascript
    const { ethers } = require("hardhat");

    async function main() {
        // Replace with your deployed contract address
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

        // Get contract factory and attach to deployed address
        const Counter = await ethers.getContractFactory("Counter");
        const counter = await Counter.attach(contractAddress);

        // Read the current count
        let current = await counter.count();
        console.log("Current count:", current.toString());

        // Increment the count
        const tx = await counter.increment();
        await tx.wait(); // wait for transaction to be mined

        // Read the updated count
        let updated = await counter.count();
        console.log("Updated count:", updated.toString());
    }

    main().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
    ```

2. **运行脚本**
   确保您的 Hardhat 节点在一个终端中运行，在另一个终端中运行以下命令：

    ```bash
    hh run scripts/interact.js --network localhost

     ## 输出：
     # Current count: 44
     # Updated count: 45
    ```

---

## 6. 测试合约

到目前为止，您已经部署了一个合约并通过控制台和 JavaScript 脚本手动与它交互。这可以工作，但已经变得清楚**繁琐**的程度：

-   您需要启动一个本地节点。
-   运行部署脚本。
-   复制并粘贴合约地址。
-   手动调用函数并检查结果。

对于一个简单的计数器，这仍然可以管理。但对于更复杂的合约，重复这些步骤很快就会变得**耗时且容易出错**。

这正是自动化测试至关重要的原因。通过编写测试脚本，您可以：

-   为每个测试自动部署新的合约实例。
-   在几秒内运行多个检查。
-   确保您的合约每次都表现一致。

Hardhat 提供了一个测试框架，为每个测试创建临时的区块链环境，消除了手动验证并确保可重现的结果。测试自动部署新的合约实例，并使用断言来验证预期行为。

让我们检查一个 proper 测试脚本的结构，类似于我们分析合约结构的方式：

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter", function () {
    let counter;
    let owner;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const Counter = await ethers.getContractFactory("Counter");
        counter = await Counter.deploy(42);
        await counter.waitForDeployment();
    });

    it("Should set the initial count correctly", async function () {
        expect(await counter.count()).to.equal(42);
    });
});
```

**理解每个组件：**

-   **1. 导入语句**

    ```javascript
    const { expect } = require("chai");
    const { ethers } = require("hardhat");
    ```

    -   **chai**：用于进行测试期望的断言库
    -   **ethers**：用于与以太坊合约交互的库
    -   **hardhat**：提供测试工具的开发环境

-   **2. 测试套件声明**

    ```javascript
    describe("Counter", function () {
    ```

    -   **describe()**：将相关测试分组
    -   **"Counter"**：测试套件的描述性名称
    -   **函数作用域**：包含此合约的所有测试

-   **3. 测试变量**

    ```javascript
    let counter;
    let owner;
    ```

    -   **共享变量**：对套件中的所有测试可用
    -   **let 声明**：允许在设置函数中重新赋值
    -   **作用域**：在 describe 块内可访问

-   **4. 设置钩子**

    ```javascript
    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const Counter = await ethers.getContractFactory("Counter");
        counter = await Counter.deploy(42);
        await counter.waitForDeployment();
    });
    ```

    -   **beforeEach()**：在每个单独测试之前运行
    -   **新实例**：为每个测试创建新合约
    -   **测试隔离**：确保测试不会相互影响
    -   **干净状态**：每个测试从已知的初始条件开始

-   **5. 单独测试**

    ```javascript
    it("Should set the initial count correctly", async function () {
        expect(await counter.count()).to.equal(42);
    });
    ```

    -   **it()**：定义一个单独的测试用例
    -   **描述性名称**：解释测试验证的内容
    -   **expect()**：对预期行为进行断言
    -   **Async/await**：正确处理区块链交互

---

## 🛠️ 实验实践：测试合约

注意：此实验不需要启动 Hardhat 节点。如果有一个正在运行，您可以停止它。

-   **创建 `test` 目录**

    此目录用于存储测试脚本

    ```bash
    mkdir test
    ```

-   **安装 `chai` 包**

    此包将用于合约测试。

    ```bash
    npm i -D chai
    ```

-   **创建测试文件**

    创建 `test/test-counter.js`：

    ```javascript
    const { expect } = require("chai");

    describe("Counter", function () {
        let counter;

        beforeEach(async function () {
            const Counter = await ethers.getContractFactory("Counter");
            counter = await Counter.deploy(42);
            await counter.waitForDeployment();
        });

        it("Should set the initial count correctly", async function () {
            expect(await counter.count()).to.equal(42n);
        });

        it("Should increment the count by 1", async function () {
            await counter.increment();
            expect(await counter.count()).to.equal(43n);
        });
    });
    ```

-   **运行测试**

    ```bash
    hh test test/test-counter.js

     # 输出：
     # Counter
     #   ✓ Should set the initial count correctly (123ms)
     #   ✓ Should increment the count by 1 (72ms)
     #
     # 2 passing (303ms)
    ```

-   **任务完成 ✅**
