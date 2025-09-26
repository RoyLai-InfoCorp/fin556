# Solidity Basics

This lesson covers the basic syntax and structure of Solidity smart contracts.

## 1. Data Types

Solidity has two main categories of data types:

### Value Types

Value types are stored directly and passed by value when assigned or passed as function parameters:

-   **Integers**: `uint256`, `uint8`, `int256` - whole numbers
-   **Boolean**: `bool` - true or false values
-   **Address**: `address` - Ethereum account addresses (20 bytes)
-   **Fixed bytes**: `bytes32`, `bytes1` - fixed-length byte arrays

### Reference Types

Reference types store the location of data and can be stored in memory, storage, or calldata:

-   **String**: `string` - text data (UTF-8 encoded)
-   **Dynamic arrays**: `uint256[]` - resizable arrays
-   **Fixed arrays**: `uint256[5]` - fixed-size arrays
-   **Mappings**: `mapping(address => uint256)` - key-value stores

---

## 🛠️ Lab Practice: Data Type

**Understanding Solidity data types**: Create a contract that demonstrates basic data type storage and retrieval.

-   **Install project dependencies**

    ```bash
    cd /workspace/day-1/05-solidity-basic
    npm i
    ```

-   **Create the contract**

    Create contracts/DataTypesDemo.sol.

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    contract DataTypesDemo {
        // Value types
        uint256 public myUint = 123;
        bool public myBool = true;
        address public myAddress = 0x000000000000000000000000000000000000dEaD;
        bytes32 public myBytes = "Hi";

        // Reference types
        string public myString = "Hello Solidity";
        uint256[] public myArray;
        mapping(address => uint256) public balances;

        // Functions to modify state
        function addToArray(uint256 x) public {
            myArray.push(x);
        }

        function setBalance(uint256 amount) public {
            balances[msg.sender] = amount;
        }
    }
    ```

-   **Start Hardhat console**

    ```bash
    hh console
    ```

-   **Deploy in Hardhat console**

    Enter the following commands line by line after the `>` prompt:

    ```javascript
    > const { ethers } = require("hardhat");
    > let accounts = await ethers.getSigners();
    > const Demo = await ethers.getContractFactory("DataTypesDemo");
    > demo = await Demo.deploy();
    > await demo.waitForDeployment();
    ```

-   **Interact with value types**

    ```js
    > await demo.myUint();
    // 123n

    > await demo.myBool();
    // true

    > await demo.myAddress();
    // '0x000000000000000000000000000000000000dEaD'

    > await demo.myBytes();
    // '0x4869000000000000000000000000000000000000000000000000000000000000' // Hex for "Hi"
    ```

-   **Interact with reference types**

    ```js
    // String
    > await demo.myString();
    // 'Hello Solidity'

    // Dynamic array: push values, then read
    > await demo.addToArray(42);
    > await demo.addToArray(100);
    > await demo.myArray(0);
    // 42n
    > await demo.myArray(1);
    // 100n

    // Mapping: set and read
    > await demo.setBalance(500);
    > await demo.balances(accounts[0].address);
    // 500n
    ```

---

## 2. Contract Inheritance

Contract inheritance allows one contract to use functions and state variables from another contract. It's like extending a class in other programming languages - the child contract inherits all public and internal functions from the parent.

**Inheritance syntax:**

```solidity
contract Parent {
    // Parent contract code
}

contract Child is Parent {
    // Child contract inherits from Parent
    // Can access Parent's public and internal functions
}
```

**Key concepts:**

-   **Parent contract** - The contract being inherited from (also called base contract)
-   **Child contract** - The contract that inherits (also called derived contract)
-   **Access to parent functions** - Child can call parent's public and internal functions
-   **Code reuse** - Avoid duplicating code by inheriting common functionality
-   **Function overriding** - Child can replace parent functions with new implementations

**Example showing inheritance:**

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
        // Call parent constructor with "Canine"
    }

    // Override parent function
    function makeSound() public pure override returns (string memory) {
        return "Woof!";
    }

    // New function specific to Dog
    function wagTail() public pure returns (string memory) {
        return "Tail wagging!";
    }
}
```

---

## 🛠️ Lab Practice: Contract Inheritance

-   **Create the contracts**

    Create contracts/InheritanceDemo.sol:

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

-   **Start Hardhat console**

    Quit and restart the Hardhat console to pick up the new contract:

    ```bash
    hh console
    ```

-   **Deploy Contracts**

    ```javascript
    > const Animal = await ethers.getContractFactory("Animal");
    > animal = await Animal.deploy("Generic");
    > await animal.waitForDeployment();

    > const Dog = await ethers.getContractFactory("Dog");
    > dog = await Dog.deploy();
    > await dog.waitForDeployment();
    ```

