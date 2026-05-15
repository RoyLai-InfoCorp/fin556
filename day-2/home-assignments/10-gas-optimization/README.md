# Gas 优化

## 1. Gas 优化的核心原则

Gas 优化实际上是**为数据支付更少**。  
您主要为此支付 Gas：

1. **状态（存储）写入和读取**

    -   写入存储（`SSTORE`）是您能做的最昂贵的事情。
    -   从存储读取（`SLOAD`）也花费，但更少。

2. **数据副本**
    -   在 `calldata → memory → storage` 之间或跨合约移动数据需要花费 Gas。

👉 简而言之：**写得更少，移动更少，接触更少的槽位**。

### 如何应用这一点

-   对于您不需要修改的函数输入使用 **calldata**。
-   在循环中将存储中的值缓存在**局部变量**中，而不是重新读取。
-   最小化**存储写入**（批量更新，避免覆盖模式）。
-   尽可能将**变量打包**到同一个存储槽中。
-   当值永不改变时，使用 **constant** 或 **immutable** 而不是存储。
-   保持循环小；避免不必要的内存扩展和外部调用。

> 一切——SSTORE/SLOAD 成本、槽位打包、calldata 与 memory、循环设计——都归结为一件事：**优化数据所在位置及其传输距离**。

### 示例：实践中的数据位置

```solidity
contract DataLocationExample {
    string private storedName;  // 默认 STORAGE（需要 SSTORE/SLOAD）

    function processName(string calldata name) external {
        // 对只读参数使用 CALldata - 最便宜
        bytes32 hash = keccak256(bytes(name));  // ~便宜，不接触存储

        // 仅在需要操作时复制到 MEMORY
        string memory tempName = name;  // calldata → memory 复制（如果大则昂贵）
        // ... 操作 tempName
    }

    function setName(string memory name) public {
        // MEMORY → STORAGE 复制
        // 昂贵：如果从零写入非零约 20,000 gas
        //        如果更新已使用的槽约 5,000 gas
        storedName = name;
    }
}
```

### Gas 成本（以太坊伦敦硬分叉）

-   **SSTORE（写入存储槽）：**

    -   零 → 非零：约 20,000 gas
    -   非零 → 非零（同一交易，"脏"槽）：约 5,000 gas
    -   写入相同值（无变化）：约 100 gas

-   **SLOAD（读取存储）：**

    -   首次读取槽位 = **冷** ≈ 2,100 + 100 gas
    -   后续读取 = **热** ≈ 100 gas

-   **Memory：** 比存储便宜，但不是免费的。

    -   约 3 gas/字 + 随着内存增长而扩展的成本。
    -   大数组/副本可能很昂贵。

-   **常量/不可变量：** 存储在字节码/代码存储中 → 运行时无 SLOAD 成本。

---

### 快速经验法则

-   读取比写入便宜得多。
-   存储按**槽**（32 字节）收费，而非按字段。
-   尽可能直接使用 **calldata**——如果您不需要复制到 memory，就不要复制。

## 2. 按函数类型的 Gas 成本（pure、view、状态修改）

不同的函数类型和模式可能有显著不同的 Gas 成本，特别是在与状态变量（存储）交互时。

**Gas 成本层级（链上调用）：**

1. **Pure 函数** - 最便宜（无存储访问，无状态读取）

    -   示例：数学计算、字符串操作
    -   Gas 成本：约 200-500 gas

2. **View 函数** - 低成本（读取存储但不修改）

    -   示例：`balanceOf()`、`count()`、getter 函数
    -   Gas 成本：约 200-2,000 gas（取决于存储复杂性）

3. **状态修改函数** - 最高成本（修改存储）
    -   示例：`transfer()`、`increment()`、setter 函数
    -   Gas 成本：20,000-50,000+ gas（取决于操作）

**关键洞察**：对 view/pure 函数的外部调用是**免费的**，但合约到合约的调用消耗 Gas。

---

## 🛠️ 实验：按函数类型的 Gas 成本（pure、view、状态修改）

