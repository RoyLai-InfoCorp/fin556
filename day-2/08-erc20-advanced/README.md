# ERC20 Token Standard Advanced

## 1. Intro

In **ERC20 Token Standard Basics**, we learnt about how to create a basic ERC20 token contract that adheres to the ERC20 standard and nothing more. We call this the Vanilla ERC20 Token. In practice, most ERC20 tokens have additional functionalities such as minting, burning, pausing, etc. In this lesson, we will learn how to extend the Vanilla ERC20 token to create a more functional token.

---

## 2. ERC20 Variants

-   **Mintable**: A mintable token allows new tokens to be created and added to the total supply. This is useful for tokens that need to be issued over time, such as in a crowdsale or as rewards.

-   **Burnable**: A burnable token allows tokens to be destroyed or removed from the total supply. This is useful for tokens that need to be taken out of circulation, such as in a deflationary model or as a penalty for certain actions.

-   **Pausable**: A pausable token allows the contract owner to pause or unpause the token transfers. This is useful for emergency situations, such as a security breach or a bug in the contract.

-   **Capped**: A capped token has a maximum supply limit that cannot be exceeded. This is useful for tokens that need to have a fixed supply, such as in a scarcity model or as a store of value.

-   **Ownable**: An ownable token has an owner who has special privileges, such as minting or pausing the token. This is useful for tokens that need to have a central authority, such as in a governance model or as a utility token.

---

## 3. Mintable ERC20 Token

Open the file at `node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol` to see OpenZeppelin's implementation of the ERC20 contract.

Notice that the contract has an internal function `_mint(address account, uint256 value)`.

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

The line `_update(address(0), account, value);` is a call to another internal function `_update()`. 

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

Therefore the line of code in `_mint()` function `_update(address(0), account, value);` means that we are increasing the balance of `account` by `value` amount of tokens and deducting `value` amount from no one's balance (address(0)). This effectively increases the total supply of the token by `value` amount of tokens.

---

## 🛠️ Lab Practice: MintableDemoToken

1.  **Install project dependencies**

    ```bash
    cd /workspace/day-2/08-erc20-advanced
    npm i
    ```

2. **Create MintableDemoToken.sol**

    Create a new file `contracts/MintableDemoToken.sol`.

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

3. **Add mint() function**

    Add a public `mint()` function to the `MintableDemoToken` contract.
    Since OpenZeppelin's ERC20 contract already has an internal `_mint()` function, we can simply call it from our `mint()` function.

    **contracts/MintableDemoToken.sol**

    ```solidity
        function mint(address to, uint256 amount) virtual public {
            _mint(to, amount);
        }
    }
    ```

    This `mint()` function is declared as `virtual` so that it can be overridden in derived contracts.

4. **Create test for MintableDemoToken**

    Create a new file `test/testMintableDemoToken.js`.

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

5. **Run the test**

    ```bash
    hh test test/testMintableDemoToken.js

     # Sample Output:
     #  MintableDemoToken
     #    ✔ Should have correct name and symbol (123ms)
     #    ✔ Should assign initial supply to owner (78ms)
     #    ✔ Should mint new tokens (63ms)
     #
     #   3 passing (1s)
    ```
---

## 4. Ownable Contract

-   An ownable contract is a contract that has an owner who has special privileges, such as minting or pausing the token. This is useful for tokens that need to have a central authority, such as in a governance model or as a utility token.

-   OpenZeppelin provides an implementation of the Ownable contract in `node_modules/@openzeppelin/contracts/access/Ownable.sol`.

-   The **Ownable** contract has an internal variable `owner` that stores the address of the owner.

    ```solidity
    address private _owner;
    ```

-   The **Ownable** contract has a constructor accepting an address parameter `initialOwner` to set the initial owner of the contract.

    ```solidity
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }
    ```

-   The **Ownable** contract has a public function `owner()` that returns the address of the owner.

    ```solidity
    function owner() public view virtual returns (address) {
        return _owner;
    }
    ```

-   The **Ownable** contract has a public function `transferOwnership(address newOwner)` that allows the current owner to transfer ownership to a new owner.

    ```solidity
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }
    ```