-   **Interact with contracts**

    ```javascript
    // From parent

    > await animal.makeSound();
    // 'Some generic animal sound'

    await animal.getSpecies();
    // 'Generic'

    // From child (inherited + overridden)
    await dog.makeSound();
    // 'Woof!'

    await dog.getSpecies();
    // 'Canine'

    await dog.wagTail();
    // 'Tail wagging!'
    ```

---

## 3. Visibility

### Function Visibility

Visibility determines who can call a function. The visibility keyword comes after the function name in the function declaration:

```solidity
function functionName() [visibility] returns (returnType) {
    // function body
}
```

**Available visibility types:**

-   **public** - Can be called by anyone (inside or outside the contract)
-   **private** - Can only be called from within the same contract
-   **internal** - Can be called from within the same contract or contracts that inherit from it
-   **external** - Can only be called from outside the contract (not internally)

**Example contract showing all visibility types:**

```solidity
contract Visibility {
    uint256 private secretNumber = 42;

    // Public: callable by anyone
    function publicFunction() public pure returns (string memory) {
        return "Anyone can call this";
    }

    // Private: only this contract
    function privateFunction() private pure returns (uint256) {
        return secretNumber;
    }

    // Internal: this contract + derived contracts
    function internalFunction() internal pure returns (string memory) {
        return "Internal use";
    }

    // External: only from outside the contract
    function externalFunction() external pure returns (string memory) {
        return "Called from outside";
    }
}
```

### State Variable Visibility

State variables also have visibility keywords that control who can read them:

-   **public** - Anyone can read the variable (a getter function is auto-generated)
-   **private** - Only the contract itself can read the variable
-   **internal** - The contract and derived contracts can read the variable
-   **default (no keyword)** - Same as internal
-   **Note**: There is no `external` visibility for state variables
    **Example contract showing state variable visibility:**

```solidity
contract StateVariableVisibility {
    uint256 public publicVar = 1;      // Anyone can read
    uint256 private privateVar = 2;    // Only this contract
    uint256 internal internalVar = 3;  // This contract + derived contracts
    uint256 defaultVar = 4;            // Same as internal
}
```

---

## 4. Built-in Modifiers

Built-in modifiers control how functions interact with the contract's state and Ether. The modifier comes after visibility in the function declaration:

```solidity
function functionName() [visibility] [modifier] returns (returnType) {
    // function body
}
```

**Available built-in modifiers:**

-   **view** - Function reads contract state but doesn't modify it
-   **pure** - Function doesn't read or modify contract state (only uses parameters)
-   **payable** - Function can receive Ether when called
-   **no modifier** - Function can read and modify contract state (default behavior)

**Example contract showing all modifier types:**

```solidity
contract FunctionModifiers {
    uint256 public value = 100;

    // Pure: doesn't read or modify state
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }

    // View: reads state but doesn't modify it
    function getValue() public view returns (uint256) {
        return value;
    }

    // Payable: can receive Ether
    function deposit() public payable {
        // Function can receive Ether
    }

    // Default: can modify state
    function setValue(uint256 newValue) public {
        value = newValue;
    }
}
```

---

## 5. Mappings

Mappings are key-value stores, similar to hash tables or dictionaries in other programming languages. They provide an efficient way to store and retrieve data using unique keys.

**Syntax:**

```solidity
mapping(KeyType => ValueType) public mappingName;
```

**Key Characteristics:**

-   **Storage only**: Mappings can only exist in storage (state variables)
-   **Default values**: All possible keys map to the default value initially (0, false, "", etc.)
-   **Efficient lookup**: Gas-efficient for direct key access
-   **Virtual size**: Every possible key exists conceptually with default values

**Critical Limitations:**

-   **No length property**: `mapping.length` does not exist
-   **No iteration**: You cannot loop through mappings directly
-   **No key enumeration**: Cannot get a list of all keys that have been set
-   **Cannot delete**: You can only reset values to default, not truly delete keys
-   **Cannot check existence**: No way to tell if a key was explicitly set or just has default value

**Working with mapping limitations:**

```solidity
contract MappingLimitations {
    mapping(address => uint256) public balances;
    mapping(address => bool) public hasAccount;  // Track existence separately

    // Must manually track count - mappings have no length!
    uint256 public userCount;
    address[] public userList;  // Track keys separately for iteration

    function addUser(uint256 amount) public {
        if (!hasAccount[msg.sender]) {  // Check existence flag
            hasAccount[msg.sender] = true;
            userCount++;
            userList.push(msg.sender);
        }
        balances[msg.sender] = amount;
    }

    function removeUser() public {
        if (hasAccount[msg.sender]) {
            hasAccount[msg.sender] = false;
            balances[msg.sender] = 0;  // Reset to default
            userCount--;
            // Note: userList still contains the address (cleanup needed)
        }
    }
}
```

