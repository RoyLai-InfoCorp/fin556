## 🛠️ Lab Practise: Integrate with Metamask

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
c) Extend the DApp to integrate with Metamask - this part ✅  
d) Deploy Uniswap contracts to local Hardhat node  
e) Complete the DApp to allow token swaps

### Step 1: Setup

1.  **Go to the React project directory**

    ```bash
    cd /workspace/day-4/15-dapp/c-dapp-metamask/fin556-dapp
    ```

2.  **Install React**

    ```bash
    npm i
    ```

3.  **Install ethers.js**

    This package will be used by our script library to interact with the blockchain.

    **NOTE:** We are only installing ethers.js because it will be bundled into the browser. We cannot use hardhat in the browser because it is a node.js library and is not designed to run in the browser.

    ```bash
    npm i ethers
    ```

### Step 2: Create a React hook script library for blockchain interaction

We want to separate the code for blockchain interaction from the code for web interaction. This will make the code cleaner and easier to maintain.  
Therefore, we will create a separate script library file called **useDapp.js** for the blockchain interaction code in the React project. This library is known as a "React Hook" because it uses React's hook system to manage state and side effects.

1.  **Create a fin556-dapp/src/useDapp.js**

    Create a new file called **useDapp.js** in the **fin556-dapp/src** directory of the React project.

    > ⚠️ Becareful here:
    >
    > -   This script is used by the React project and not by Hardhat so it must be created in the React project directory.
    > -   Make sure you are creating it in the **fin556-dapp/src** directory where you created the React project previously.
    > -   Do not create it the wrong directory.

2.  **Add the following code to the useDapp.js**

    -   **Import ethers**

        Insert the following import statement at the top of the file.

        ```js
        import { ethers } from "ethers";
        ```

    -   **Create an empty useDapp() function**

        Create an empty function called `useDapp()`.

        `useDapp()` will take in a function called `setSigner()` as parameter. When the DApp connects to Metamask and gets the connected signer, it will call this function to update the signer in the DApp UI.

        ```js
        const useDapp = ({ setSigner }) => {
            // Blockchain interaction code will go here
        };

        export default useDapp;
        ```

    -   **Insert the following code inside useDapp() function**

        We will add the code to connect to Metamask and get the connected account.

        -   **Add provider**

            We want to get the Metamask provider (`window.ethereum`) so that we can interact with the Metamask wallet extension in the browser. And through Metamask, let us send commands to the blockchain. If Metamask is not installed, `window.ethereum` will be null and the function will return null so that the DApp can display an error message to the user.

            **NOTE:** In Hardhat, we configure the provider using **hardhat.config.js** file but since we are not using Hardhat here, we need to get the provider from Metamask.

            Insert the following code inside the `useDapp()` function.

            ```js
            const provider = window.ethereum
                ? new ethers.BrowserProvider(window.ethereum)
                : null;
            ```

        -   **Add connect() function**

            This function will be used by the DApp to get the signer from Metamask. In Hardhat, we were able to use `ethers.getSigners()` to get a list of accounts because we delegated the key management to Hardhat. In Metamask, you need to first connect to it using your password to unlock the wallet. That is what the `eth_requestAccounts` command in the code below does.

            Insert the following code inside the `useDapp()` function.

            ```js
            const connect = async () => {
                if (!provider) return null;

                await provider.send("eth_requestAccounts", []); // Login to metamask
                const signer = await provider.getSigner();

                const { chainId } = await provider.getNetwork();
                console.log("Connected to chainId:", chainId);

                // const DESIRED_CHAIN_ID = 31337; // This is the default chain ID for hardhat localhost network
                // if (chainId !== DESIRED_CHAIN_ID) {
                //     await provider.send("wallet_switchEthereumChain", [
                //         { chainId: `0x${DESIRED_CHAIN_ID.toString(16)}` }, // Must be in hex format
                //     ]);
                // }

                // Get and set the address
                setSigner(signer);

                return signer;
            };
            ```

            **Optional:** We can also control which network the user should connect to by uncommenting the code after `const signer = provider.getSigner();` line. This is useful if you want to ensure the user is connected to localhost instead of anywhere else.

        -   **Return the functions from useDapp()**

            Finally, we need to return the `connect()` so that it can be used by the DApp.

            Insert the following code inside the `useDapp()` function.

            ```js
            return {
                connect,
            };
            ```

### Step 3: Update the UI to show Metamask connected address

1.  **Open App.jsx**

    Open the file **fin556-dapp/src/App.jsx**.

    **NOTE:** Make sure you are referring to the correct file.

2.  **Add the following code to App.jsx**

    -   **Import useDapp**

        Import the `useDapp` function from **useDapp.js** at the top of the file.

        ```js
        import useDapp from "./useDapp";
        ```

    -   **Update the App() component**

        Insert the following code inside the `App()` component to connect to Metamask and get the connected address.

        -   **Initialize signer state variable**

            Replace the following line.

            ```js
            const [signer, setSigner] = useState({
                address: "0x1234567890123456789012345678901234567890",
            });
            ```

            with

            ```js
            const [signer, setSigner] = useState(null);
            ```

            -   Initialize the state variable to null instead of a hardcoded address so that we can detect if the user is connected or not.

        -   **Load the useDapp() hook**

            Insert the following code after the state variable declarations.

            ```js
            const { connect } = useDapp({ setSigner });
            ```

            -   This will load the `useDapp()` hook and get the `connect()` function that we defined earlier.

        -   **Load address from Metamask**

            Insert the following code before the `return()` section.

            <!-- prettier-ignore -->
            ```js
            useEffect(() => {
                const start = async () => {
                    const result = await connect();
                    if (result?.error) {
                        alert(
                            "MetaMask is not installed. Please install MetaMask to use this DApp."
                        );
                    }
                };
                start();
            }, []);
            ```

            -   The code will call the `connect()` function to connect to Metamask and update the signer state variable.
            -   If Metamask is not installed, it will show an alert message.

### Step 4: Run the DApp

-   **Start the Server**

    ```bash
    cd /workspace/day-4/15-dapp/c-dapp-metamask/fin556-dapp
    npm run dev
    ```

2.  **Open the browser at [http://localhost:5173](http://localhost:5173)**

    It should look like this in the browser:

    ![connected-address](./img/connected-address.png)

3.  **Stop React server**

    Go back to terminal and press `Ctrl + C` to stop the server.

4.  **Task completed ✅**

    You have successfully updated the DApp to connect to Metamask and show the connected address.
