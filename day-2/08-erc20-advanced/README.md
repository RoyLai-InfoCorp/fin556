# ERC20 代币标准进阶

## 1. 简介

在 **ERC20 代币标准基础** 中，我们学习了如何创建一个符合 ERC20 标准的基础 ERC20 代币合约，仅此而已。我们称之为香草代币（Vanilla ERC20）。在实践中，大多数 ERC20 代币都有额外的功能，如铸造、销毁、暂停等。在本课程中，我们将学习如何扩展香草 ERC20 代币以创建更具功能的代币。

---

## 2. ERC20 变体

-   **可铸造（Mintable）**：可铸造代币允许创建新代币并添加到总供应量。这对于需要随时间发行的代币很有用，例如众筹或作为奖励。

-   **可销毁（Burnable）**：可销毁代币允许销毁或从总供应量中移除代币。这对于需要退出流通的代币很有用，例如通缩模型或作为某些行为的惩罚。

-   **可暂停（Pausable）**：可暂停代币允许合约所有者暂停或取消暂停代币转账。这对于紧急情况很有用，例如安全漏洞或合约中的错误。

-   **有上限（Capped）**：有上限代币有最大供应量限制，不能超过。这对于需要有固定供应量的代币很有用，例如稀缺模型或价值存储。

-   **可拥有（Ownable）**：可拥有代币有一个所有者，拥有特殊权限，如铸造或暂停代币。这对于需要有中心权威的代币很有用，例如治理模型或实用代币。

---

## 3. 可铸造 ERC20 代币

打开 `node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol` 文件查看 OpenZeppelin 的 ERC20 合约实现。

注意合约有一个内部函数 `_mint(address account, uint256 value)`。

```solidity
    /**
     * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
     * Relies on the `_update` mechanism
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * NOTE: This function is not virtual, {_update} should be overridden instead.
     */
    function _mint(address account, uint256 value) internal {
        if (account == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        _update(address(0), account, value);
    }
```

`_update(address(0), account, value);` 这一行是对另一个内部函数 `_update()` 的调用。

```solidity
    /**
     * @dev Updates `from` and `to` by `value`.
     * This is equivalent to a transfer from `from` to `to`.
     * Emits a {Transfer} event.
     *
     * NOTE: This function is not virtual, {_beforeTokenTransfer} should be overridden instead.
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) private {
        uint256 fromBalance = _balanceOf[from];
        if (fromBalance < value) {
            revert ERC20InsufficientBalance(from, fromBalance, value);
        }
        unchecked {
            _balanceOf[from] = fromBalance - value;
            // Overflow not possible: the sum of all balances is capped by totalSupply, which is a uint256
            _balanceOf[to] += value;
        }

        emit Transfer(from, to, value);
    }
```

因此，`_mint()` 函数中的代码 `_update(address(0), account, value);` 意味着我们正在将 `account` 的余额增加 `value` 数量的代币，并从没有人的余额（address(0)）中扣除 `value` 数量。这有效地将代币的总供应量增加了 `value` 数量。

---

## 🛠️ 实验实践：MintableDemoToken

1.  **安装项目依赖**

    ```bash
    cd /workspace/day-2/08-erc20-advanced
    npm i
    ```