-   The **Ownable** contract has a modifier `onlyOwner` that restricts access to certain functions to only the owner.

    ```solidity
    modifier onlyOwner() {
        _checkOwner();
        _;
    }
    ```

    In the modifier, the function `_checkOwner()` is called to check if the caller is the owner. If not, it reverts the transaction.

    The `_;` is a special symbol that tells the compiler to insert the rest of the function body at that point. Since `_;` is added to the end of the ownable modifier. that means the modifier logic is executed before the function body.

    **Example: Using onlyOwner modifier**

    ```solidity
    function mint(address to, uint256 amount) public override onlyOwner {
        _totalSupply += amount;
        _balanceOf[to] += amount;
    }
    ```

    In the example above, **onlyOwner** modifier is added to the `mint()` function. This transforms the function to

    ```solidity
    function mint(address to, uint256 amount) public override {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _totalSupply += amount;
        _balanceOf[to] += amount;
    }
    ```

---

## 5. Multiple Inheritance [Optional]

https://docs.soliditylang.org/en/v0.8.8/contracts.html?highlight=multiple%20inheritance#multiple-inheritance-and-linearization


-   Imagine a scenario where you want to create a new contract that combines the functionalities of two existing contracts, such as `MintableDemoToken` and `Ownable`. One way is to inherit one contract and then copy the code from the other contract into the new contract. However, code duplication is not a good practice because the duplicated code can become out of sync with the original code, leading to bugs and maintenance issues.

    **Example: Single Inheritance with Code Duplication**

    Derive from `MintableDemoToken` and copy the code from OpenZeppelin's Ownable contract into the new contract.

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

    **Example: Single Inheritance with Code Library**

    Another way is to use a library that contains the code from the other contract. However, that means the contract has to implement "wrapper" functions to call the library functions.

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

-   A better way is to use multiple inheritance, where the new contract inherits from both existing contracts. This way, the new contract can access the functionalities of both contracts without code duplication or wrapper functions. 

    **Example: Multiple Inheritance**

    Derive from both `MintableDemoToken` and OpenZeppelin's `Ownable` contract.

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

