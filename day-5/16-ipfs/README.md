## 🛠️ Lab Practise: IPFS

IPFS (InterPlanetary File System) is a peer-to-peer distributed file system that seeks to connect all computing devices with the same system of files. In other words, IPFS is a decentralized storage and sharing solution that allows users to host and access content in a distributed manner without relying on a central server. Why IPFS matters in blockchain is because it is an important component in the decentralized web (Web3) ecosystem handling off-chain data storage and sharing.

For example, in NFT applications, the actual digital assets (images, videos, music, etc.) are typically stored off-chain using IPFS while the metadata and ownership information are stored on-chain. This is because storing large files directly on the blockchain is inefficient and costly.

In the case of DApps, IPFS can be used to host the frontend code (HTML, CSS, JavaScript) of the application, allowing users to access the DApp without relying on a centralized web server.

In this part of the lab, you will learn how to install and run an IPFS node locally, and then we will explore how to deploy a DApp to IPFS in the next lab practise.

### Step 1: Install and run IPFS

📌 You need to run this step in **Windows Terminal or terminal for Linux/Mac, not from devcontainer in Visual Studio Code**

-   Open your terminal (WSL for windows and terminal for Linux/Mac).

-   Download the latest IPFS version (replace `v0.18.1` with the latest version if different):

    ```bash
    cd /tmp
    wget https://dist.ipfs.tech/kubo/v0.38.1/kubo_v0.38.1_linux-amd64.tar.gz
    ```

-   Extract the downloaded file and install IPFS:

    ```bash
    tar -xvzf kubo_v0.38.1_linux-amd64.tar.gz
    cd kubo
    sudo ./install.sh
    ```

    You will be prompted for your password to authorize the installation.

-   Verify the installation:

    ```bash
    ipfs --version

     # ipfs version 0.38.1
    ```

-   Initialize IPFS:

    ```bash
    ipfs init

     # generating ED25519 keypair...done
     # peer identity: 12D3KooWPcdY3KE4bpNM6WsLpJGvDaT2ikGjBsUw6ZbpPYubhqcX
     # initializing IPFS node at /home/vscode/.ipfs
    ```

-   Configure ports:

    Because the default ports used by IPFS are 5001 and 8080 which are often used by other applications, we will change them to 5501 and 48080 respectively.

    ```bash
    ipfs config Addresses.API /ip4/0.0.0.0/tcp/5501
    ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/48080
    ```

-   Start the IPFS daemon:

    ```bash
    ipfs daemon

        # RPC API server listening on /ip4/127.0.0.1/tcp/5501
        # WebUI: http://127.0.0.1:5501/webui
        # Gateway server listening on /ip4/127.0.0.1/tcp/48080
        # Daemon is ready
    ```

-   Open Windows browser and navigate to `http://127.0.0.1:5501/webui` to access the IPFS WebUI.

    ![IPFS WebUI](./img/ipfs.png)

### Step 2: Add and retrieve files from IPFS

-   **Go to /tmp directory**

    ```bash
    cd /tmp
    ```

-   **Add a file to IPFS**

    Create a sample text file and add it to IPFS.

    ```bash
    echo "this is a test" > demo.txt
    ipfs add demo.txt

        # added QmYi7wrRFKVCcTB56A6Pep2j31Q5mHfmmu21RzHXu25RVR demo.txt
    ```

    Take note of the hash (CID) returned by the command (e.g., `QmYi7wrRFKVCcTB56A6Pep2j31Q5mHfmmu21RzHXu25RVR`).

-   **Retrieve the file via IPFS CLI**

    Use the CID to retrieve the file from IPFS.

    ```bash
    ipfs cat QmYi7wrRFKVCcTB56A6Pep2j31Q5mHfmmu21RzHXu25RVR

        # Hello, IPFS!
    ```

-   **Retrieve files via IPFS local gateway**

    You can also access the file via the local IPFS gateway using a web browser.

    Open your browser and navigate to the following URL, replacing `<CID>` with the actual CID from the previous step.

    ```bash
    http://localhost:48080/ipfs/<CID>

        # for example:
        # http://localhost:48080/ipfs/QmYi7wrRFKVCcTB56A6Pep2j31Q5mHfmmu21RzHXu25RVR
    ```