2. **创建 MintableDemoToken.sol**

    创建新文件 `contracts/MintableDemoToken.sol`。

    **contracts/MintableDemoToken.sol**

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity 0.8.20;

    import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    contract MintableDemoToken is ERC20 {
        constructor(
            uint256 initialSupply,
            address owner
        ) ERC20("DemoToken", "DEMO") {
            _mint(owner, initialSupply);
        }
    }
    ```

3. **添加 mint() 函数**

    为 `MintableDemoToken` 合约添加一个公共 `mint()` 函数。
    由于 OpenZeppelin 的 ERC20 合约已经有一个内部 `_mint()` 函数，我们可以简单地从我们的 `mint()` 函数调用它。

    **contracts/MintableDemoToken.sol**

    <!--ignore-prettier-->
    ```solidity
        function mint(address to, uint256 amount) virtual public {
            _mint(to, amount);
        }
    ```

    这个 `mint()` 函数声明为 `virtual`，以便可以在派生合约中被覆盖。

4. **为 MintableDemoToken 创建测试**

    创建新文件 `test/testMintableDemoToken.js`。

    **test/testMintableDemoToken.js**

    ```js
    const { expect } = require("chai");
    const { ethers } = require("hardhat");

    describe("MintableDemoToken", function () {
        let token;
        let owner;
        let addr1;

        beforeEach(async function () {
            [owner, addr1] = await ethers.getSigners();
            const Token = await ethers.getContractFactory("MintableDemoToken");
            token = await Token.deploy(1000, owner.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await token.name()).to.equal("DemoToken");
            expect(await token.symbol()).to.equal("DEMO");
        });

        it("Should assign initial supply to owner", async function () {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(ownerBalance).to.equal(1000n);
        });

        it("Should mint new tokens", async function () {
            await token.mint(addr1.address, 500);
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(500n);
        });
    });
    ```

5. **运行测试**

    ```bash
    hh test test/testMintableDemoToken.js

     # 示例输出：
     #  MintableDemoToken
     #    ✔ Should have correct name and symbol (123ms)
     #    ✔ Should assign initial supply to owner (78ms)
     #    ✔ Should mint new tokens (63ms)
     #
     #   3 passing (1s)
    ```
---

## 4. 可拥有合约

-   可拥有合约是一个有所有者的合约，所有者拥有特殊权限，如铸造或暂停代币。这对于需要有中心权威的代币很有用，例如治理模型或实用代币。

-   OpenZeppelin 在 `node_modules/@openzeppelin/contracts/access/Ownable.sol` 中提供了可拥有合约的实现。

-   **可拥有**合约有一个内部变量 `owner`，存储所有者的地址。

    ```solidity
    address private _owner;
    ```

-   **可拥有**合约有一个接受地址参数 `initialOwner` 的构造函数，用于设置合约的初始所有者。

    ```solidity
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }
    ```

-   **可拥有**合约有一个公共函数 `owner()`，返回所有者的地址。

    ```solidity
    function owner() public view virtual returns (address) {
        return _owner;
    }
    ```

-   **可拥有**合约有一个公共函数 `transferOwnership(address newOwner)`，允许当前所有者将所有权转移给新所有者。

    ```solidity
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }
    ```

-   **可拥有**合约有一个修饰符 `onlyOwner`，限制某些函数只能由所有者访问。

    ```solidity
    modifier onlyOwner() {
        _checkOwner();
        _;
    }
    ```

    在修饰符中，调用函数 `_checkOwner()` 来检查调用者是否是所有者。如果不是，它将回滚交易。

    `_;` 是一个特殊符号，告诉编译器在那个点插入函数体的其余部分。由于 `_;` 添加到可拥有修饰符的末尾，意味着修饰符逻辑在函数体之前执行。

    **示例：使用 onlyOwner 修饰符**

    ```solidity
    function mint(address to, uint256 amount) public override onlyOwner {
        _totalSupply += amount;
        _balanceOf[to] += amount;
    }
    ```

    在上面的示例中，**onlyOwner** 修饰符被添加到 `mint()` 函数。这将函数转换为：

    ```solidity
    function mint(address to, uint256 amount) public override {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _totalSupply += amount;
        _balanceOf[to] += amount;
    }
    ```

---

## 5. 多重继承 [可选]

https://docs.soliditylang.org/en/v0.8.8/contracts.html?highlight=multiple%20inheritance#multiple-inheritance-and-linearization

-   想象一个场景，您想创建一个结合两个现有合约功能的新合约，例如 `MintableDemoToken` 和 `Ownable`。一种方法是继承一个合约，然后将另一个合约的代码复制到新合约中。然而，代码重复不是一个好习惯，因为重复的代码可能与原始代码不同步，导致错误和维护问题。

    **示例：带代码重复的单继承**

    从 `MintableDemoToken` 派生，并将 OpenZeppelin 的可拥有合约的代码复制到新合约中。

    ```solidity
    contract OwnableMintableDemoToken is MintableDemoToken {
        address private _owner;
        constructor(
            uint256 initialSupply,
            address owner
        ) MintableDemoToken(initialSupply, owner) {
            if (owner == address(0)) {
                revert OwnableInvalidOwner(address(0));
            }
            _owner = owner;
        }
        function owner() public view virtual returns (address) {
            return _owner;
        }
        modifier onlyOwner() {
            if (_owner != msg.sender) {
                revert OwnableUnauthorized(msg.sender);
            }
            _;
        }
        function transferOwnership(address newOwner) public virtual onlyOwner {
            if (newOwner == address(0)) {
                revert OwnableInvalidOwner(address(0));
            }
            _owner = newOwner;
        }
        function mint(address to, uint256 amount) public override onlyOwner {
            _totalSupply += amount;
            _balanceOf[to] += amount;
        }
    }
    ```

    **示例：带代码库的单继承**

    另一种方法是使用包含另一个合约代码的库。然而，这意味着合约必须实现"包装"函数来调用库函数。

    ```solidity
    library OwnableLib {
        struct Data { address owner; }
        function init(Data storage self, address owner) internal { ... }
        function checkOwner(Data storage self) internal view { ... }
        function transferOwnership(Data storage self, address newOwner) internal { ... }
    }

    contract OwnableMintableDemoToken is MintableDemoToken {
        OwnableLib.Data private _ownable;
        using OwnableLib for OwnableLib.Data;
        constructor(
            uint256 initialSupply,
            address owner
        ) MintableDemoToken(initialSupply, owner) {
            _ownable.init(owner);
        }
        function owner() public view returns (address) {
            return _ownable.owner;
        }
        modifier onlyOwner() {
            _ownable.checkOwner();
            _;
        }
        function transferOwnership(address newOwner) public onlyOwner {
            _ownable.transferOwnership(newOwner);
        }
        function mint(address to, uint256 amount) public override onlyOwner {
            _totalSupply += amount;
            _balanceOf[to] += amount;
        }
    }
    ```

-   更好的方法是使用多重继承，新合约继承自两个现有合约。这样，新合约可以在没有代码重复或包装函数的情况下访问两个合约的功能。

    **示例：多重继承**

    同时从 `MintableDemoToken` 和 OpenZeppelin 的 `Ownable` 合约派生。

    ```solidity
    import "./MintableDemoToken.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";

    contract OwnableMintableDemoToken is MintableDemoToken, Ownable {
        constructor(
            uint256 initialSupply,
            address owner
        ) MintableDemoToken(initialSupply, owner) {
            transferOwnership(owner);
        }

        function mint(address to, uint256 amount) public override onlyOwner {
            super.mint(to, amount);
        }
    }
    ```

-   但是，如果两个基合约有一个共同的祖先合约，多重继承可能导致**菱形问题**。Solidity 使用 [C3 线性化](https://en.wikipedia.org/wiki/C3_linearization) 算法来解决菱形问题。

    **多重继承函数覆盖**

    -   考虑以下父类 A 和 B，每个都有一个同名函数：

        ```solidity
        contract A {
            function conflict() public virtual {}
        }
        contract B {
            function conflict() public virtual {}
        }
        ```

    -   A 和 B 的子合约 C 将无法编译，因为编译器要求当两个基合约定义相同的函数签名时，您必须明确覆盖。子合约必须实现该函数，即使它不添加新逻辑：

        ```solidity
        contract C is A, B {
            // Error: missing override for conflict()
        }
    ```

    -   仅仅写 `override` 是不够的。当多个父合约定义相同的函数时，您必须明确列出所有父合约。例如，合约 D 将失败：

        ```solidity
        contract D is A, B {
            function conflict() public override {} // Error
        }
    ```

    -   正确的形式是使用 `override(A, B)`：

        ```solidity
        contract E is A, B {
            function conflict() public override(A, B) {
                // choose implementation
            }
        }
    ```

    **多重继承构造函数**

    -   构造函数调用顺序遵循基合约定义的顺序，即从左到右。

    -   考虑以下父类 A 和 B。

        ```solidity
        contract TestParentA is TestGrantParent {
            string public name;
            constructor(string memory name_) {
                name=name_;
            }
        }

        contract TestParentB is TestGrantParent {
            uint public age;
            constructor(uint age_) {
                age=age_;
            }
        }
    ```

    -   基合约的构造函数使用其名称作为修饰符明确指定。
        ```solidity
        contract TestChildA is TestParentA, TestParentB {
            constructor() TestParentA('A') TestParentB(100) {
            }
        }
        ```

---

## 🛠️ 实验实践：OwnableMintableDemoToken

1. **安装 Hardhat Chai Matchers**

    ```bash
    npm i --save-dev @nomicfoundation/hardhat-chai-matchers --legacy-peer-deps
    ```

    这是为了在测试中使用 `to.be.revertedWith` 断言。

2. **更新 hardhat.config.js**

    更新 `hardhat.config.js` 在顶部插入 Hardhat Chai Matchers 插件。

    **hardhat.config.js**

    ```js
    require("@nomicfoundation/hardhat-chai-matchers");
    ```

3.  **创建 OwnableMintableDemoToken.sol**

    创建新文件 `contracts/OwnableMintableDemoToken.sol`。

    **contracts/OwnableMintableDemoToken.sol**

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity 0.8.20;

    import "./MintableDemoToken.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";

    contract OwnableMintableDemoToken is MintableDemoToken, Ownable {
        constructor(
            uint256 initialSupply,
            address owner
        ) MintableDemoToken(initialSupply, owner) Ownable(owner) {
            transferOwnership(owner);
        }
    }
    ```

    注意我们同时从 `MintableDemoToken` 和 OpenZeppelin 的 `Ownable` 合约继承，所以我们需要调用两个构造函数。请记住，构造函数调用顺序遵循基合约定义的顺序，即从左到右。

    ```solidity

    contract OwnableMintableDemoToken is MintableDemoToken, Ownable {

        constructor(...) MintableDemoToken(...) Ownable(...) {
            ...
        }
    }

    ```

