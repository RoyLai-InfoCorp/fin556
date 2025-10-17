# Building DApps

This lesson introduces two important concepts:

-   **Decentralized Applications (DApps) Development** involves building applications that interact with blockchain networks.

-   **Design Thinking** is a human-centered approach to problem solving. It focuses on understanding the people you’re designing for, generating creative ideas, and iteratively testing and refining solutions.

We will explore how to apply Design Thinking principles to create user-friendly DApps that solve real-world problems.

## DApp and Web3

-   A **Decentralized Application (DApp)** is a web application that connects to a blockchain network. The front-end typically runs entirely in the browser and integrates with a client-side wallet such as MetaMask.

-   In theory, you could eliminate the web server altogether, hosting only a static web page that interacts with the blockchain — this is the foundation of the **Web3** movement to decentralize the web.

-   In practice, most DApps use frameworks like **React** or **Vue.js**, written in **JavaScript** or **TypeScript**, and rely on libraries such as **ethers.js** or **web3.js** for blockchain interaction.

---

## Applying Design Thinking to DApp Development

Design Thinking is a **human-centered approach** to creating effective solutions. It prioritizes user needs and iterative improvement over technical features.

**The 5 Core Phases**

1. **Empathize** – Understand the user’s needs.
2. **Define** – Clearly state the problem you want to solve.
3. **Ideate** – Generate a wide range of possible solutions.
4. **Prototype** – Build a simple version of your idea to test it.
5. **Test** – Gather feedback and improve the design.

---

### Applying Design Thinking to Blockchain and DApps

When developing a DApp, Design Thinking ensures you’re solving the right problem, not just writing smart contracts.

Ask yourself:

-   Who are my users?
-   What pain points do they have in existing systems?
-   Why does decentralization matter here?
-   What experience will make blockchain invisible yet beneficial to them?

The goal is to design DApps that are **useful**, **usable**, and **meaningful** — not just technically **“on-chain.”**

To illustrate, we’ll apply these steps to building a token swap DApp similar to a decentralized exchange (DEX).

---

### Step 1 — Empathize

Here, your users are DeFi participants who:

-   Provide liquidity to TokenA–TokenB pools.

-   Want to view balances and pool reserves.

-   Need a simple interface to swap tokens.

Their frustrations:

-   Complex DEX interfaces.

-   Poor visibility of pool data.

-   Transactions failing without explanation.

Your mission: **make token interactions simple, transparent, and intuitive**.

### Step 2 — Define the Problem

Formulate a **clear problem statement**.

> “Users need an easy way to view token balances, check pool reserves, and swap tokens without dealing with blockchain complexity”

This statement defines both **what** the DApp must do and **how** it should feel to use — simple, clear, and trustworthy.

### Step 3 — Ideate

Now brainstorm possible solutions.

-   Should balances and reserves appear in separate tabs or panels?
-   How can we make swap inputs and actions self-explanatory?
-   What visual layout communicates token flow best?

Sketch your layout before coding.
The goal is to **translate the user’s workflow into an intuitive UI**.

### Step 4 — Prototype

In this phase, we create a **mock-up** of our DApp — a visual and structural representation of the final product.

At this stage, **no blockchain logic** is included. The purpose is purely to design the interface and define how users will interact with the application.

**What to Expect at This Step**

-   You will create the **layout and structure** of the DApp using React and Material UI.
-   The DApp will include **two main sections**:

    **Liquidity Pool Section**

    -   Displays token addresses, user balances, and pool reserves.
    -   Includes a "Check" button that will later refresh these values from the blockchain.

    **Token Swap Section**

    -   Allows users to enter amounts for TokenA or TokenB.
    -   Includes “Buy” and “Sell” buttons that will later trigger swap transactions.

-   All data at this point will be **hardcoded** — this is intentional.  
    It allows us to focus on **user experience and flow** before integrating live data.

**Purpose of This Step**

-   To visualize the DApp layout before coding the blockchain interactions.
-   To confirm that the user interface matches what users expect.
-   To identify any usability issues early, before smart contract integration.

This **mock-up** serves as the foundation for the lab exercise, where you will implement the actual functionality to connect to MetaMask, query token balances, and execute swaps.

### Step 5 — Test (with Users)

Once your mock-up runs in the browser, gather **user feedback** before coding blockchain logic.

Ask:

-   Is the layout clear?
-   Do labels and sections make sense?
-   Would users know what to click to swap?

Iterate on the UI based on feedback before integrating contracts.  
Design Thinking treats testing as continuous — not a one-time phase.

---

### Integrating Blockchain Logic (Post-Mock-up Phase)

After validating your UI, you’ll incrementally add blockchain functionality:

1. **Connect wallet (MetaMask)**  
   Use `window.ethereum` and `ethers.js` to connect and get the user’s address.

2. **Read token balances and reserves**

    - Load ERC-20 balances with `contract.balanceOf(userAddress)`.
    - Query Uniswap-like pool contracts for reserves.

3. **Update the “Check” button**  
   Replace mock data with live blockchain values.

4. **Implement Buy/Sell (Swap)**
    - Call the `swap()` function of your DEX contract.
    - Handle transaction states and show feedback using `CircularProgress` or alerts.

---

## Implementing the DApp

The lab for this lesson are organized into multiple parts to help you build the DApp step-by-step.

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
e) Complete the DApp to allow token swaps