**理解合约交互成本**：对 view/pure 函数的外部调用是免费的，但对 view/pure 函数的合约到合约调用需要花费 Gas。Counter 合约包含所有函数类型：pure、view 和状态修改。

### 安装项目依赖

    ```bash
    cd /workspace/day-2/home-assignments/10-gas-optimization
    npm i
    ```

### 创建 `test/functionCallTest.js`

```js
describe("Contract Function Call Costs", () => {
    it("Test pure functions (no storage access)", async () => {
        const factory = await ethers.getContractFactory("Counter");
        const counter = await factory.deploy(10);

        // 外部调用是免费的
        const addResult = await counter.addNumbers(5, 3);
        const squareResult = await counter.calculateSquare(7);
        console.log(
            `Pure functions - Add: ${addResult}, Square: ${squareResult} - FREE`
        );
    });

    it("Test view functions (read storage)", async () => {
        const factory = await ethers.getContractFactory("Counter");
        const counter = await factory.deploy(10);

        // 外部 view 调用是免费的
        const count1 = await counter.getCount();
        const count2 = await counter.count();
        console.log(
            `View functions - getCount: ${count1}, count: ${count2} - FREE`
        );
    });

    it("Test state-changing functions (modify storage)", async () => {
        const factory = await ethers.getContractFactory("Counter");
        const counter = await factory.deploy(10);

        // 状态修改总是花费 Gas
        const tx = await counter.increment();
        const receipt = await tx.wait();
        console.log(`State change gas used: ${receipt.gasUsed}`);

        const newCount = await counter.count();
        console.log(`Count after increment: ${newCount}`);
    });
});
```

### 运行测试：

```bash
hh test test/functionCallTest.js
```

**预期结果：**

-   **Pure 函数**：外部免费，链上约 200-500 gas
-   **View 函数**：外部免费，链上约 200-2,000 gas
-   **状态修改函数**：简单存储更新约 26,000-30,000 gas

**关键要点**：第 8 节中的理论 Gas 成本层级通过实践测试得到验证。

---

## 3. 存储槽打包和状态变量排序

存储操作是智能合约执行中最昂贵的部分。重新排序变量和使用更小的类型可以显著降低 Gas 成本。

```solidity
// ❌ 昂贵：大类型阻止打包
contract Inefficient {
    uint8 a;    // 槽 0
    uint256 b;  // 槽 1（不能与 uint8 打包）
    uint8 c;    // 槽 2（不能与 uint256 打包）
    // 总计：3 个存储槽 ≈ 60,000 gas 写入
}

// ✅ 高效：将小类型分组在一起
contract Efficient {
    uint8 a;   // }
    uint8 c;   // } 槽 0：全部打包在一起
    uint256 b; // 槽 1：大类型单独
    // 总计：2 个存储槽 ≈ 40,000 gas 写入
}
```

---

## 🛠️ 实验：存储槽打包和状态变量排序

**理解存储槽打包**：Solidity 将变量打包到 32 字节的存储槽中。多个小变量可以共享一个槽，显著降低 Gas 成本。