4. **覆盖 mint() 函数**

    覆盖 `mint()` 函数以添加 `onlyOwner` 修饰符。

    **contracts/OwnableMintableDemoToken.sol**

    ```solidity

        function mint(address to, uint256 amount) public override onlyOwner {
            super.mint(to, amount);
        }

    ```

5. **为 OwnableMintableDemoToken 创建测试**

    创建新文件 `test/testOwnableMintableDemoToken.js`。

    **test/testOwnableMintableDemoToken.js**

    ```js
    const { expect } = require("chai");
    const { ethers } = require("hardhat");

    describe("OwnableMintableDemoToken", function () {
        let token;
        let owner;
        let addr1;
        let addr2;

        beforeEach(async function () {
            [owner, addr1, addr2] = await ethers.getSigners();
            const Token = await ethers.getContractFactory("OwnableMintableDemoToken");
            token = await Token.deploy(1000, owner.address);
        });

        it("Owner should mint new tokens", async function () {
            await token.mint(addr1.address, 500);
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(500);
        });

        it("Non-owner should not mint new tokens", async function () {
            await expect(token.connect(addr1).mint(addr2.address, 500))
                .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);
        });        
    });
    ```

6. **运行测试**

    ```bash
    hh test test/ownable-mintable-demo-token.js
        # 示例输出：
        #  OwnableMintableDemoToken
        #    ✔ Owner should mint new tokens (85ms)
        #    ✔ Non-owner should not mint new tokens (61ms)
        #
        #   2 passing (1s)
    ```

