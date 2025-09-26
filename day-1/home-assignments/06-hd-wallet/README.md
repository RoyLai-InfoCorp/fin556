# Hierarchical Deterministic (HD) Wallets

## 1. From Keys to Wallets

We have learnt that an Ethereum account is represented by an address derived from a private key. In practice, however, users often need many addresses — for privacy, account separation, or interacting with different apps. Since private keys are cryptic, managing dozens of unrelated private keys would be cumbersome and risky. To solve this, modern wallets use a system called Hierarchical Deterministic (HD) wallets, which can generate and manage unlimited addresses from a single master seed.

### Core Concepts

HD Wallets use cryptographic principles to generate multiple addresses from a single seed phrase (mnemonic). This system provides:

-   **Deterministic Generation**: Same seed always produces same address sequence
-   **Infinite Addresses**: Can generate unlimited addresses from one seed
-   **Backup Simplicity**: One mnemonic backs up entire wallet
-   **Cross-Wallet Compatibility**: Standard ensures wallet interoperability

### Mnemonic Seed Phrases

Typically consist of 12 or 24 words that encode the master seed for address generation. Each word comes from a standardized list of 2048 words (BIP39 standard).

---

## 🛠️ Lab Practice: Using Mnemonic Phrase

In this lab, we will learn how to configure HD wallets in Hardhat Network.

Hardhat uses a well-known default mnemonic for its local network:

```txt
test test test test test test test test test test test junk
```

We will prove that this is indeed the default mnemonic by comparing the addresses generated from this mnemonic with the accounts provided by Hardhat Network.

-   **Install packages**

    ```bash
    cd /workspace/day-1/home-assignments/06-hd-wallet
    npm i
    ```

-   **Startup Hardhat Standalone Network**

    If the node is already running from previous lab, press `Ctrl+C` to stop it first before starting again.

    ```bash
     hh node

     # Output:

     # Accounts
     # ========
     #
     # WARNING: These accounts, and their private keys, are publicly known.
     # Any funds sent to them on Mainnet or any other live network WILL BE  # LOST.
     #
     # Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
     # Private Key:  # 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    ```

-   **Set Mnemonic Phrase for Hardhat Network**

    Open hardhat.config.js and add the mnemonic "test test test test test test test test test test test junk"

    ```javascript
    module.exports = {
        solidity: "0.8.18",
        networks: {
            localhost: {
                url: "http://localhost:8545",
                accounts: {
                    mnemonic:
                        "test test test test test test test test test test test junk",
                },
            },
        },
    };
    ```

-   **Restart Hardhat Node**

    Type `Ctrl+C` to stop the running node, then restart it:

    ```bash
    hh node

     # Output:

     # Accounts
     # ========
     #
     # WARNING: These accounts, and their private keys, are publicly known.
     # Any funds sent to them on Mainnet or any other live network WILL BE  # LOST.
     #
     # Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
     # Private Key:  # 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
    ```

    The addresses generated are the same as before. This confirms that Hardhat uses "test test test test test test test test test test test junk" as the mnemonic for its local network.

---

## 2. Derivation Paths

Addresses are generated using derivation paths like `m/44'/60'/0'/0` where:

-   `m`: Master key
-   `44'`: Purpose (HD wallets)
-   `60'`: Coin type (Ethereum)
-   `0'`: Account index
-   `0`: Change index (external addresses)

Understanding derivation paths is crucial when:

-   Migrating between wallet applications
-   Recovering wallets with custom paths
-   Integrating with hardware wallets

---

## 🛠️ Lab Practice: Generating Mnemonic Phrase

-   **Open Hardhat Console**

    In a new terminal window, navigate to the project directory and run:

    ```bash
    hh console
    ```

    NOTE: No need to connect to localhost since we are only using ethers.js library.

-   **Generate New Mnemonic Phrase**

    In the Hardhat console, run the following commands line by line after the `>` prompt to generate a new mnemonic phrase:

    ```js
    > const { ethers } = require("ethers");
    > mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;

    // Sample Output:
    // 'hill drive sure whip bargain horn raven sunny claw example merit income'
    ```