-   **创建存储效率合约**

    创建 `contracts/StorageTest.sol`：

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.8;

    // ❌ 低效：大类型阻止打包
    contract Inefficient {
        uint8 a;    // 槽 0
        uint256 b;  // 槽 1（不能与 uint8 打包）
        uint8 c;    // 槽 2（不能与 uint256 打包）

        function setValues(uint8 _a, uint256 _b, uint8 _c) public {
            a = _a;  // 20,000 gas（新存储槽）
            b = _b;  // 20,000 gas（新存储槽）
            c = _c;  // 20,000 gas（新存储槽）
        }
    }

    // ✅ 高效：将小类型分组在一起
    contract Efficient {
        uint8 a;    // 槽 0: 字节 0
        uint8 c;    // 槽 0: 字节 1（打包在一起）
        uint256 b;  // 槽 1: 大类型单独槽

        function setValues(uint8 _a, uint256 _b, uint8 _c) public {
            a = _a;  // 20,000 gas（新存储槽）
            c = _c;  // 5,000 gas（更新现有槽）
            b = _b;  // 20,000 gas（新存储槽）
        }
    }
    ```

-   **创建存储效率测试**

    创建 `test/storageEfficiencyTest.js`

    ```js
    describe("Storage Efficiency Comparison", () => {
        it("Test inefficient storage (3 slots)", async () => {
            const factory = await ethers.getContractFactory("Inefficient");
            const contract = await factory.deploy();

            const tx = await contract.setValues(1, 1000, 2);
            const receipt = await tx.wait();
            console.log(`Inefficient storage gas: ${receipt.gasUsed}`);
        });

        it("Test efficient storage (2 slots)", async () => {
            const factory = await ethers.getContractFactory("Efficient");
            const contract = await factory.deploy();

            const tx = await contract.setValues(1, 1000, 2);
            const receipt = await tx.wait();
            console.log(`Efficient storage gas: ${receipt.gasUsed}`);
        });
    });
    ```

-   **运行测试**

    ```bash
    hh test test/storageEfficiencyTest.js
    ```

-   **预期结果：**

    -   **低效**：约 60,000 gas（3 个存储槽 × 20,000 gas）
    -   **高效**：约 45,000 gas（2 个存储槽：1 个打包 + 1 个单独）
    -   **节省**：通过变量重新排序减少约 25% Gas

**关键要点**：正确的变量排序和类型选择可以将存储成本削减一半。

---

## 4. 函数可见性的 Gas 成本（public vs external）

函数可见性影响部署成本和执行 Gas。选择正确的可见性可以减少合约大小和 Gas 消耗。

**可见性类型和 Gas 影响：**

1. **External vs Public** - External 函数对外部调用更便宜

    -   `external`：参数存储在 calldata 中（更便宜）
    -   `public`：参数复制到 memory 中（更昂贵）

2. **Private/Internal** - 减少部署 Gas
    -   无外部接口生成
    -   更小的合约字节码
    -   （本实验未演示 - 专注于 external vs public）

```solidity
// ❌ 昂贵：Public 函数将 calldata 复制到 memory
contract Inefficient {
    function processData(bytes memory data) public pure returns (uint256) {
        return data.length; // Memory 复制花费 Gas
    }
}

// ✅ 高效：External 函数直接使用 calldata
contract Efficient {
    function processData(bytes calldata data) external pure returns (uint256) {
        return data.length; // 直接 calldata 访问
    }
}
```

---

## 🛠️ 实验：函数可见性的 Gas 成本（public vs external）

**理解可见性影响**：External 函数比 public 函数对外部调用更 Gas 高效，而 private/internal 函数减少部署成本。

### 创建可见性合约

创建 `contracts/VisibilityTest.sol`：

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// ❌ 较低效：Public 函数复制到 memory
contract PublicContract {
    function processArray(uint256[] memory arr) public pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }
}

// ✅ 较高效：External 函数使用 calldata
contract ExternalContract {
    function processArray(uint256[] calldata arr) external pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }
}
```

### 创建 `test/visibilityTest.js`

```js
describe("Function Visibility Gas Costs", () => {
    it("Test public function (memory parameters)", async () => {
        const factory = await ethers.getContractFactory("PublicContract");
        const contract = await factory.deploy();

        const testArray = [1, 2, 3, 4, 5];
        const gas = await contract.processArray.estimateGas(testArray);

        console.log(`Public function gas: ${gas}`);
    });

    it("Test external function (calldata parameters)", async () => {
        const factory = await ethers.getContractFactory("ExternalContract");
        const contract = await factory.deploy();

        const testArray = [1, 2, 3, 4, 5];
        const gas = await contract.processArray.estimateGas(testArray);

        console.log(`External function gas: ${gas}`);
    });
});
```

### 运行测试：

```bash
hh test test/visibilityTest.js
```

**预期结果：**

-   **Public 函数**：由于 memory 复制，Gas 更高
-   **External 函数**：由于使用 calldata，Gas 更低
-   **节省**：数组处理减少 10-20% Gas

**关键要点**：对于仅从外部调用的函数，使用 `external` 和 `calldata` 来降低执行 Gas 成本。
