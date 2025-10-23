## 🛠️ Lab Practise: Create Mockup

**High-Level DApp Objectives:**

The DApp we are going to build will have the following features:

-   Connects to Metamask wallet and display wallet address.
-   Interacts with contracts deployed on local Hardhat node.
-   Shows the current token balances of the user.
-   Show the current pool reserves.
-   Allow the user to swap tokens.

The lab will be divided into the following parts:

a) Setting up the web framework (React)  
b) Create a mock-up of the DApp with hardcoded data - this part ✅  
c) Extend the DApp to integrate with Metamask  
d) Deploy Uniswap contracts to local Hardhat node  
e) Complete the DApp to allow token swaps

You have previously created an [empty React project](../a-dapp-react/README.md) and now we will extend the React code to create a mock-up that only contains UI with hardcoded data and without any blockchain integration. We will incrementally add the blockchain integration code to this React code in future iterations.

### Step 1: Setup

1.  **Make sure you are in the React project directory**

    ```bash
    cd /workspace/day-4/15-dapp/b-dapp-mockup/fin556-dapp
    ```

2.  **Install Material UI**

    We will install a third-party UI component library to use pre-built UI components in our DApp. This library is imported into **App.jsx**.

    ```bash
    npm i @mui/material @emotion/react @emotion/styled
    ```

### Step 2: Update App.jsx

3.  **Open App.jsx**

    Open the file **fin556-dapp/src/App.jsx**.

    **NOTE:** Make sure you are referring to the correct file.

4.  **Delete all content in the file**

    Delete all content in the file so that it is empty.

5.  **Add the following code to App.jsx**

    -   **Import React packages**

        Import `useEffect` and `useState` from React to handle side effects and state management. This is not a course on React, so there is no need to understand in detail how these work. Just know that `useEffect` is used to run code when the component is loaded and `useState` is used to store state variables in the web application.

        <!-- prettier-ignore -->
        ```js
        import React, { useState, useEffect } from "react";
        ```

    -   **Import Material UI components**

        <!-- prettier-ignore -->
        ```js
        import {
            CssBaseline,
            Container,
            Card,
            Button,
            TextField,
            Box,
            Divider,
            CircularProgress,
        } from "@mui/material";
        ```

    -   **Add an empty App() component and export it.**

        <!-- prettier-ignore -->
        ```js
        const App = () => {        

            // Insert the subsequent code here

        }
        export default App;
        ```

    -   **Insert subsequent code into App()**

        We will start by creating mock data to be displayed in the UI so that you can find where the data originates from. Then we will create the UI components to display the data.

        -   **Create state variable for signer**

            A signer is another term for an account that contains a private key and can be used to sign transactions. The code below creates a state variable called `signer` used to store the account returned from Metamask.

            Insert the code below.

              <!-- prettier-ignore -->

            ```js
            const [signer, setSigner] = useState({
                address: "0x1234567890123456789012345678901234567890",
            });
            ```

            **Explanation:**

            -   `useState` returns an array with two elements: the current value of the state variable and a function to update it. We use array destructuring to assign these two elements to separate variables.

            -   In the code above, `signer` is initialized with an object with address `"0x1234567890123456789012345678901234567890"`.

                ```js
                console.log(signer);
                // Output:
                // {
                // address: "0x1234567890123456789012345678901234567890"
                // }
                ```

            -   We can change the value of `address` by calling the function `setAddress` using a new value. For example, in the code below, we set the signer to `null`.

                ```js
                setAddress(null);
                console.log(address);
                // Output: null
                ```

        -   **Create state variable for token address A**

            Insert the code below.

            <!-- prettier-ignore -->
            ```js
            const [tokenAddrA, setTokenAddrA] = useState(
                "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
            );
            ```

        -   **Create state variable for token address B**  
            Insert the code below.

            <!-- prettier-ignore -->
            ```js
            const [tokenAddrB, setTokenAddrB] = useState(
                "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
            );
            ```

        -   **Create state variable for Uniswap router and factory addresses**

            Insert the code below.

            <!-- prettier-ignore -->
            ```js
            const [uniswapRouterAddress, setUniswapRouterAddress] = useState(
                "0xcccccccccccccccccccccccccccccccccccccccc"
            );
            const [uniswapFactoryAddress, setUniswapFactoryAddress] = useState(
                "0xdddddddddddddddddddddddddddddddddddddddd"
            );
            ```

        -   **Create state variable for balance data**  
            Insert the code below.

            <!-- prettier-ignore -->
            ```js
            const [balance, setBalance] = useState({
                balanceA: 100,
                balanceB: 200,
                liquidity: 50,
                reservesA: 500,
                reservesB: 1000,
            });
            ```

        -   **Render UI components**

            Insert the return() section into App(). This will render the UI components on the browser using HTML-like syntax called JSX.

            There is no need to understand the details of the code below. Just note that:

            -   `textField` component is used to create text boxes used by the `tokenAddrA`, `tokenAddrB`, `uniswapRouterAddress`, and `uniswapFactoryAddress` state variables created earlier.
            -   `card` component is used to display a block of data from the `balance` state variable.
            -   `button` component will be used to call certain functions when clicked.

            Insert the code below.
            <!-- prettier-ignore -->
            ```js
            return (
                <>
                    <CssBaseline />
                    <Container>
                        <h1>DEX DAPP</h1>
                        <p>Connected to Metamask with address: {signer?.address}</p>
                        <h2 style={{ marginBottom: "16px" }}>Contract Configuration</h2>
                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <TextField
                                label='Uniswap Router Address'
                                sx={{ flex: 1 }}
                                value={uniswapRouterAddress}
                                onChange={(e) => {
                                    setUniswapRouterAddress(e.target.value);
                                }}
                            />
                            <TextField
                                label='Uniswap Factory Address'
                                sx={{ flex: 1 }}
                                value={uniswapFactoryAddress}
                                onChange={(e) => {
                                    setUniswapFactoryAddress(e.target.value);
                                }}
                            />
                        </Box>
                        <Divider sx={{ my: 3 }} />                            
                        <h2 style={{ marginBottom: "16px" }}>Liquidity Pool</h2>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 2,
                                mb: 2,
                            }}
                        >
                            <TextField
                                id='tokenAddrA'
                                label='TokenA Address'
                                value={tokenAddrA}
                                sx={{ flex: 1 }}
                                onChange={(e) => {
                                    setTokenAddrA(e.target.value);
                                }}
                            ></TextField>                            
                            <TextField
                                id='tokenAddrB'
                                label='TokenB Address'
                                value={tokenAddrB}
                                sx={{ flex: 1 }}
                                onChange={(e) => {
                                    setTokenAddrB(e.target.value);
                                }}
                            ></TextField>
                            <Button variant='contained'>Check</Button>
                        </Box>
                        <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
                            <Box
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                                    Token Balance
                                </h3>
                                <Card sx={{ p: 3, flexGrow: 1 }}>
                                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                        <li>TokenA: {balance?.balanceA}</li>
                                        <li>TokenB: {balance?.balanceB}</li>
                                        <li>Liquidity: {balance?.liquidity}</li>
                                    </ul>
                                </Card>
                            </Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                                    Pool Reserves
                                </h3>
                                <Card sx={{ p: 3, flexGrow: 1 }}>
                                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                        <li>TokenA: {balance?.reservesA}</li>
                                        <li>TokenB: {balance?.reservesB}</li>
                                    </ul>
                                </Card>
                            </Box>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <h2 style={{ marginBottom: "16px" }}>Token Swap</h2>
                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <TextField id='amtA' label='TokenA Amount' fullWidth />
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button variant='contained'>Buy</Button>
                                <Button variant='outlined'>Sell</Button>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <TextField id='amtB' label='TokenB Amount' fullWidth />
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button variant='contained'>Buy</Button>
                                <Button variant='outlined'>Sell</Button>
                            </Box>
                        </Box>
                    </Container>
                </>
            );
            ```

