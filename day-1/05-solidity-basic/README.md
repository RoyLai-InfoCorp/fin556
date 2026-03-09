# Solidity 基础

本课程介绍 Solidity 智能合约的基本语法和结构。

## 1. 数据类型

Solidity 有两大类数据类型：

### 值类型

值类型直接存储并在赋值或作为函数参数传递时按值复制：

-   **整数**：`uint256`、`uint8`、`int256` - 整数
-   **布尔**：`bool` - true 或 false 值
-   **地址**：`address` - 以太坊账户地址（20 字节）
-   **固定字节**：`bytes32`、`bytes1` - 固定长度字节数组

### 引用类型

引用类型存储数据的位置，可以存储在 memory、storage 或 calldata 中：

-   **字符串**：`string` - 文本数据（UTF-8 编码）
-   **动态数组**：`uint256[]` - 可调整大小的数组
-   **固定数组**：`uint256[5]` - 固定大小的数组
-   **映射**：`mapping(address => uint256)` - 键值存储

---

## 🛠️ 实验实践：数据类型

**理解 Solidity 数据类型**：创建一个展示基本数据类型存储和检索的合约。

-   **安装项目依赖**

    ```bash
    cd /workspace/day-1/05-solidity-basic
    npm i
    ```

-   **创建合约**

    创建 contracts/DataTypesDemo.sol。

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    contract DataTypesDemo {
        // 值类型
        uint256 public myUint = 123;
        bool public myBool = true;
        address public myAddress = 0x000000000000000000000000000000000000dEaD;
        bytes32 public myBytes = "Hi";

        // 引用类型
        string public myString = "Hello Solidity";
        uint256[] public myArray;
        mapping(address => uint256) public balances;

        // 修改状态的函数
        function addToArray(uint256 x) public {
            myArray.push(x);
        }

        function setBalance(uint256 amount) public {
            balances[msg.sender] = amount;
        }
    }
    ```

-   **启动 Hardhat 控制台**

    ```bash
    hh console
    ```

-   **在 Hardhat 控制台中部署**

    在 `>` 提示符后逐行输入以下命令：

    ```javascript
    > const { ethers } = require("hardhat");
    > let accounts = await ethers.getSigners();
    > const Demo = await ethers.getContractFactory("DataTypesDemo");
    > demo = await Demo.deploy();
    > await demo.waitForDeployment();
    ```

-   **与值类型交互**

    ```js
    > await demo.myUint();
    // 123n

    > await demo.myBool();
    // true

    > await demo.myAddress();
    // '0x000000000000000000000000000000000000dEaD'

    > await demo.myBytes();
    // '0x4869000000000000000000000000000000000000000000000000000000000000' // "Hi" 的十六进制
    ```

-   **与引用类型交互**

    ```js
    // 字符串
    > await demo.myString();
    // 'Hello Solidity'

    // 动态数组：先推送值，然后读取
    > await demo.addToArray(42);
    > await demo.addToArray(100);
    > await demo.myArray(0);
    // 42n
    > await demo.myArray(1);
    // 100n

    // 映射：设置和读取
    > await demo.setBalance(500);
    > await demo.balances(accounts[0].address);
    // 500n
    ```

---

## 2. 数据位置

https://docs.soliditylang.org/en/v0.8.8/types.html?highlight=data%20location#data-location

在处理字符串、数组和结构体等引用类型时，Solidity 要求您显式声明**数据位置**。

```solidity
function getName() public view returns (string memory)
function getDescription() public view returns (string memory)
```

如果您省略数据位置，编译将失败并显示如下错误：

```bash
TypeError: Data location must be "memory" or "calldata" for return parameter in function, but none was given.
```

### 什么是数据位置？

Solidity 中的**引用类型**可以存在于三个位置之一。每个都有不同的成本、生命周期和性能特征：

-   storage

    -   最昂贵的选项。
    -   状态变量的默认值。
    -   数据永久写入区块链。
    -   某些类型（例如映射）必须始终使用 storage。

-   memory

    -   临时的且非持久的。
    -   通常用于函数内的局部变量。
    -   函数执行结束后释放。

-   calldata
    -   最便宜的选项。
    -   只读的且不可修改的。
    -   主要用于外部调用的函数参数。
    -   成本与 memory 可比（Gmemory = 3）。

---

## 3. 合约继承

合约继承允许一个合约使用另一个合约的函数和状态变量。这类似于在其他编程语言中扩展类——子合约继承父合约的所有公共和内部函数。

**继承语法：**

```solidity
contract Parent {
    // 父合约代码
}