-   However, multiple inheritance can lead to **diamond problem** if the two base contracts have a common ancestor contract. Solidity uses [C3 linearization](https://en.wikipedia.org/wiki/C3_linearization) algorithm to resolve the diamond problem.

    **Multiple inheritance function overriding**

    - Consider the following parent classes, A and B, each with a function of the same name:

        ```solidity
        contract A {
            function conflict() public virtual {}
        }
        contract B {
            function conflict() public virtual {}
        }
        ```

    - The child contract C of A and B will not compile because the compiler requires you to explicitly override when two base contracts define the same function signature. The child must implement the function, even if it doesn’t add new logic:

        ```solidity
        contract C is A, B {
            // Error: missing override for conflict()
        }
        ```

    - Simply writing `override` is not enough. When multiple parents define the same function, you must list all parent contracts explicitly. For example, contract D will fail:

        ```solidity
        contract D is A, B {
            function conflict() public override {} // Error
        }
        ```

    - The correct form is to use `override(A, B)`:

        ```solidity
        contract E is A, B {
            function conflict() public override(A, B) {
                // choose implementation
            }
        }
        ```

    **Multiple inheritance constructor**

    -   The order of constructor calls follows the order in which the base contracts are defined,ie. left to right.

    -   Consider the following parent classes, A and B.

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

    -   The constructor for base contracts are specified explicitly using their names as modifier.
        ```solidity
        contract TestChildA is TestParentA, TestParentB {
            constructor() TestParentA('A') TestParentB(100) {
            }
        }
        ```

---

## 🛠️ Lab Practice: OwnableMintableDemoToken

1. **Install Hardhat Chai Matchers**

    ```bash
    npm i --save-dev @nomicfoundation/hardhat-chai-matchers --legacy-peer-deps
    ```

    This is required to use the `to.be.revertedWith` assertion in the test.

2. **Update hardhat.config.js**

    Update `hardhat.config.js` to include the Hardhat Chai Matchers plugin.

    **hardhat.config.js**

    ```js
    require("@nomicfoundation/hardhat-ethers");
    require("@nomicfoundation/hardhat-chai-matchers");

    module.exports = {
        solidity: "0.8.20",
        networks: {
            localhost: {
                url: "http://127.0.0.1:8545",
            },
        },
    };
    ```

3.  **Create OwnableMintableDemoToken.sol**

    Create a new file `contracts/OwnableMintableDemoToken.sol`.

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

    ```solidity

    contract OwnableMintableDemoToken is MintableDemoToken, Ownable {

        constructor(...) MintableDemoToken(...) Ownable(...) {
            ...
        }
    }

    ```


4. **Override mint() function**

    Override the `mint()` function to add the `onlyOwner` modifier.

    **contracts/OwnableMintableDemoToken.sol**

    ```solidity

        function mint(address to, uint256 amount) public override onlyOwner {
            super.mint(to, amount);
        }

    ```

5. **Create test for OwnableMintableDemoToken**

    Create a new file `test/testOwnableMintableDemoToken.js`.

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
            await token.deployed();
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

6. **Run the test**

    ```bash
    hh test test/ownable-mintable-demo-token.js
        # Sample Output:
        #  OwnableMintableDemoToken
        #    ✔ Owner should mint new tokens (85ms)
        #    ✔ Non-owner should not mint new tokens (61ms)
        #
        #   2 passing (1s)
    ```

---

## 6. Crowdsale Contract

-   A crowdsale contract is a contract that allows users to buy tokens with Ether. This is useful for raising funds for a project or distributing tokens to a community.

-   For a contract to receive ETH, it needs to have a function declared as `payable`.

    **example: Payable function**

    ```solidity
    function buyTokens() public payable {
        uint256 amount = msg.value * rate; // rate is number of tokens per ETH
        _mint(msg.sender, amount);
    }
    ```

    -   The `msg.value` is a special variable that contains the amount of Ether sent with the transaction. The `payable` keyword allows the function to accept Ether.

    -  To send Ether to a payable function from JavaScript, you need to specify the `value` field in the transaction object.

    **example: Sending ETH to payable function from JavaScript**

    ```js
    await contract.buyTokens({ value: ethers.utils.parseEther("1.0") });
    ```

-   In order for crowdsale contract to mint tokens, it needs the ability to control and interact with the token contract. This can be achieved by making the crowdsale contract the owner of the token contract.

    **example: Crowdsale contract as owner of token contract**

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


## 🛠️ Lab Practice: Crowdsale Contract

1.  **Create Crowdsale.sol**

    Create a new file `contracts/Crowdsale.sol`.

    **contracts/Crowdsale.sol**

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity 0.8.20;

    import "./OwnableMintableDemoToken.sol";

    contract Crowdsale {
        OwnableMintableDemoToken public token;
        uint256 public rate; // number of tokens per ETH
        event TokensPurchased(address buyer, uint256 amount);

        constructor(OwnableMintableDemoToken tokenAddress, uint256 rate_) {
            rate = rate_;
            token = tokenAddress;
            token.transferOwnership(address(this)); // transfer ownership to crowdsale contract
        }

        function buyTokens() public payable {
            require(msg.value > 0, "Send ETH to buy tokens");
            uint256 amount = msg.value * rate;
            token.mint(msg.sender, amount);
            emit TokensPurchased(msg.sender, amount);
        }

    }
    ```

2. **Create test for Crowdsale**

    Create a new file `test/crowdsale.js`.

    **test/crowdsale.js**

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
            const Token = await ethers.getContractFactory("OwnableMintableDemoToken");
            token = await Token.deploy(1000, owner.address);
            await token.deployed();

            const Crowdsale = await ethers.getContractFactory("Crowdsale");
            crowdsale = await Crowdsale.deploy(token.address, 100); // 100 tokens per ETH
            await crowdsale.deployed();
        });

        it("Should allow users to buy tokens", async function () {
            await crowdsale.connect(addr1).buyTokens({ value: ethers.utils.parseEther("1.0") });
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);
        });

        it("Should emit TokensPurchased event", async function () {
            await expect(
                crowdsale.connect(addr1).buyTokens({ value: ethers.utils.parseEther("1.0") })
            ).to.emit(crowdsale, "TokensPurchased").withArgs(addr1.address, 100);
        });
    });
    ```

3. **Run the test**

    ```bash
    hh test test/crowdsale.js

        # Sample Output:
        #  Crowdsale
        #    ✔ Should allow users to buy tokens (123ms)
        #    ✔ Should emit TokensPurchased event (78ms)
        #
        #   2 passing (1s)
    ```