### Step 3 - Run the DApp

1.  **Start React server**

    Start the React server using the following command.

    ```bash
    npm run dev
    ```

2.  **Open the browser at [http://localhost:5173](http://localhost:5173)**

    It should look like this in the browser:

    ![dapp-mockup](./img/dapp-mockup.png)

    -   **First section: Contract Configuration**

        This section allows the user to enter the Uniswap router and factory contract addresses.

        -   The user can enter the Uniswap router address in the "Uniswap Router Address" text box.

        -   The user can enter the Uniswap factory address in the "Uniswap Factory Address" text box.

    -   **Second section: Liquidity Pool**

        This section is essentially a dashboard for displaying the user's token balances and current pool reserves.

        -   It shows the token addresses for the two reserve tokens in the liquidity pool at the top represented by two text boxes.

        -   Below that, it shows the balance of tokens owned by the user ("Token Balance").

        -   Next to that, it shows the reserves of the two tokens in the liquidity pool ("Pool Reserves").

        -   Each time the "CHECK" button is clicked, it will refresh the token balances and pool reserves. The logic to do that needs to be implemented.

    -   **Third section: Token Swap**

        This section allows the user to swap between the two tokens in the liquidity pool.

        -   The user must first decide whether they want to use "TokenA" or "TokenB" to swap by entering the amount in the respective text box.

        -   Then the user can click on the "BUY" or "SELL" button to perform the swap.

        -   The logic to do the swap needs to be implemented.

        -   **For example**

            If the user wants to pay with TokenA to receive 100 TokenB, then the user is "Buying 100 TokenB". To do that, the user will enter "100" in the "TokenB Amount" text box and click on the "BUY" button next to it.

            If the user wants to pay 500 TokenA to receive TokenB, then the user is "Selling 500 TokenA". To do that, the user will enter "500" in the "TokenA Amount" text box and click on the "SELL" button next to it.

3.  **Stop React server**

    Go back to terminal and press `Ctrl + C` to stop the server.

4.  **Task completed ✅**

    You have successfully created a mock-up of the DApp with hardcoded data and are ready to extend the DApp to integrate with Metamask and the local Hardhat node in the next steps.