contract Child is Parent {
    // 子合约从 Parent 继承
    // 可以访问 Parent 的公共和内部函数
}
```

**关键概念：**

-   **父合约** - 被继承的合约（也称为基合约）
-   **子合约** - 继承的合约（也称为派生合约）
-   **访问父函数** - 子合约可以调用父合约的公共和内部函数
-   **代码重用** - 通过继承通用功能避免代码重复
-   **函数覆盖** - 子合约可以用新实现替换父合约函数

**展示继承的示例：**

```solidity
contract Animal {
    string public species;

    constructor(string memory _species) {
        species = _species;
    }

    function makeSound() public virtual returns (string memory) {
        return "Some generic animal sound";
    }

    function getSpecies() public view returns (string memory) {
        return species;
    }
}

contract Dog is Animal {
    constructor() Animal("Canine") {
        // 使用 "Canine" 调用父构造函数
    }

    // 覆盖父函数
    function makeSound() public pure override returns (string memory) {
        return "Woof!";
    }

    // Dog 特有的新函数
    function wagTail() public pure returns (string memory) {
        return "Tail wagging!";
    }
}
```

---

## 🛠️ 实验实践：合约继承

-   **创建合约**

    创建 contracts/InheritanceDemo.sol：

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    contract Animal {
    string public species;

        constructor(string memory _species) {
            species = _species;
        }

        function makeSound() public virtual pure returns (string memory) {
            return "Some generic animal sound";
        }

        function getSpecies() public view returns (string memory) {
            return species;
        }

    }

    contract Dog is Animal {
    constructor() Animal("Canine") {}

        function makeSound() public pure override returns (string memory) {
            return "Woof!";
        }

        function wagTail() public pure returns (string memory) {
            return "Tail wagging!";
        }

    }
    ```

-   **启动 Hardhat 控制台**

    退出并重新启动 Hardhat 控制台以获取新合约：

    ```bash
    hh console
    ```

-   **部署合约**

    ```javascript
    > const Animal = await ethers.getContractFactory("Animal");
    > animal = await Animal.deploy("Generic");
    > await animal.waitForDeployment();

    > const Dog = await ethers.getContractFactory("Dog");
    > dog = await Dog.deploy();
    > await dog.waitForDeployment();
    ```

-   **与合约交互**

    ```javascript
    // 来自父合约

    > await animal.makeSound();
    // 'Some generic animal sound'

    await animal.getSpecies();
    // 'Generic'

    // 来自子合约（继承 + 覆盖）
    await dog.makeSound();
    // 'Woof!'

    await dog.getSpecies();
    // 'Canine'

    await dog.wagTail();
    // 'Tail wagging!'
    ```

---

## 4. 可见性

### 函数可见性

可见性决定谁可以调用函数。可见性关键字位于函数声明中函数名之后：

```solidity
function functionName() [visibility] returns (returnType) {
    // function body
}
```

**可用的可见性类型：**

-   **public** - 任何人都可以调用（合约内部或外部）
-   **private** - 只能从同一合约内部调用
-   **internal** - 可以从同一合约或从继承的合约调用
-   **external** - 只能从合约外部调用（不能在内部调用）

**展示所有可见性类型的示例合约：**

```solidity
contract Visibility {
    uint256 private secretNumber = 42;

    // Public: 任何人都可以调用
    function publicFunction() public pure returns (string memory) {
        return "Anyone can call this";
    }

    // Private: 只有此合约
    function privateFunction() private pure returns (uint256) {
        return secretNumber;
    }

    // Internal: 此合约 + 派生合约
    function internalFunction() internal pure returns (string memory) {
        return "Internal use";
    }

    // External: 只能从合约外部调用
    function externalFunction() external pure returns (string memory) {
        return "Called from outside";
    }
}
```

### 状态变量可见性

状态变量也有控制谁可以读取它们的可见性关键字：