-   **Retrieve files via IPFS public gateway**

    You can also access the file via a public IPFS gateway using a web browser.

    Open your browser and navigate to the following URL, replacing `<CID>` with the actual CID from the previous step.

    ```bash
    https://dweb.link/ipfs/<CID>

        # for example:
        # https://dweb.link/ipfs/QmYi7wrRFKVCcTB56A6Pep2j31Q5mHfmmu21RzHXu25RVR
    ```

    📌 NOTE: If the instruction
    The instructions may not work if your IPFS node is not connected to the IPFS network or if the content is not being hosted by any other peers. Usually this process is automatic but sometimes it may take a while for the content to propagate through the network. To access your local IPFS content via a public IPFS gateway, you need to connect your IPFS node to the IPFS network and announce that you are hosting the content. You can do this by connecting to a well-known IPFS peer and providing the content.

    -   Find a well-known IPFS peer

        ```bash
        ipfs swarm peers

            # /ip4/
            # /ip4/103.169.127.232/udp/4001/quic-v1/p2p/12D3KooWBdF3g6vSJFRPoZQo7BNnkNzaWb59gpyaVzsgtNTVeu8H
            # /ip4/135.125.96.137/udp/4001/quic-v1/p2p/12D3KooWFFeNh8CaLbUUfGgrGfPx42EuDDSKQkEBt5kpax4aizWE
            # /ip4/142.171.58.107/tcp/4001/p2p/12D3KooWHepEHGSGex1quwYC9aPsmZotdtWJaNxFcweSmNDX9W4W
            # ...
        ```

    -   Connect to the peer and provide the content
        Run the command `ipfs swarm connect` using any one of the peer addresses obtained from the previous step
        ipfs swarm connect /ip4/<peer-ip>/tcp/<peer-port>/p2p/<peer-id>
        For example:

        ```bash
         # ipfs swarm connect /ip4/103.169.127.232/udp/4001/quic-v1/p2p/12D3KooWBdF3g6vSJFRPoZQo7BNnkNzaWb59gpyaVzsgtNTVeu8H
        ```

    -   Announce that you are hosting the content
        Use the command `ipfs routing provide <CID>` to announce that you are hosting the content with the given CID. For example:

        ```bash
         # ipfs routing provide QmYi7wrRFKVCcTB56A6Pep2j31Q5mHfmmu21RzHXu25RVR
        ```

---

## 🛠️ Lab Practise: Deploy DApp to IPFS

You have successfully built a DApp for swapping tokens using a Uniswap DEX protocol and now you want to share it with the world.
In this lab practise, you will learn how to deploy and host your DApp without needing a public web server.

The way to achieve this is to convert your DApp into a static file and host it on a file server for download. You can even send the compressed static file to your friends by email or messaging apps barring any security restrictions. The point is that the DApp can run entirely on browser without a web server backend. The reason this works is because the DApp interacts with the blockchain node directly with your Metamask wallet as the signer and does not need any server-side code.

📌 The project directory is structured such that the Dapp directory (fin556-dapp) is within the project directory (16-dapp-deployment).
Since both fin556-dapp and 16-dapp-deployment have their own package.json files, you need to make sure you are in the correct directory when installing dependencies or running scripts.

### Step 1: Build the DApp for deployment

📌 Run the following from **from devcontainer in Visual Studio Code**

-   **Copy DApp from previous lab**

    Copy the React directory in the sample directory of previous lab.

    ```bash
    cd /workspace/day-5/16-ipfs/
    cp -rp /workspace/day-4/15-dapp/sample/fin556-dapp .
    ```

-   **Go to the DApp directory and install dependencies**

    ```bash
    cd fin556-dapp
    npm i
    ```

-   **Configure vite.config.js**

    When you deploy your DApp to IPFS, the site won’t load correctly unless all file paths are relative (not starting with /). To fix this, you need to set a base path in vite.config.js.

    Open `vite.config.js` and modify it as follows:

    ```js
    import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";

    // https://vitejs.dev/config/
    export default defineConfig({
        plugins: [react()],
        base: "./", // Use relative paths so IPFS can serve the files correctly
    });
    ```

