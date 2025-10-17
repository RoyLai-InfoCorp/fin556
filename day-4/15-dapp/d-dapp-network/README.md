## 🛠️ Lab Practise: DApp - Deploy Contracts

**NOTE:** The scripts for deploying the contracts are explained in [Performing Token Swap and Add Liquidity on UniswapV2 on Testnet](../14-testnet-uniswap/README.md)

**High-Level DApp Objectives:**

The DApp we are going to build will have the following features:

-   Connects to Metamask wallet.
-   Interacts with contracts deployed on local Hardhat node.
-   Shows the current token balances of the user.
-   Show the current pool reserves.
-   Allow the user to swap tokens.

The lab will be divided into the following parts:

a) Setting up the web framework (React)  
b) Create a mock-up of the DApp with hardcoded data  
c) Extend the DApp to integrate with Metamask  
d) Deploy Uniswap contracts to local Hardhat node - this part ✅  
e) Complete the DApp to allow token swaps

### Step 1: Setup

1.  **Go to lesson directory**

    ```bash
    cd /workspace/day-4/15-dapp/d-dapp-network
    ```

2.  **Copy .env file from 12-testnet directory**

    In the testnet lesson, we have created a ".env" file to store the mnemonic and Alchemy URL. We will be using the same mnemonic here.
    Copy the ".env" file from the **day-3/home-assignments/12-testnet** directory to the current directory.

    ```bash
    cp ../../../day-3/home-assignments/12-testnet/.env .
    ```

### Step 2: Start a local hardhat node

1.  **Start a local hardhat node**

    If your node starts successfully that means it is running on localhost:8545 and using the mnemonic from the .env file. You are ready to deploy the contracts and will also be able to use Metamask to show the accounts generated from the mnemonic.

    ```bash
    npm i
    hh node
    ```

    ⚠️ You must leave this terminal window running throughout the lesson on DApp development. If you stopped it, you will need to restart it and re-deploy the contracts again.

### Step 3: Deploy Uniswap and ERC20 Contracts

1.  **Open a parallel terminal window**

2.  **Deploy the Uniswap contracts and tokens**

    The scripts for deploying the contracts are in the **day-4/14-DApp/scripts** directory, you just need to run them in sequence by deploying them to the localhost network.

    ```bash
    hh run scripts/1_deployWETH9.js --network localhost
    hh run scripts/2_deployTokens.js --network localhost
    hh run scripts/3_deployUniswap.js --network localhost
    ```

    The scripts will also deploy two demo ERC-20 tokens (DemoTokenA and DemoTokenB).

### Step 4: Create and Fund Liquidity Pool

1.  **Create a liquidity pool**

    ```bash
    hh run scripts/4_createPool.js --network localhost

     # Sample Output
     # Pair Address1: 0xC98f156B72ed9bA72C1c135F17B66C13c239Bd64
     # Pair address2: 0xC98f156B72ed9bA72C1c135F17B66C13c239Bd64
    ```

2.  **Fund the liquidity pool**

    The script is hardcoded to add 1000 DemoTokenA and 5000 DemoTokenB to the liquidity pool.

    ```bash
    hh run scripts/5_addLiquidity.js --network localhost

     # Sample Output
     # Deployer address: 0x6976827c1fC851546a202a5159a48Cac2b0649FF
     # Pair address: 0xC98f156B72ed9bA72C1c135F17B66C13c239Bd64
     # Liquidity added.
     # LP Balance of 0x6976827c1fC851546a202a5159a48Cac2b0649FF: 2236.067977499789695409
     # Reserves: 1000.0 / 5000.0
    ```

### Get the contract addresses

-   **Open scripts/addresses.json**:

    You should see the addresses of the following contracts:

    -   UniswapV2Router02 address
    -   UniswapV2Factory address
    -   Demo TokenA address
    -   Demo TokenB address

    **Example**

    ```json
    {
        "weth9": "0xB590338490D26a4dCF10b531B038aC6DA54329b9",
        "token0": "0x1A023B00f7a96f35319C740369d858787EE3e6f9",
        "token1": "0x6D6970ee7480F2BFAed31FAd535E29CA04987549",
        "factory": "0xEb8e214fc8bC4a4ed2C174635A01cD8e13Fc59d9",
        "router": "0x4fcaaD9DB6C7Aa0e9c3764fB216DcECeAf3A5BF8"
    }
    ```

    Take note of these addresses as we will need them in the DApp.

4.  **Task completed ✅**

    You have successfully setup the local Hardhat node, deployed the Uniswap contracts, created and funded the liquidity pool.

⚠️ **IMPORTANT:** You may close the parallel terminal window but keep the hardhat node running in the first terminal window as it will be used by the next part of the lab.