-   **public** - 任何人都可以读取变量（会自动生成 getter 函数）
-   **private** - 只有合约本身可以读取变量
-   **internal** - 合约和派生合约可以读取变量
-   **default（无关键字）** - 与 internal 相同
-   **注意**：状态变量没有 `external` 可见性
    **展示状态变量可见性的示例合约：**

```solidity
contract StateVariableVisibility {
    uint256 public publicVar = 1;      // 任何人都可以读取
    uint256 private privateVar = 2;    // 只有此合约
    uint256 internal internalVar = 3;  // 此合约 + 派生合约
    uint256 defaultVar = 4;            // 与 internal 相同
}
```

---

## 5. 内置修饰符

内置修饰符控制函数如何与合约的状态和以太交互。修饰符位于函数声明中可见性之后：

```solidity
function functionName() [visibility] [modifier] returns (returnType) {
    // function body
}
```

**可用的内置修饰符：**

-   **view** - 函数读取合约状态但不修改它
-   **pure** - 函数不读取也不修改合约状态（只使用参数）
-   **payable** - 函数可以被调用时接收以太
-   **无修饰符** - 函数可以读取和修改合约状态（默认行为）

**展示所有修饰符类型的示例合约：**

```solidity
contract FunctionModifiers {
    uint256 public value = 100;

    // Pure: 不读取也不修改状态
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }

    // View: 读取状态但不修改它
    function getValue() public view returns (uint256) {
        return value;
    }

    // Payable: 可以接收以太
    function deposit() public payable {
        // 函数可以接收以太
    }

    // Default: 可以修改状态
    function setValue(uint256 newValue) public {
        value = newValue;
    }
}
```

---

## 6. 映射

映射是键值存储，类似于其他编程语言中的哈希表或字典。它们提供了一种使用唯一键高效存储和检索数据的方式。

**语法：**

```solidity
mapping(KeyType => ValueType) public mappingName;
```

**关键特征：**

-   **仅存储**：映射只能存在于 storage（状态变量）中
-   **默认值**：所有可能的键最初都映射到默认值（0、false、"" 等）
-   **高效查找**：直接键访问 Gas 效率高
-   **虚拟大小**：每个可能的键在概念上都存在，默认值

**关键限制：**

-   **没有 length 属性**：`mapping.length` 不存在
-   **没有迭代**：您不能直接遍历映射
-   **没有键枚举**：无法获取已设置的所有键的列表
-   **无法删除**：您只能将值重置为默认值，无法真正删除键
-   **无法检查存在性**：无法判断键是被显式设置还是只有默认值

**处理映射限制：**

```solidity
contract MappingLimitations {
    mapping(address => uint256) public balances;
    mapping(address => bool) public hasAccount;  // 单独跟踪存在性

    // 必须手动跟踪计数 - 映射没有长度！
    uint256 public userCount;
    address[] public userList;  // 单独跟踪键以便迭代

    function addUser(uint256 amount) public {
        if (!hasAccount[msg.sender]) {  // 检查存在性标志
            hasAccount[msg.sender] = true;
            userCount++;
            userList.push(msg.sender);
        }
        balances[msg.sender] = amount;
    }

    function removeUser() public {
        if (hasAccount[msg.sender]) {
            hasAccount[msg.sender] = false;
            balances[msg.sender] = 0;  // 重置为默认值
            userCount--;
            // 注意：userList 仍然包含地址（需要清理）
        }
    }
}
```

**常见用例：**

-   存储余额：`mapping(address => uint256) balances`
-   访问控制：`mapping(address => bool) authorized`
-   数据关系：`mapping(uint256 => string) names`

---

## 🛠️ 实验实践：综合实践

请先自己阅读并尝试解决问题，然后再查看解决方案。之后将您的解决方案与提供的进行比较。

### 问题

**背景**

您有一个来自快速入门课程的基础合约 Counter，具有：

-   uint256 public count;
-   constructor(uint256 initial)
-   function increment() public

**任务**

1.  在 contracts/DepositCounter.sol 中构建一个新合约 **DepositCounter**，该合约：
    -   继承自 Counter
    -   接受 ETH 存款
    -   跟踪每个发送者的累计存款
    -   标记一个地址是否曾经存款
    -   跟踪唯一存款人的总数