**Common Use Cases:**

-   Storing balances: `mapping(address => uint256) balances`
-   Access control: `mapping(address => bool) authorized`
-   Data relationships: `mapping(uint256 => string) names`

---

## 🛠️ Lab Practice: Putting It All Together

Read and try to solve the problem on your own without looking at the solution first. Compare your solution with the provided one afterwards.

### Problem

**Context**

You are given a base contract Counter (from the Quick Start lesson) with:

-   uint256 public count;
-   constructor(uint256 initial)
-   function increment() public

**Task**

1.  Build a new contract **DepositCounter** in contracts/DepositCounter.sol that:

    -   Inherits from Counter
    -   Accepts ETH deposits
    -   Tracks each sender’s cumulative deposit
    -   Marks whether an address has ever deposited
    -   Track the total number of unique depositors

2.  Create a test script in test/depositCounterTest.js that:

    -   Should test the number of unique depositors via count()
        -   count() should start at 0.
        -   After the first deposit from addr1, count() should be 1.
        -   A second deposit from the same address should not increase count().
        -   A deposit from a different address (addr2) should increase count() to 2.
    -   Should test the deposit balance per address via deposits(addr)
        -   deposits(addr1) should start at 0.
        -   After depositing 1 ether, deposits(addr1) should be 1 ether.
        -   A second deposit of 0.5 ether should increase deposits(addr1) to 1.5 ether.

---

### Solution

This lab is an extension of the "Quick Start with Solidity" lesson. You will create a deposit counter contract that receives ETH deposits and tracks each sender's deposit balance by combining all the concepts learned so far.

-   **Create the contract**

    Create contracts/DepositCounter.sol:

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;
    import "./Counter.sol";
    contract DepositCounter is Counter {
        // Track deposits by address
        mapping(address => uint256) public deposits;
        // Track if address has ever deposited
        mapping(address => bool) public hasAccount;
        // Constructor calls parent constructor
        constructor() Counter(0) {}
        // Deposit ETH and increment counter
        function deposit() public payable {
            require(msg.value > 0, "Must send ETH");

            // Increment the counter for unique depositors
            if (hasAccount[msg.sender] == false) {
                increment();
                hasAccount[msg.sender] = true;
            }
            // Record who sent how much
            deposits[msg.sender] += msg.value;

        }
        // Check if address has ever deposited
        function isDepositor(address addr) public view returns (bool) {
            return hasAccount[addr];
        }
        // Check contract's ETH balance
        function getBalance() public view returns (uint256) {
            return address(this).balance;
        }
    }
    ```

-   **Create the test script**
    Create test/depositCounterTest.js:

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
            // Initially, addr1 has no account
            expect(await depositCounter.count()).to.equal(0n);

            // After deposit, addr1 has an account
            await depositCounter.connect(addr1).deposit({
                value: ethers.parseEther("1.0"),
            });
            expect(await depositCounter.count()).to.equal(1n);

            // Deposit again, should still be 1 unique depositor
            await depositCounter.connect(addr1).deposit({
                value: ethers.parseEther("0.5"),
            });
            expect(await depositCounter.count()).to.equal(1n);

            // After addr2 deposits, count should be 2
            await depositCounter.connect(addr2).deposit({
                value: ethers.parseEther("0.5"),
            });
            expect(await depositCounter.count()).to.equal(2n);
        });

        it("Should track balance correctly", async function () {
            // Initially, addr1 has no balance
            expect(await depositCounter.deposits(addr1.address)).to.equal(0n);

            // After deposit, addr1 has balance
            await depositCounter.connect(addr1).deposit({
                value: ethers.parseEther("1.0"),
            });
            expect(await depositCounter.deposits(addr1.address)).to.equal(
                ethers.parseEther("1.0")
            );

            // Deposit again, should accumulate
            await depositCounter.connect(addr1).deposit({
                value: ethers.parseEther("0.5"),
            });
            expect(await depositCounter.deposits(addr1.address)).to.equal(
                ethers.parseEther("1.5")
            );
        });
    });
    ```

-   **Run the test**

    ```bash
    hh test
    ```

-   **Expected output**

    You should see all tests pass:

    ```bash
    DepositCounter
        ✔ Should count depositor correctly
        ✔ Should track balance correctly
    2 passing (456ms)
    ```
