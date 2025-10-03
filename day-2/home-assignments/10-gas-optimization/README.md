# Gas Optimization

## 1. Core Principles of Gas Optimization

Gas optimization is really about **paying less for data**.  
You pay gas mainly for two things:

1. **State (storage) writes and reads**

    - Writing to storage (`SSTORE`) is the most expensive thing you can do.
    - Reading from storage (`SLOAD`) also costs, but less.

2. **Copies of data**
    - Moving data between `calldata → memory → storage` or across contracts costs gas.

👉 In short: **write less, move less, touch fewer slots.**

### How to Apply This

-   Use **calldata** for function inputs you don’t need to modify.
-   Cache values from storage in **local variables** instead of re-reading in a loop.
-   Minimize **storage writes** (batch updates, avoid overwrite patterns).
-   **Pack variables** into the same storage slot when possible.
-   Use **constant** or **immutable** instead of storage when values never change.
-   Keep loops small; avoid unnecessary memory expansion and external calls.

> Everything—SSTORE/SLOAD costs, slot packing, calldata vs memory, loop design—comes back to one thing: **optimize where data lives and how far it travels.**

### Example: Data Locations in Practice

```solidity
contract DataLocationExample {
    string private storedName;  // STORAGE by default (SSTORE/SLOAD)

    function processName(string calldata name) external {
        // Use CALldata for read-only parameters - cheapest
        bytes32 hash = keccak256(bytes(name));  // ~cheap, no storage touched

        // Copy to MEMORY only when needed for manipulation
        string memory tempName = name;  // calldata → memory copy (costly if big)
        // ... manipulate tempName
    }

    function setName(string memory name) public {
        // MEMORY → STORAGE copy
        // Expensive: ~20,000 gas if writing zero → non-zero
        //            ~5,000 gas if updating an already used slot
        storedName = name;
    }
}
```

### Gas Costs (Ballpark, Post-London)

-   **SSTORE (write to storage slot):**

    -   zero → non-zero: ~20,000 gas
    -   non-zero → non-zero (same tx, “dirty” slot): ~5,000 gas
    -   write same value (no change): ~100 gas

-   **SLOAD (read storage):**

    -   first read of a slot = **cold** ≈ 2,100 + 100 gas
    -   subsequent reads = **warm** ≈ 100 gas

-   **Memory:** cheaper than storage, but not free.

    -   ~3 gas/word plus an expansion cost as memory grows.
    -   Big arrays/copies can get expensive.

-   **Constants/Immutables:** stored in bytecode/code storage → **no SLOAD cost** at runtime.

---

### Quick Rules of Thumb

-   Reads cost far less than writes.
-   Storage charges **per slot** (32 bytes), not per field.
-   Use **calldata directly** when possible—don’t copy to memory if you don’t need to.

## 2. Gas Costs by Function Type (pure, view, state-changing)

Different function types and patterns can have dramatically different gas costs particularly when it comes interacting with state variables(storage).

**Gas cost hierarchy (on-chain calls):**

1. **Pure functions** - cheapest (no storage access, no state reads)

    - Example: Mathematical calculations, string manipulations
    - Gas cost: ~200-500 gas