2.  在 test/depositCounterTest.js 中创建一个测试脚本，该脚本：
    -   应该通过 count() 测试唯一存款人的数量
        -   count() 应该从 0 开始。
        -   来自 addr1 的第一次存款后，count() 应该是 1。
        -   来自同一地址的第二次存款不应增加 count()。
        -   来自不同地址（addr2）的存款应该将 count() 增加到 2。
    -   应该通过 deposits(addr) 测试每个地址的存款余额
        -   deposits(addr1) 应该从 0 开始。
        -   存款 1 ether 后，deposits(addr1) 应该是 1 ether。
        -   第二次存款 0.5 ether 应该将 deposits(addr1) 增加到 1.5 ether。

---

### 解决方案

此实验是"快速入门 Solidity"课程的扩展。您将创建一个接收 ETH 存款并跟踪每个发送者存款余额的存款计数器合约，结合到目前为止学到的所有概念。

-   **创建合约**

    创建 contracts/DepositCounter.sol：

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    import "./Counter.sol";
    contract DepositCounter is Counter {
        // 按地址跟踪存款
        mapping(address => uint256) public deposits;
        // 跟踪地址是否曾经存款
        mapping(address => bool) public hasAccount;
        // 构造函数调用父构造函数
        constructor() Counter(0) {}
        // 存款 ETH 并增加计数器
        function deposit() public payable {
            require(msg.value > 0, "Must send ETH");

            // 为唯一存款人增加计数器
            if (hasAccount[msg.sender] == false) {
                increment();
                hasAccount[msg.sender] = true;
            }
            // 记录谁发送了多少
            deposits[msg.sender] += msg.value;

        }
        // 检查地址是否曾经存款
        function isDepositor(address addr) public view returns (bool) {
            return hasAccount[addr];
        }
        // 检查合约的 ETH 余额
        function getBalance() public view returns (uint256) {
            return address(this).balance;
        }
    }
    ```

-   **创建测试脚本**
    创建 test/depositCounterTest.js：

    ```javascript
    const { expect } = require("chai");

    describe("DepositCounter", function () {
        let depositCounter;
        let owner, addr1, addr2;

        beforeEach(async function () {
            [owner, addr1, addr2] = await ethers.getSigners();
            const DepositCounter = await ethers.getContractFactory(
                "DepositCounter"
            );
            depositCounter = await DepositCounter.deploy();
            await depositCounter.waitForDeployment();
        });

        it("Should count depositor correctly", async function () {
            // 最初，addr1 没有账户
            expect(await depositCounter.count()).to.equal(0n);

            // 存款后，addr1 有一个账户
            await depositCounter.connect(addr1).deposit({
                value: ethers.parseEther("1.0"),
            });
            expect(await depositCounter.count()).to.equal(1n);

            // 再次存款，仍然是 1 个唯一存款人
            await depositCounter.connect(addr1).deposit({
                value: ethers.parseEther("0.5"),
            });
            expect(await depositCounter.count()).to.equal(1n);

            // addr2 存款后，计数应该是 2
            await depositCounter.connect(addr2).deposit({
                value: ethers.parseEther("0.5"),
            });
            expect(await depositCounter.count()).to.equal(2n);
        });

        it("Should track balance correctly", async function () {
            // 最初，addr1 没有余额
            expect(await depositCounter.deposits(addr1.address)).to.equal(0n);

            // 存款后，addr1 有余额
            await depositCounter.connect(addr1).deposit({
                value: ethers.parseEther("1.0"),
            });
            expect(await depositCounter.deposits(addr1.address)).to.equal(
                ethers.parseEther("1.0")
            );

            // 再次存款，应该累积
            await depositCounter.connect(addr1).deposit({
                value: ethers.parseEther("0.5"),
            });
            expect(await depositCounter.deposits(addr1.address)).to.equal(
                ethers.parseEther("1.5")
            );
        });
    });
    ```

-   **运行测试**

    ```bash
    hh test
    ```

-   **预期输出**

    您应该看到所有测试通过：

    ```bash
    DepositCounter
        ✔ Should count depositor correctly
        ✔ Should track balance correctly
    2 passing (456ms)
    ```
