# Quick Start with Solidity

This lesson will walk you through the essential steps to get started with writing, compiling, testing, and deploying smart contracts using Solidity and Hardhat.

## 1. Typical Smart Contract Development Workflow

Smart contract development is different from traditional software because **deployed code cannot be changed**. Once it’s on the blockchain, it’s permanent. This means careful testing and staged deployment are critical.

A typical workflow looks like this:

### Step 1: Write the Contract

-   Write Solidity code in the `contracts/` directory.
-   Use good practices: comments, clear naming, and modularity.

### Step 2: Compile

-   Run `npx hardhat compile`.
-   Verify the **bytecode** and **ABI** outputs in the `artifacts/` folder.
-   Fix any compiler warnings before moving on.

### Step 3: Local Testing

-   Write automated tests in the `test/` directory (using Mocha + Chai).
-   Run `npx hardhat test` to check that contract logic behaves as expected.
-   Use the **Hardhat console** to experiment interactively.

### Step 4: Deployment Script (Local/Standalone Network)

-   Write deployment scripts in the `scripts/` directory.
-   Run them against the **Hardhat Network (standalone)** to simulate deployment.
-   Example:
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```

In the following sections we will cover each of these steps in more detail.

---

## 2. Writing a Simple Contract

Let's start with a simple but complete example that demonstrates the essential components of a Solidity smart contract:

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

Let's break down this simple counter contract line by line:

-   **1. License Identifier**

    ```solidity
    // SPDX-License-Identifier: MIT
    ```

    -   **Purpose**: Specifies the software license for the code
    -   **Why it matters**: Required by the compiler to avoid warnings
    -   **MIT License**: A permissive open-source license commonly used

-   **2. Pragma Directive**

    ```solidity
    pragma solidity ^0.8.20;
    ```

    -   **Purpose**: Tells the compiler which version of Solidity to use
    -   **^0.8.20**: Compatible with version 0.8.20 and newer versions within 0.8.x
    -   **Why important**: Different versions have different features and security improvements

-   **Why 0.8.20 in this course**: Although not the latest version, we use 0.8.20 for practical reasons: it's easier to find online materials and documentation for established versions, and it's the same version used by OpenZeppelin's ERC20 implementation, making it a proven industry standard

-   **3. Contract Declaration**

    ```solidity
    contract Counter {
    ```

    -   **Purpose**: Defines a new smart contract (similar to a class in other languages)
    -   **Counter**: The name of our contract
    -   **Scope**: Everything between the braces `{}` belongs to this contract

-   **4. State Variable**

    ```solidity
    uint256 public count;
    ```

    -   **uint256**: An unsigned integer (no negative numbers) that can hold values from 0 to 2^256-1
    -   **public**: Creates an automatic getter function so anyone can read this value
    -   **count**: The variable name that stores our counter value
    -   **Storage**: This data is permanently stored on the blockchain

-   **5. Constructor**

    ```solidity
    constructor(uint256 initial) {
        count = initial;
    }
    ```

    -   **Purpose**: Special function that runs only once when the contract is deployed
    -   **Parameters**: Takes an `initial` value to set the starting count
    -   **Initialization**: Sets our `count` variable to the provided initial value

-   **6. State-Changing Function**

    ```solidity
    function increment() public {
        count += 1;
    }
    ```

    -   **function**: Keyword to declare a function
    -   **increment**: Function name
    -   **public**: Anyone can call this function
    -   **Effect**: Increases the count by 1 (costs gas because it modifies blockchain state)

-   **7. View Function**

    ```solidity
    function get() public view returns (uint256) {
        return count;
    }
    ```

    -   **view**: This function only reads data, doesn't modify state
    -   **returns (uint256)**: Specifies that this function returns an unsigned integer
    -   **Free to call**: Reading data doesn't cost gas when called externally
    -   **Note**: The `public count` already creates a getter, so this function is redundant but shown for learning

---

## 🛠️ Lab Practice: Basic Contract

-   **Install project dependencies**

    ```bash
    cd /workspace/day-1/04-quick-start
    npm i
    ```

-   **Create a `contracts` directory**

    This directory will be used to store all contract files.

    ```bash
    mkdir contracts
    ```

-   **Create a new Solidity file**

    Create a file named `Counter.sol` in the `contracts` directory.

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

## 3. Compiling the Contract

Think of compilation like translating a book from English to another language. Your computer can't read Solidity directly - it needs the code translated into machine language.

**Why compile?**

When you write Solidity code, you're writing for humans to understand. But the blockchain computer (called the EVM) only speaks in numbers and machine code. Compilation is the translation process.

**What do you get after compilation?**

The compiler gives you two important things:

1. **Bytecode** - The translated version of your contract that the blockchain can run
2. **ABI** - A description that tells other programs what your contract can do

**Understanding the ABI (Application Binary Interface)**

The ABI is a description of your contract's interface. It tells other programs:

-   What functions your contract has
-   What parameters each function needs
-   What each function returns

Here's what an ABI looks like for our Counter contract:

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

**Reading the ABI:**

-   **constructor**: Requires one `uint256` parameter called `initial` to create the contract
-   **count**: A function that returns a `uint256`, doesn't modify state (`view`)
-   **increment**: A function with no inputs or outputs, modifies contract state
-   **get**: A function that returns a `uint256` without modifying state (`view`)

**Why the ABI matters:**

The ABI enables external programs to interact with your contract. Without it, applications wouldn't know which functions exist or how to call them properly.

---

## 🛠️ Lab Practice: Contract Compilation

**Understanding the compilation process**: Learn how to compile Solidity contracts and examine the outputs.

-   **Verify Compiler Version**

    Open `hardhat.config.js` and ensure it specifies the same version as your contract pragma: 0.8.20.

    ```js
    require("@nomicfoundation/hardhat-require");

    module.exports = {
        solidity: {
            version: "0.8.20",
        },
    };
    ```

-   **Compile the contract**

    ```bash
    hh compile
     # Compiled 1 Solidity file successfully (evm target: paris).
    ```

-   **Examine compilation outputs**

    ```bash
     # View the artifacts directory structure
     ls -la artifacts/contracts/Counter.sol/

     # drwxr-xr-x 2 vscode vscode 4096 Sep 26 08:19 .
     # drwxr-xr-x 3 vscode vscode 4096 Sep 26 08:19 ..
     # -rw-r--r-- 1 vscode vscode  105 Sep 26 08:19 Counter.dbg.json
     # -rw-r--r-- 1 vscode vscode 3000 Sep 26 08:19 Counter.json


     # View the compiled bytecode and ABI
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

### Quiz

Compare the number of functions in Counter.sol vs Counter.json. Why are they different?

---

## 4. Deploying a Contract

Once your contract compiles and passes tests, the next step is deployment. Deployment means broadcasting your contract’s bytecode to a blockchain network so that it becomes a live smart contract with an address.

### Key Concepts

-   **Deployment Script**  
    Deployment is performed through a script that requests the blockchain to create a new contract. The script specifies:

    -   The contract’s bytecode (from compilation).
    -   The Application Binary Interface (ABI).
    -   Any constructor arguments.
    -   The account that pays the gas fees.

-   **Contract Address**  
    Every deployed contract has a unique address on the blockchain. This address is used to interact with the contract once it is live.

-   **Transaction Cost**  
    Deploying a contract is a transaction, so it consumes gas. On local networks like Hardhat, gas is free because accounts are pre-funded. On public networks, deployment costs real ETH.

-   **Deployment Targets**
    -   **Local Development Network**: Fast, safe, and free. Used for iteration.
    -   **Public Testnet**: Mimics mainnet conditions without real risk.
    -   **Mainnet**: The live Ethereum network where real value is at stake.

---

## 🛠️ Lab Practice: Deploying the Contract

Now let’s put theory into practice by deploying the `Counter` contract to a local Hardhat Network.

_NOTE: We will not cover testnet deployment in this quick start but will explore it in later modules. For now, just know that deploying to a public testnet involves similar steps but requires configuring network settings and using a wallet with testnet ETH._

1. **Start the Hardhat Node**

    ```bash
    hh node
    ```

2. **Open a new terminal window**

    Keep the node running in the first terminal and run subsequent commands in the new terminal.

3. **Create a `scripts` directory**

    ```bash
    cd /workspace/day-1/04-quick-start
    mkdir scripts
    ```

4. **Write the deployment script**

    Create `scripts/deploy.js` with the following content:

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

5. **Run the deployment script**

    The the following command in the new terminal:

    ```bash

    hh run scripts/deploy.js --network localhost

     # output:
     # Counter deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
    ```

    Take note of the address printed in the output. This is where your contract is deployed on the local Hardhat Network.

---

## 5. Interacting with the Deployed Contract

Deploying a contract gives it a permanent presence on the blockchain, but to use it you need to interact with it. Before you can start calling functions or reading state, there are a few basic pieces of information you must have.

### Basic Requirements

1. **Contract Address**

    - Every deployed contract has a unique address on the blockchain.
    - This is the "location" where your contract lives, similar to a URL for a website.
    - Without the address, you cannot reach the contract.

2. **ABI (Application Binary Interface)**

    - The ABI describes the functions, parameters, and events of the contract.
    - Think of it as the contract’s menu: it tells you what you can call and how.
    - The ABI is generated when you compile the contract (in the `artifacts` folder).

3. **Network**

    - You must know which blockchain network the contract is deployed on (local Hardhat, Sepolia testnet, or mainnet).
    - A contract address is only valid on the network where it was deployed.
    - Interacting with the wrong network will result in "contract not found" errors.

4. **Account (Signer)**
    - To read from the contract, only a provider is needed.
    - To write (send transactions), you need a signer — an account with the private key to authorize the transaction and pay gas fees.
    - On local Hardhat, accounts are pre-funded. On testnet/mainnet, you need real ETH or test ETH.

---

## 🛠️ Lab Practice: Contract Interaction with Hardhat Console

We will now interact with the `Counter` contract that was deployed in the previous lab.

1. **Open Hardhat Console**

    Make sure your Hardhat node is still running, then open a new terminal:

    ```bash
    hh console --network localhost
    ```

    This gives you an interactive environment connected to the local blockchain.

2. **Attach to the Deployed Contract**

    Replace the address below with the actual address printed during deployment:

    ```javascript
    > const Counter = await ethers.getContractFactory("Counter");
    > const counter = await Counter.attach(
        "replace-with-your-deployed-contract-address"
    );
    ```

    Now `counter` represents the deployed contract instance.

3. **Read the Current Count**

    ```javascript
    await counter.count();

    //output:
    // 42n
    ```

    Expected result: the number you set in the constructor (e.g., `42`).

4. **Increment the Count**

    ```javascript
    tx = await counter.increment();

    //output:
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

    This sends a transaction. Wait for confirmation.

    ```javascript
    await tx.wait();
    //output:
    //ContractTransactionReceipt {
    //  ...
    //  transactionHash: '0xa6da0147e111360546d66...',
    //  ...
    //  gasUsed: 26445n,
    //  ...
    //  }
    ```

5. **Verify the New Count**

    ```javascript
    await counter.count();
    // 43n
    ```

    Expected result: the previous value plus one.

## 🛠️ Lab Practice: Contract Interaction with JavaScript

While the Hardhat console is useful for quick experimentation, in real projects you will typically interact with contracts through JavaScript scripts. Let’s write a simple script to read and update the `Counter` contract.

1. **Create the Script File**
   Inside the `scripts` directory, create a file named `interact.js`:

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

2. **Run the Script**
   Make sure your Hardhat node is running in one terminal and run the following command in another terminal:

    ```bash
    hh run scripts/interact.js --network localhost

     ## output:
     # Current count: 44
     # Updated count: 45
    ```

---

## 6. Testing a Contract

So far, you have deployed a contract and interacted with it manually through the console and JavaScript scripts. This works, but it’s already becoming clear how **cumbersome** the process is:

-   You need to start a local node.
-   Run a deployment script.
-   Copy and paste the contract address.
-   Manually call functions and check results.

For a simple counter, this is still manageable. But for more complex contracts, repeating these steps quickly becomes **time-consuming and error-prone**.

This is exactly why automated testing is essential. By writing test scripts, you can:

-   Automatically deploy fresh contract instances for each test.
-   Run multiple checks in seconds.
-   Ensure your contract behaves consistently every time.

Hardhat provides a testing framework that creates temporary blockchain environments for each test, eliminating manual verification and ensuring reproducible results. Tests automatically deploy fresh contract instances and use assertions to verify expected behavior.

Let's examine the structure of a proper test script, similar to how we analyzed contract anatomy:

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

**Understanding each component:**

-   **1. Import Statements**

    ```javascript
    const { expect } = require("chai");
    const { ethers } = require("hardhat");
    ```

    -   **chai**: Assertion library for making test expectations
    -   **ethers**: Library for interacting with Ethereum contracts
    -   **hardhat**: Development environment providing testing utilities

-   **2. Test Suite Declaration**

    ```javascript
    describe("Counter", function () {
    ```

    -   **describe()**: Groups related tests together
    -   **"Counter"**: Descriptive name for the test suite
    -   **Function scope**: Contains all tests for this contract

-   **3. Test Variables**

    ```javascript
    let counter;
    let owner;
    ```

    -   **Shared variables**: Available to all tests in the suite
    -   **let declaration**: Allows reassignment in setup functions
    -   **Scope**: Accessible within the describe block

-   **4. Setup Hook**

    ```javascript
    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const Counter = await ethers.getContractFactory("Counter");
        counter = await Counter.deploy(42);
        await counter.waitForDeployment();
    });
    ```

    -   **beforeEach()**: Runs before each individual test
    -   **Fresh instance**: Creates new contract for every test
    -   **Test isolation**: Ensures tests don't affect each other
    -   **Clean state**: Each test starts with known initial conditions

-   **5. Individual Tests**

    ```javascript
    it("Should set the initial count correctly", async function () {
        expect(await counter.count()).to.equal(42);
    });
    ```

    -   **it()**: Defines a single test case
    -   **Descriptive name**: Explains what the test verifies
    -   **expect()**: Makes assertions about expected behavior
    -   **Async/await**: Handles blockchain interactions properly

---

## 🛠️ Lab Practice: Testing the Contract

NOTE: This lab does not require starting a Hardhat node. If you have one running, you can stop it.

-   **Create a `test` directory**

    This directory will be used to store the test scripts

    ```bash
    mkdir test
    ```

-   **Install `chai` package**

    This package will be used for contract testing.

    ```bash
    npm i -D chai
    ```

-   **Create the Test File**

    Create `test/test-counter.js`:

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

-   **Run the Tests**

    ```bash
    hh test test/test-counter.js

     # output:
     # Counter
     #   ✓ Should set the initial count correctly (123ms)
     #   ✓ Should increment the count by 1 (72ms)
     #
     # 2 passing (303ms)
    ```

-   **Task completed ✅**