-   **Build the Production Bundle**

    Make sure you are in your DApp

    ```bash
    npm run build

     # > fin556-dapp@0.0.0 build
     # > vite build

     # vite v7.1.11 building for production...
     # ✓ 1051 modules transformed.
     # dist/index.html                  0.35 kB │ gzip:   0.25 kB
     # dist/assets/index-CMmGqaf8.js  642.94 kB │ gzip: 216.67 kB
     #
     # (!) Some chunks are larger than 500 kB after minification. Consider:
     # - Using dynamic import() to code-split the application
     # - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
     # - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
     # ✓ built in 3.79s
    ```

    This will create a `dist` directory in the `fin556-dapp` folder containing just a file `index.html` and an `assets` folder.

### Step 2. Deploy DApp to IPFS

📌 You need to run this step in **Windows Terminal or terminal for Linux/Mac, not from devcontainer in Visual Studio Code**

-   **Start the IPFS daemon**

    If you have started the IPFS daemon in the previous lab practise, you can stop it using `Ctrl+C` and restart it again to make sure it is running properly.

    ```bash
    ipfs daemon

        # RPC API server listening on /ip4/127.0.0.1/tcp/5501
        # WebUI: http://127.0.0.1:5501/webui
        # Gateway server listening on /ip4/127.0.0.1/tcp/48080
        # Daemon is ready
    ```

-   **Add your DApp to IPFS**

    Make sure you are in the DApp directory

    ```bash
    cd ~/course/FIN556/day-5/16-ipfs/fin556-dapp
    ipfs add -r dist

     # Sample Output:

     # added QmUG4Zdj5kBbKsa7tARQ67dWCKgYVPRBspJNR3riqAReRC dist/assets/index-qsjpLWOP.js
     # added QmbwzsLWAexWZjMcZPGoZeQzpJDX9hc7Qcao98sUYHTK1B dist/index.html
     # added QmNx41RNNJ6kuKXjiNU5seBTQmXxkp7Y2jkg2evNqyCmmn dist/assets
     # added QmeBXKDYaPwZ2o9bNonp7FTvnYyeby2JBUYcDPURztC9qo dist

    ```

    Take note of the last hash output by the command (e.g. QmeBXKDYaPwZ2o9bNonp7FTvnYyeby2JBUYcDPURztC9qo in the sample output).
    That is the content identifier (CID) for your DApp on IPFS.

-   **Access your DApp via Local IPFS Gateway**

    Open your browser and navigate to the following URL, replacing `<CID>` with the actual CID from the previous step.

    ```bash
    http://127.0.0.1:48080/ipfs/<CID>

     # for example:
     # http://127.0.0.1:48080/ipfs/QmeBXKDYaPwZ2o9bNonp7FTvnYyeby2JBUYcDPURztC9qo
    ```

-   **Access your DApp via Public IPFS Gateway**

    Advertise your DApp to the world by accessing it via a public IPFS gateway.

    ```bash
    ipfs routing provide <CID>

     # for example:
     # ipfs routing provide QmeBXKDYaPwZ2o9bNonp7FTvnYyeby2JBUYcDPURztC9qo
    ```

    Open your browser and navigate to the following URL, replacing `<CID>` with the actual CID from the previous step.

    ```bash
    https://dweb.link/ipfs/<CID>

     # for example:
     # https://dweb.link/ipfs/QmeBXKDYaPwZ2o9bNonp7FTvnYyeby2JBUYcDPURztC9qo
    ```

### Step 3. Using the DApp with Local Hardhat Node

Once you reach this step, you have successfully deployed your DApp to IPFS and can access it via both local and public IPFS gateways.
In order to use it, you will need to start up a local Hardhat blockchain node, deploy the smart contracts and connect your Metamask wallet to it.

You can refer to the previous lab 15-dapp/d-dapp-network/README.md for detailed instructions on how to set up the local Hardhat node and deploy the smart contracts.