---

## 6. 众筹合约

-   众筹合约是一个允许用户用以太币购买代币的合约。这对于为项目筹集资金或向社区分发代币很有用。

-   为了让合约接收以太币，它需要有一个声明为 `payable` 的函数。

    **示例：Payable 函数**

    ```solidity
    function buyTokens() public payable {
        uint256 amount = msg.value * rate; // rate is number of tokens per wei
        _mint(msg.sender, amount);
    }
    ```

    -   `msg.value` 是一个特殊变量，包含随交易发送的以太币数量。`payable` 关键字允许函数接收以太币。

    -   要从 JavaScript 向 payable 函数发送以太币，您需要在交易对象中指定 `value` 字段。

    **示例：从 JavaScript 向 payable 函数发送 ETH**

    ```js
    await contract.buyTokens({ value: ethers.utils.parseEther("1.0") });
    ```

-   为了让众筹合约铸造代币，它需要有能力控制和与代币合约交互。这可以通过使众筹合约成为代币合约的所有者来实现。

    **示例：众筹合约作为代币合约的所有者**

    ```solidity
    contract Crowdsale {
        OwnableMintableDemoToken public token;
        constructor(OwnableMintableDemoToken tokenAddress) {
            token = tokenAddress;
            token.transferOwnership(address(this)); // transfer ownership to crowdsale contract
        }
        function buyTokens() public payable {
            uint256 amount = msg.value * rate; // rate is number of tokens per ETH
            token.mint(msg.sender, amount); // mint tokens to buyer
        }
    }
    ```