2. **View functions** - low cost (reads storage but doesn't modify)

    - Example: `balanceOf()`, `count()`, getter functions
    - Gas cost: ~200-2,000 gas (depends on storage complexity)

3. **State-changing functions** - highest cost (modifies storage)
    - Example: `transfer()`, `increment()`, setter functions
    - Gas cost: 20,000-50,000+ gas (depends on operations)

**Key insight**: External calls to view/pure functions are **free**, but contract-to-contract calls consume gas.

---

## 🛠️ Lab: Gas Costs by Function Type (pure, view, state-changing)

**Understanding Contract Interaction Costs**: External calls to view/pure functions are free, but contract-to-contract calls cost gas. The Counter contract includes all function types: pure, view, and state-changing.

### Create `test/functionCallTest.js`

```js
describe("Contract Function Call Costs", () => {
    it("Test pure functions (no storage access)", async () => {
        const factory = await ethers.getContractFactory("Counter");
        const counter = await factory.deploy(10);

        // External calls are free
        const addResult = await counter.addNumbers(5, 3);
        const squareResult = await counter.calculateSquare(7);
        console.log(
            `Pure functions - Add: ${addResult}, Square: ${squareResult} - FREE`
        );
    });

    it("Test view functions (read storage)", async () => {
        const factory = await ethers.getContractFactory("Counter");
        const counter = await factory.deploy(10);

        // External view calls are free
        const count1 = await counter.getCount();
        const count2 = await counter.count();
        console.log(
            `View functions - getCount: ${count1}, count: ${count2} - FREE`
        );
    });

    it("Test state-changing functions (modify storage)", async () => {
        const factory = await ethers.getContractFactory("Counter");
        const counter = await factory.deploy(10);

        // State changes always cost gas
        const tx = await counter.increment();
        const receipt = await tx.wait();
        console.log(`State change gas used: ${receipt.gasUsed}`);

        const newCount = await counter.count();
        console.log(`Count after increment: ${newCount}`);
    });
});
```

### Run the tests:

```bash
hh test test/functionCallTest.js
```

**Expected results:**

-   **Pure functions**: Free externally, ~200-500 gas on-chain
-   **View functions**: Free externally, ~200-2,000 gas on-chain
-   **State-changing functions**: ~26,000-30,000 gas for simple storage updates

**Key takeaway**: The theoretical gas cost hierarchy from Section 8 is validated through practical testing.

---

## 3. EVM Word Size and Its Impact on Gas

The EVM uses a word size of **32 bytes** (256 bits). This means the cost of storing and processing data is based on chunks of 32 bytes.

In Solidity, using a smaller type can be more expensive if its size is not in multiples of 32 bytes. This is because the EVM has to run extra operations to transform a 1-byte type (uint8) into a 32-byte type (uint256) before it can perform operations.

---

## 🛠️ Lab: EVM Word Size and Its Impact on Gas

-   **Create `contracts/WordSizeExample.sol`:**

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    contract WordSizeExample {
        uint8 public small;    // 1 byte
        uint256 public large;  // 32 bytes

        function setSmall(uint8 _val) public {
            small = _val;
        }

        function setLarge(uint256 _val) public {
            large = _val;
        }
    }
    ```

-   **Create `test/wordSizeTest.js`:**

    ```js
    const { expect } = require("chai");
    const { ethers } = require("hardhat");

    describe("WordSizeExample", function () {
        let contract;

        beforeEach(async function () {
            const Example = await ethers.getContractFactory("WordSizeExample");
            contract = await Example.deploy();
            await contract.deployed();
        });

        it("Gas comparison: setSmall vs setLarge", async function () {
            const txSmall = await contract.setSmall(5);
            const rcSmall = await txSmall.wait();
            console.log("Gas used for setSmall:", rcSmall.gasUsed.toString());

            const txLarge = await contract.setLarge(5);
            const rcLarge = await txLarge.wait();
            console.log("Gas used for setLarge:", rcLarge.gasUsed.toString());

            expect(rcSmall.gasUsed).to.be.gt(rcLarge.gasUsed);
        });
    });
    ```

-   **Run the test:**

    Even though `uint8` is smaller, it costs more gas due to EVM word size alignment.

    ```bash
    hh test test/wordSizeTest.js

    # Expected results:
    # Gas used for setSmall: 21446
    # Gas used for setLarge: 21314
    ```

---

## 4. Storage Slot Packing and State Variable Ordering

Storage operations are the most expensive part of smart contract execution. Reordering variables and using smaller types can significantly reduce gas costs.

```solidity
// ❌ Expensive: Large types prevent packing
contract Inefficient {
    uint8 a;    // Slot 0
    uint256 b;  // Slot 1 (can't pack with uint8)
    uint8 c;    // Slot 2 (can't pack with uint256)
    // Total: 3 storage slots = ~60,000 gas for writes
}

// ✅ Efficient: Group small types together
contract Efficient {
    uint8 a;   // }
    uint8 c;   // } Slot 0: All pack together
    uint256 b; // Slot 1: Large type separate
    // Total: 2 storage slots = ~40,000 gas for writes
}
```

---

## 🛠️ Lab: Storage Slot Packing and State Variable Ordering

**Understanding Storage Slot Packing**: Solidity packs variables into 32-byte storage slots. Multiple small variables can share a slot, dramatically reducing gas costs.

-   **Create storage efficiency contracts**

    Create `contracts/StorageTest.sol`:

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.8;

    // ❌ Inefficient: Large types prevent packing
    contract Inefficient {
        uint8 a;    // Slot 0
        uint256 b;  // Slot 1 (can't pack with uint8)
        uint8 c;    // Slot 2 (can't pack with uint256)

        function setValues(uint8 _a, uint256 _b, uint8 _c) public {
            a = _a;  // 20,000 gas (new storage slot)
            b = _b;  // 20,000 gas (new storage slot)
            c = _c;  // 20,000 gas (new storage slot)
        }
    }

    // ✅ Efficient: Group small types together
    contract Efficient {
        uint8 a;    // Slot 0: byte 0
        uint8 c;    // Slot 0: byte 1 (packed together)
        uint256 b;  // Slot 1: separate slot for large type

        function setValues(uint8 _a, uint256 _b, uint8 _c) public {
            a = _a;  // 20,000 gas (new storage slot)
            c = _c;  // 5,000 gas (update existing slot)
            b = _b;  // 20,000 gas (new storage slot)
        }
    }
    ```

-   **Create storage efficiency test**

    Create `test/storageEfficiencyTest.js`

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

-   **Run the test**

    ```bash
    hh test test/storageEfficiencyTest.js
    ```

-   **Expected results:**

    -   **Inefficient**: ~60,000 gas (3 storage slots × 20,000 gas each)
    -   **Efficient**: ~45,000 gas (2 storage slots: 1 packed + 1 separate)
    -   **Savings**: ~25% gas reduction through variable reordering

**Key takeaway**: Proper variable ordering and type selection can cut storage costs in half.

---

## 5. Gas Costs of Function Visibility (public vs external)

Function visibility affects both deployment costs and execution gas. Choosing the right visibility can reduce contract size and gas consumption.

**Visibility types and gas impact:**

1. **External vs Public** - External functions are cheaper for external calls

    - `external`: Parameters stored in calldata (cheaper)
    - `public`: Parameters copied to memory (more expensive)

2. **Private/Internal** - Reduce deployment gas
    - No external interface generation
    - Smaller contract bytecode
    - (Not demonstrated in this lab - focuses on external vs public)

```solidity
// ❌ Expensive: Public function copies calldata to memory
contract Inefficient {
    function processData(bytes memory data) public pure returns (uint256) {
        return data.length; // Memory copy costs gas
    }
}

// ✅ Efficient: External function uses calldata directly
contract Efficient {
    function processData(bytes calldata data) external pure returns (uint256) {
        return data.length; // Direct calldata access
    }
}
```

---

## 🛠️ Lab: Gas Costs of Function Visibility (public vs external)

**Understanding Visibility Impact**: External functions are more gas-efficient than public functions for external calls, and private/internal functions reduce deployment costs.

### Create storage visibility contracts

Create `contracts/VisibilityTest.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// ❌ Less efficient: Public functions copy to memory
contract PublicContract {
    function processArray(uint256[] memory arr) public pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum;
    }
}

// ✅ More efficient: External functions use calldata
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

### Create `test/visibilityTest.js`

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

### Run the test:

```bash
hh test test/visibilityTest.js
```

**Expected results:**

-   **Public function**: Higher gas due to memory copying
-   **External function**: Lower gas due to calldata usage
-   **Savings**: 10-20% gas reduction for array processing

**Key takeaway**: Use `external` with `calldata` for functions only called externally to reduce execution gas costs.
