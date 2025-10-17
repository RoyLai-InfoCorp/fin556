## 🛠️ Lab Practise: DApp - Deploy Contracts

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
d) Deploy Uniswap contracts to local Hardhat node  
e) Complete the DApp to allow token swaps - this part ✅

### Step 1: Setup

-   **Go to the React project directory**

    ```bash
    cd /workspace/day-4/15-dapp/e-dapp-uniswap/fin556-dapp
    ```

-   **Install dependencies**

    ```bash
    npm i
    ```

### 1. Update script library

-   **Open the fin556-dapp/src/dapp.js**

    Add the following code:

    -   **Add constants for contract addresses**

        Refer to the addresses obtained from **scripts/addresses.json** in the [previous step](#1-deploy-uniswap-and-erc20-contracts-on-local-node) and insert them as constants in the code after the import statements.

        ```js
        // Update these constants with actual addresses.
        const UNISWAP_ROUTER_ADDRESS = "...";
        const UNISWAP_FACTORY_ADDRESS = "...";
        const DEMO_TOKEN_A = "...";
        const DEMO_TOKEN_B = "...";
        ```

        Update the above constants with the actual addresses.
        You can get the addresses from **scripts/addresses.json** generated from the previous step.

        **NOTE:** If you are connecting to a public testnet instead of localhost, you will need to update the token addresses accordingly. You can use any ERC-20 tokens on the testnet.

    -   **Add getAddressA() and getAddressB() functions**

        Add the function to return DemoTokenA and DemoTokenB addresses so that it can be used to initialize the text boxes.

        ```js
        const getAddressA = () => DEMO_TOKEN_A;

        const getAddressB = () => DEMO_TOKEN_B;
        ```

    -   **Add getBalance() function**

        Add the following code to get the token balances of the user and reserve balances in the liquidity pool.

        ```js
        const getBalance = async (tokenAddrA, tokenAddrB, account) => {
            const address = await account.getAddress();

            const tokenA = new ethers.Contract(
                tokenAddrA,
                ["function balanceOf(address) view returns(uint)"],
                account
            );

            const tokenB = new ethers.Contract(
                tokenAddrB,
                ["function balanceOf(address) view returns(uint)"],
                account
            );

            // Pool
            const factory = new ethers.Contract(
                UNISWAP_FACTORY_ADDRESS,
                ["function getPair(address,address) view returns(address)"],
                account
            );
            console.log(
                `Getting poolAddress for addressA(${tokenAddrA}) and addressB(${tokenAddrB})`
            );
            const poolAddress = await factory.getPair(tokenAddrB, tokenAddrA);
            console.log(
                `poolAddress for addressA(${tokenAddrA}) and addressB(${tokenAddrB}) is ${poolAddress}`
            );
            const pool = new ethers.Contract(
                poolAddress,
                [
                    "function getReserves() view returns(uint112 reserve0,uint112 reserve1,uint32)",
                    "function balanceOf(address) view returns(uint)",
                ],
                account
            );

            // Get Reserves
            const { reserve0, reserve1 } = await pool.getReserves();
            const reservesA = tokenAddrA < tokenAddrB ? reserve0 : reserve1;
            const reservesB = tokenAddrA > tokenAddrB ? reserve0 : reserve1;

            return {
                balanceA: (await tokenA.balanceOf(address))?.toString(),
                balanceB: (await tokenB.balanceOf(address))?.toString(),
                liquidity: (await pool.balanceOf(address))?.toString(),
                reservesA: reservesA.toString(),
                reservesB: reservesB.toString(),
            };
        };
        ```

    -   **Add getAmountOut() function**

        Add the following code to swap tokens in the liquidity pool.

        ```js
        function getAmountOut(amountIn, reserveIn, reserveOut) {
            if (!amountIn || !reserveIn || !reserveOut) {
                throw new Error(
                    "Invalid input: amountIn, reserveIn, and reserveOut must be provided"
                );
            }
            const amountInWithFee =
                ethers.toBigInt(amountIn) * ethers.toBigInt(997);
            const numerator = amountInWithFee * ethers.toBigInt(reserveOut);
            const denominator =
                ethers.toBigInt(reserveIn) * ethers.toBigInt(1000) +
                amountInWithFee;
            return numerator / denominator;
        }
        ```

    -   **Add getReserves() function**

        Add the following code to get the reserves of the liquidity pool.

        ```js
        const getReserves = async (factory, { TOKEN_0, TOKEN_1 }, account) => {
            const poolAddress = await factory.getPair(TOKEN_0, TOKEN_1);
            if (poolAddress === ethers.ZeroAddress) {
                throw new Error("No pool found for the given token pair");
            }
            const pool = new ethers.Contract(
                poolAddress,
                [
                    "function getReserves() view returns(uint112 reserve0,uint112 reserve1,uint32)",
                ],
                account
            );
            const { reserve0, reserve1 } = await pool.getReserves();
            return {
                reserveA: TOKEN_0 < TOKEN_1 ? reserve0 : reserve1,
                reserveB: TOKEN_0 > TOKEN_1 ? reserve0 : reserve1,
            };
        };
        ```

    -   **Add sellTokens() function**

        Add the following code to sell tokens in the liquidity pool. This function will be called when the user clicks the "SELL" button by providing the input amount, input token address, output token address, and the user's account.

        ```js
        const sellTokens = async (inputAmt, inputAddr, outputAddr, account) => {
            // Get Reserves
            const factory = new ethers.Contract(
                UNISWAP_FACTORY_ADDRESS,
                ["function getPair(address,address) view returns(address)"],
                account
            );

            const reserves = await getReserves(
                factory,
                {
                    TOKEN_0: inputAddr,
                    TOKEN_1: outputAddr,
                },
                account
            );

            console.log("Reserves:", reserves);

            if (!reserves || !reserves.reserveA || !reserves.reserveB) {
                throw new Error("Failed to fetch reserves from the pool");
            }

            // Get OutputAmt
            const outputAmt = getAmountOut(
                inputAmt,
                reserves.reserveA,
                reserves.reserveB
            );

            // Load contract A and contract B
            const uniswap = new ethers.Contract(
                UNISWAP_ROUTER_ADDRESS,
                [
                    `function swapExactTokensForTokens(uint,uint,address[],address,uint)`,
                ],
                account
            );

            // Approve router to withdraw 2000 TokenA from trader account
            const inputToken = new ethers.Contract(
                inputAddr,
                ["function approve(address,uint)"],
                account
            );
            const response = await inputToken.approve(
                UNISWAP_ROUTER_ADDRESS,
                inputAmt
            );
            await response.wait();
            console.log("trade: approved. receipt=", response.hash);

            // Trade 2000 TokenA for 1662 TokenB using trader account
            const ts = (await provider.getBlock()).timestamp + 1000;
            await uniswap.swapExactTokensForTokens(
                inputAmt,
                outputAmt,
                [inputAddr, outputAddr],
                await account.getAddress(),
                ts
            );

            return outputAmt;
        };
        ```

    -   **Add buyTokens() function**

        You should implement this function on your own based on what you have learned so far. For now, calling this function will throw an error.

        ```js
        const buyTokens = async (inputAmt, inputAddr, outputAddr, account) => {
            throw new Error("Not implemented yet");
        };
        ```

    -   **Export the functions**

        Export these 6 functions so that they can be imported into **App.jsx**.

        ```js
        export {
            getAccount,
            getAddressA,
            getAddressB,
            getBalance,
            sellTokens,
            buyTokens,
        };
        ```

### 2. Update App.jsx

-   **Open App.jsx**

    Open the file **App.jsx** in the **fin556-dapp/src** directory.

-   **Import the functions**

    Import the functions created in **dapp.js**.

    ```js
    import {
        getAccount,
        getAddressA,
        getAddressB,
        getBalance,
        sellTokens,
    } from "./dapp";
    ```

-   **Update the App component**

    Insert the following code inside the `App` component.

    -   **Add token address state variables**

        Replace the following lines.

        ```js
        const tokenAddrA = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; // tokenA
        const tokenAddrB = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"; // tokenB
        ```

        with

        ```js
        const [tokenAddrA, setTokenAddrA] = useState(getAddressA());
        const [tokenAddrB, setTokenAddrB] = useState(getAddressB());
        ```

        -   Replace the hardcoded tokenAddrA and tokenAddrB with state variables.
        -   Initialize the state variable using getAddressA() and getAddressB() functions from **dapp.js**.
        -   Add the setTokenAddrA() and setTokenAddrB() functions so that if the user changes the value in the text box, the state variable will be updated.

    -   **Replace the balance state variable**

        Replace the following lines.

        ```js
        const balance = {
            balanceA: 100,
            balanceB: 200,
            liquidity: 50,
            reservesA: 500,
            reservesB: 1000,
        };
        ```

        with

        ```js
        const [balance, setBalance] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        ```

        -   Replace the hardcoded balance object with a state variable.
        -   Add the setBalance() function so that when we get the actual balances from the blockchain, we can update the state variable.
        -   Add a isLoading state variable to show a loading spinner when we are fetching data from the blockchain. This is useful to know that the DApp is working and not frozen.

    -   **Add amtA and amtB state variables**
        Add the following state variables to store the amount of TokenA and TokenB to be swapped.

        ```js
        const [amtA, setAmtA] = useState(0);
        const [amtB, setAmtB] = useState(0);
        ```

    -   **Create handleCheckBalance() function**

        Add the following function to handle the "Check" button click event.

        ```js
        const handleCheckBalance = async () => {
            setIsLoading(true);
            try {
                const account = await getAccount();
                if (!account) {
                    alert("Metamask not detected");
                    setIsLoading(false);
                    return;
                }
                const balance = await getBalance(
                    tokenAddrA,
                    tokenAddrB,
                    account
                );
                console.log(balance);
                setBalance(balance);
            } catch (error) {
                console.error("Error fetching balances:", error);
                alert("Failed to fetch balances. Please try again.");
            }
            setIsLoading(false);
        };
        ```

        -   This function is called when the "Check" button is clicked.
        -   It sets the loading state variable to true to show the loading spinner.
        -   It calls the `getAccount()` function to get the signer from Metamask.
        -   If no account is found, it will show an alert message and set the loading state variable to false.
        -   If an account is found, it will call the `getBalance()` function to
            get the token balances and pool reserves from the blockchain.

    -   **Create handleSellA() and handleSellB() functions**
        Add the following functions to handle the "Sell" button click events.

        ```js
        const handleSellA = async () => {
            const account = await getAccount();
            if (!account) {
                alert("Invalid account");
                return;
            }
            if (!amtA) {
                alert("Invalid amount");
                return;
            }
            setIsLoading(true);
            const amtB = await sellTokens(
                amtA,
                tokenAddrA,
                tokenAddrB,
                account
            );
            console.log(`Sold ${amtA} of A for ${amtB} of B`);
            setIsLoading(false);
        };

        const handleSellB = async () => {
            const account = await getAccount();
            if (!account) {
                alert("Invalid account");
                return;
            }
            if (!amtB) {
                alert("Invalid amount");
                return;
            }
            setIsLoading(true);
            const amtA = await sellTokens(
                amtB,
                tokenAddrB,
                tokenAddrA,
                account
            );
            console.log(`Sold ${amtB} of B for ${amtA} of A`);
            setIsLoading(false);
        };
        ```

        -   These functions are called when the "Sell" buttons are clicked.
        -   They check if the amount entered is valid (greater than 0).
        -   They set the loading state variable to true to show the loading spinner.
        -   They call the `getAccount()` function to get the signer from Metamask.
        -   If no account is found, it will show an alert message and return.
        -   If an account is found, it will call the `sellTokens()` function to swap the tokens in the liquidity pool.
        -   After the swap is done, it will log the result and set the loading state variable to false.

    -   Update the **return** statement to replace the hardcoded values with the state variables and add the loading spinner.

        -   **Update the text boxes to use state variables**

            Update the following lines in the text boxes.

            **NOTE:** You should be able to find them in the return() section of the code.

            <!-- prettier-ignore -->
            ```js
                <TextField
                    id='tokenAddrA'
                    label='TokenA Address'
                    value={tokenAddrA}
                    sx={{ flex: 1 }}
                ></TextField>
            ```

            and

            <!-- prettier-ignore -->
            ```js
                <TextField
                    id='tokenAddrB'
                    label='TokenB Address'
                    value={tokenAddrB}
                    sx={{ flex: 1 }}
                ></TextField>
            ```

            to

            <!-- prettier-ignore -->
            ```js
                <TextField
                    id='tokenAddrA'
                    label='TokenA Address'
                    value={tokenAddrA}
                    sx={{ flex: 1 }}
                    onChange={(e) => {
                        setTokenAddrA(e.target.value);
                    }}
                ></TextField>
            ```

            and

            <!-- prettier-ignore -->
            ```js
                <TextField
                    id='tokenAddrB'
                    label='TokenB Address'
                    value={tokenAddrB}
                    sx={{ flex: 1 }}
                    onChange={(e) => {
                        setTokenAddrB(e.target.value);
                    }}
                ></TextField>
            ```

        -   **Update the "Check" button to invoke handleCheckBalance()**

            Update the following line in the "Check" button.

            <!-- prettier-ignore -->
            ```js
                <Button variant='contained'>Check</Button>
            ```

            to

            <!-- prettier-ignore -->
            ```js
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button onClick={handleCheckBalance} variant='contained'>Check</Button>
                )}    
            ```

            -   If the loading state variable is true, show a loading spinner using the `CircularProgress` component from Material UI.
            -   If the loading state variable is false, show the "Check" button.
            -   Add an onClick event handler to the button to invoke the `handleCheckBalance()` function when the button is clicked.
            -   This will fetch the token balances and pool reserves from the blockchain and update the state variable `balance`.

            **NOTE:** It is important for the spinner and button to be mutually exclusive, ie. both cannot be shown at the same time. This is to prevent the user from clicking the button multiple times while the data is being fetched.

        -   **Update the "Sell" buttons to invoke handleSellA() and handleSellB()**

            Update the following lines in the "Sell" buttons.

            <!-- prettier-ignore -->
            ```js
                    <TextField id='amtA' label='TokenA Amount' fullWidth />
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant='contained'>Buy</Button>
                        <Button variant='outlined'>Sell</Button>
                    </Box>
            ```

            to

            <!-- prettier-ignore -->
            ```js
                    <TextField
                        id='amtA'
                        label='TokenA Amount'
                        onChange={(e) => {
                            setAmtA(e.target.value);
                        }}
                        fullWidth
                    ></TextField>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant='contained'>Buy</Button>
                        <Button variant='outlined' onClick={handleSellA}>Sell</Button>
                    </Box>
            ```

            and

            <!-- prettier-ignore -->
            ```js
                    <TextField id='amtB' label='TokenB Amount' fullWidth />
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant='contained'>Buy</Button>
                        <Button variant='outlined'>Sell</Button>
                    </Box>
            ```

            to

            <!-- prettier-ignore -->
            ```js
                    <TextField
                        id='amtB'
                        label='TokenB Amount'
                        onChange={(e) => {
                            setAmtB(e.target.value);
                        }}
                        fullWidth
                    ></TextField>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant='contained'>Buy</Button>
                        <Button variant='outlined' onClick={handleSellB}>Sell</Button>
                    </Box>

            ```

            -   If the loading state variable is true, show a loading spinner using the `CircularProgress` component from Material UI.
            -   If the loading state variable is false, show the "Sell" button.
            -   Add an onClick event handler to the button to invoke the `handleSellA()` or `handleSellB()` function when the button is clicked.
            -   This will swap the tokens in the liquidity pool and update the state variable `balance`.

### 3. Run the DApp

-   **Start the React development server**

    ```bash
    cd /workspace/day-4/15-dapp/e-dapp-uniswap/fin556-dapp
    npm run dev
    ```

-   **Open browser at http://localhost:5173**

    a) Refresh the balances by clicking the "Check" button.
    b) Enter an amount in the "TokenA Amount" text box
    c) Click the "Sell" button next to it to swap TokenA for TokenB.

    ![swap-1](./img/swap-1.png)

    d) Approve the transaction in Metamask.

    ![swap-2](./img/swap-2.png)

    d) After the transaction is confirmed, refresh the balances by clicking the "Check" button again to see the updated balances.

    ![swap-3](./img/swap-3.png)