---

## 🛠️ 实验实践：众筹合约

1.  **创建 Crowdsale.sol**

    创建新文件 `contracts/Crowdsale.sol`。

    **contracts/Crowdsale.sol**

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity 0.8.20;

    import "./OwnableMintableDemoToken.sol";

    contract Crowdsale {
        OwnableMintableDemoToken public token;
        uint256 public rate; // number of tokens per wei
        event TokensPurchased(address buyer, uint256 amount);

        constructor(OwnableMintableDemoToken tokenAddress, uint256 rate_) {
            rate = rate_;
            token = tokenAddress;
        }

        function buyTokens() public payable {
            require(msg.value > 0, "Send ETH to buy tokens");
            uint256 amount = msg.value * rate;
            token.mint(msg.sender, amount);
            emit TokensPurchased(msg.sender, amount);
        }
    }
    ```

2. **为 Crowdsale 创建测试**

    创建新文件 `test/testCrowdsale.js`。

    **test/testCrowdsale.js**

    ```js
    const { expect } = require("chai");
    const { ethers } = require("hardhat");

    describe("Crowdsale", function () {
        let token;
        let crowdsale;
        let owner;
        let addr1;

        beforeEach(async function () {
            [owner, addr1] = await ethers.getSigners();

            // 部署代币合约
            const Token = await ethers.getContractFactory(
                "OwnableMintableDemoToken"
            );
            token = await Token.deploy(1000, owner.address);
            await token.waitForDeployment();

            // 部署众筹合约
            const Crowdsale = await ethers.getContractFactory("Crowdsale");
            crowdsale = await Crowdsale.deploy(await token.getAddress(), 1000); // 1000 tokens per wei
            await crowdsale.waitForDeployment();

            // 将代币所有权转移给众筹合约
            await token.transferOwnership(await crowdsale.getAddress());
        });

        it("Should allow users to buy tokens", async function () {
            await crowdsale
                .connect(addr1)
                .buyTokens({ value: ethers.parseEther("1.0") });
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(ethers.parseEther("1.0") * 1000n);
        });

        it("Should emit TokensPurchased event", async function () {
            await expect(
                crowdsale
                    .connect(addr1)
                    .buyTokens({ value: ethers.parseEther("1.0") })
            )
                .to.emit(crowdsale, "TokensPurchased")
                .withArgs(addr1.address, ethers.parseEther("1.0") * 1000n);
        });
    });

    ```

3. **运行测试**

    ```bash
    hh test test/crowdsale.js

        # 示例输出：
        #  Crowdsale
        #    ✔ Should allow users to buy tokens (123ms)
        #    ✔ Should emit TokensPurchased event (78ms)
        #
        #   2 passing (1s)
    ```