-   **Generate Accounts**

    Use the generated mnemonic to derive the first three Ethereum accounts using the standard derivation path `m/44'/60'/0'/0/n` where `n` is the account index (0, 1, 2).

    ```js

    // Derive the first account (Ethereum derivation path: m/44'/60'/0'/0/0)

    > const wallet0 = ethers.HDNodeWallet.fromPhrase(
        mnemonic,
        null,
        "m/44'/60'/0'/0/0"
    );
    > wallet0.address

    // Sample Output:
    // '0x18b2Ba693Fc01A6e7e6031e5a31936AC8ED8Aef5'

    // ------------------------------------------------------------------

    // Derive the second account (m/44'/60'/0'/0/1)

    > const wallet1 = ethers.HDNodeWallet.fromPhrase(
        mnemonic,
        null,
        "m/44'/60'/0'/0/1"
    );
    > wallet1.address

    // Sample Output:
    // '0x1B1256AD2F06d73F44C211660124c3d1ad706369'

    // ------------------------------------------------------------------

    // Derive the third account (m/44'/60'/0'/0/2)

    > const wallet2 = ethers.HDNodeWallet.fromPhrase(
        mnemonic,
        null,
        "m/44'/60'/0'/0/2"
    );
    > wallet2.address

    // Sample Output:
    //'0x56EDa570299e4e28B8dA016E1eFABc2FB8872A4f'

    ```

    Record the generated mnemonic and the first three account addresses.

-   **Set the new mnemonic in hardhat.config.js**
    Open hardhat.config.js and update the mnemonic in the localhost network configuration:

    ```javascript
    module.exports = {
        solidity: "0.8.18",
        networks: {
            localhost: {
                url: "http://localhost:8545",
                accounts: {
                    mnemonic:
                        "Replace with your newly generated mnemonic phrase here",
                },
            },
        },
    };
    ```

-   **Restart Hardhat Node**
    Type `Ctrl+C` to stop the running node, then restart it:

    ```bash
    hh node

     # Output:

     # Accounts
     # ========
     #
     # WARNING: These accounts, and their private keys, are publicly known.
     # Any funds sent to them on Mainnet or any other live network WILL BE  # LOST.
     #
     # Account #0: 0x... (10000 ETH)
     # Private Key:  # 0x...
    ```

    This shows that the accounts have changed, indicating that the new mnemonic is being used.

    Compare the addresses with those generated in the Hardhat Console to verify they match.

---

## 3. Securing Server-Side Secrets

We rarely need to use private keys or mnemonics on the server-side since most normal wallet operations happen on client-side. However, there is one common scenario where server-side access is needed: when using a wallet to sign transactions for automated tasks like contract deployment or scheduled transactions.

The mnemonic we generated from the Lab Practice is sensitive information that should not be stored as plain text in the config file or hard-coded in your code base.

-   **Single Point of Failure**: Compromised mnemonic exposes all derived addresses
-   **Backup Critical**: Loss of mnemonic means loss of all funds
-   **Storage Best Practices**: Never store digitally, use secure physical storage

In the next lab, we will learn how to use the `dotenv` package to securely manage environment variables like mnemonics.

**🛠️ Lab Practice: Section 6 - dotenv**

---

## 🛠️ Lab Practice: dotenv

-   **Install dotenv package**

    ```bash
    npm i dotenv
    ```

-   **Create .env file**
    Create a file named `.env` in the root directory of your project and add the following content:

    ```env
    MNEMONIC="your mnemonic phrase here"
    ```

    Replace `your mnemonic phrase here` with the mnemonic you generated earlier.

-   **Update hardhat.config.js to use .env variable**

    Open `hardhat.config.js` and modify it to load the mnemonic from the `.env` file:

    ```javascript
    require("dotenv").config();

    module.exports = {
        solidity: "0.8.18",
        networks: {
            localhost: {
                url: "http://localhost:8545",
                accounts: {
                    mnemonic: process.env.MNEMONIC,
                },
            },
        },
    };
    ```

-   **Restart Hardhat Node**
    Type `Ctrl+C` to stop the running node, then restart it:

    ```bash
    hh node

     # Output:

     # Accounts
     # ========
     #
     # WARNING: These accounts, and their private keys, are publicly known.
     # Any funds sent to them on Mainnet or any other live network WILL BE  # LOST.
     #
     # Account #0: 0x... (10000 ETH)
     # Private Key:  # 0x...
    ```

    This shows that the accounts are still being generated from the mnemonic stored in the `.env` file.
