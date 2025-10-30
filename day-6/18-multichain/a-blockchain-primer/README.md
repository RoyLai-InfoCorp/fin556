# MultiChain - Part 1

**NOTE:** This lesson must run entirely from the **terminal**(ie. Windows Terminal or the macOS Terminal application), not from within a **devcontainer.**

**NOTE:** This markdown makes extensive use **Mermaid Diagrams**. Please install Visual Studio Code extension **"Markdown Preview Mermaid Support"(bierner.markdown-mermaid)** and read this file in Preview mode.

## Purpose

This lesson builds upon the previous course on **Ethereum Blockchain and Solidity Programming**. Its objective is to expand your understanding of blockchain technology beyond Ethereum — to help you appreciate the **diversity of blockchain designs** and their relationship to the Bitcoin protocol, using MultiChain as the primary learning platform.

While blockchain technology was originally _created by techies for techies_, this lesson aims to present the underlying technical concepts in a clear and accessible way, so that even readers without a deep technical background can follow and gain meaningful insight into how blockchain systems work.

## 1. References

https://www.multichain.com/developers/
https://github.com/MultiChain/multichain

---

## 2. Blockchain Primer

### a) Double Spending Problem

Let’s begin by revisiting the fundamental problem that blockchains were designed to solve.

![double-spend](./img/double-spend.png)

At its core, every blockchain exists to prevent the double spending problem — the risk of the same digital asset being spent more than once.

Unlike in the physical world, where money or goods cannot be duplicated, digital data can be copied and sent repeatedly. For example, you can easily send the same email to both Alice and Bob at the same time.

However, this is unacceptable in a payment system. If you only have ten dollars, you must be able to send it to either Bob or Alice — but never both. Ensuring this rule is enforced without relying on a central authority is precisely the challenge that blockchain technology addresses.

![burglar](./img/burglar.png)

The conventional solution to the **double spending problem** is to rely on a **trusted third party** that maintains a **centralized ledger** to record and verify all transactions. This ledger keeps track of each participant’s balance, ensuring that the same funds cannot be spent twice.

However, this approach introduces a critical limitation — **lack of transparency**. Users cannot independently verify everyone’s balances and must therefore trust that the central authority is managing accounts honestly and accurately.

While such trust is often taken for granted, it comes with inherent risks: if the trusted intermediary fails, becomes insolvent, or acts dishonestly, users may lose access to their funds.

![cent-dec](./img/cent-dec.png)

Examples of widely recognized trusted third parties include **central banks**, **commercial banks**, **cheque clearing houses**, **PayPal**, and **WeChat Pay**. These institutions are generally deemed reliable because society assumes that if you cannot trust them, _there is no one else you can_.
Yet, history has shown that even the most reputable entities are not immune to failure or mismanagement — reminding us that trust is not the same as certainty.

### b) Byzantine General's Problem.

Ideally, we want to solve the double spending problem without relying on trust or a centralized third party. This is known as a trustless system, and it represents the primary goal of blockchain technology.

However, achieving a truly trustless system is not straightforward. It requires addressing a fundamental challenge in distributed computing known as the Byzantine Generals Problem (BGP) — a classic computer science problem that illustrates the difficulty of achieving consensus among distributed nodes (or participants) that may fail, miscommunicate, or act maliciously.

**ELI5:**

-   Imagine you and your friends are playing a game where you have to attack and capture a castle. But there's a catch - you are all generals and you can only communicate with each other through messengers. Some of the generals might be traitors who want to ruin the game and give the wrong orders.

    ![bgp](./img/bgp.png)

-   The problem is that if the generals don't agree on the same plan and some follow the traitorous generals' orders while others follow the loyal ones, the attack will fail and everyone will lose the game.

-   So, how do you make sure that all the generals agree on a single plan, even if some of them are saying different things? This is the challenge known as the Byzantine General's Problem.

---

### c) Distributed Consensus Problem

In essence, the Byzantine Generals Problem highlights the difficulty of achieving agreement in a network where participants cannot fully trust one another.

Translating this challenge into real-world distributed systems reveals an even deeper problem: when one node communicates with another, it has no inherent way to verify whether the received message is correct, altered, or even genuine — unless there is a mechanism to cross-validate it with other nodes.

Moreover, in a distributed environment without a centralized clock or coordinator, it becomes impossible to know whether a missing message is simply delayed, never sent, or lost due to a network failure. This uncertainty can lead to issues such as missing, duplicated, or unverifiable messages — all of which complicate the process of maintaining a consistent and reliable state across the network.

---

### d) Mining

There are various approaches to solving the Byzantine Generals Problem (BGP), but most are cost-prohibitive and limited to small, low-latency networks with relatively few nodes. Each approach involves trade-offs, which will be discussed in the following sections.

Among these, **Bitcoin** stands out as the first system to achieve a _practical_, _global-scale_ solution to **BGP** using **commodity hardware**—representing a major breakthrough in decentralized consensus.

The security of Bitcoin’s peer-to-peer blockchain network depends on having sufficient nodes participating in the consensus process. To incentivize participation and protect the network from attacks, Bitcoin introduces an artificial reward mechanism that grants newly created coins to nodes that successfully publish a valid block to the blockchain.

This reward mechanism gave rise to the process known as mining, through which new bitcoins are created and network security is maintained. The underlying consensus protocol enabling this is known as **proof-of-work (PoW)**.

![miners](./img/miners.png)

### e) Validation

In a private blockchain, the risk of a Sybil attack is low because each node is authenticated and operated under centralized control. In such environments, the incentive to maintain and secure the network arises from the consortium’s shared business objectives rather than external economic rewards.

Consequently, there is no need for an artificial incentive mechanism like mining or for creating a native cryptocurrency to reward participants. Instead of relying on the proof-of-work (PoW) consensus used in public blockchains, authenticated networks typically employ a proof-of-authority (PoA) protocol, where trusted validators are pre-approved to create and verify blocks.

The term validator is not exclusive to private blockchains. For example, after the Merge, Ethereum transitioned from a PoW to a proof-of-stake (PoS) consensus model, in which validators replace miners. These validators are selected based on the amount of cryptocurrency they stake as collateral, earning rewards for honest participation and facing penalties for malicious behavior.

### f) Turing Completeness

In the world of blockchain, transactions can be compared to locks and keys in the physical world. Just as we use different types of locks and keys to secure valuables, blockchain networks use scripts—mathematical expressions that act as digital locks and keys—to secure and validate transactions.

![locks](./img/locks.png)

Each blockchain transaction is implemented using a mathematical lock, created through the scripting language defined by the protocol. The sender’s script acts as the lock, specifying the conditions required to spend the transaction, while the recipient’s script acts as the key, fulfilling those conditions to unlock the funds.

The **expressiveness** of this scripting language determines the blockchain’s Turing completeness—that is, whether it can represent any computation that a general-purpose computer can perform.

The rationale behind supporting or limiting Turing completeness lies in the trade-off between flexibility and security.

Non–Turing complete systems like Bitcoin emphasize simplicity and safety, while Turing complete systems like Ethereum emphasize programmability and flexibility, enabling complex decentralized applications but at the cost of increased risk of bugs and vulnerabilities.

-   **Non-Turing Complete**

    If the scripting language lacks constructs such as loops or conditional branching, the blockchain is non–Turing complete—as seen in Bitcoin.

    ![non-turing-complete](./img/non-turing-complete.png)

    A non–Turing complete blockchain can be thought of as a global calculator. It performs limited, well-defined operations using a restricted instruction set, which minimizes the potential for error and malicious behavior. While this restricts versatility, it enhances stability and predictability. These systems are ideal for specialized, transaction-focused use cases—and their continued success, as with Bitcoin, proves their lasting relevance.

-   **Turing Complete**

    Conversely, a blockchain is Turing complete if its scripting language supports constructs like loops and conditionals, as in Ethereum. Ethereum is often described as a global computer, capable of executing arbitrary code through smart contracts.

    This flexibility allows developers to build complex decentralized applications, but it also increases the risk of introducing vulnerabilities or inefficiencies into the system.

    Thus, while Turing complete systems enable innovation and diverse use cases, they demand greater care in design, testing, and execution.

-   **Side Note: Smart Contracts ≠ Turing Completeness**

    Although Ethereum’s Turing completeness enables sophisticated smart contracts, Turing completeness is not a prerequisite for smart contracts.

    Bitcoin, despite being non–Turing complete, has supported smart contracts since its inception. Its scripting system enables limited forms of programmability, such as multi-signature and time-locked transactions. These are still smart contracts—just simpler and more constrained in logic due to Bitcoin’s deliberately restricted scripting design.

---

### g) Private Blockchain vs Public Blockchain

The primary distinction between private and public blockchains is not about superiority but about the specific purpose each type is designed to serve. Public blockchains are open to anyone and prioritize decentralization, but this comes at the expense of speed and efficiency. In contrast, private blockchains restrict participation to authorized entities, offering improved performance, privacy, and control—making them more suitable for enterprise and consortium-based applications.

-   **Understanding the Trade-Offs**

    As explained [previously](#d-mining), the Byzantine Generals Problem (BGP) itself is not new. What distinguishes Bitcoin—the world’s first blockchain network—in solving BGP from other systems such as Boe777 lies in the conditions under which the problem is addressed.

    Understanding these underlying conditions is essential to grasping the design differences between private and public blockchains.

    There are multiple approaches to solving the Byzantine Generals Problem, and the chosen design depends on the trade-offs made across six key dimensions: Authentication, Permission, Synchrony, Latency, Fault Tolerance, and Consistency.

    -   **Authentication**

        Authentication is an essential aspect of distributed systems to ensure the validity and trustworthiness of the participating nodes. By authenticating nodes, we can verify their true identity and prevent unauthorized access or manipulation. Consensus protocols, which are crucial for achieving agreement among distributed nodes, often rely on voting mechanisms. By ensuring that authenticated nodes participate in the voting process, we can establish a more reliable and secure consensus in the system.

        ![santa](./img/santa.png)

        To illustrate this, let's consider an election scenario. On the day of the election, we all have to go to polling stations with our identity cards. Election officials validate our identity against our ID cards before allowing us to cast our vote. Now imagine what would happen if an election took place without any identity verification. How would you know who has voted, or if multiple votes are being cast by the same person? This is commonly known as a `Sybil's Attack`.

        ![agents](./img/agents.png)

        Sybil's Attack is a well-known attack in distributed systems where the attacker creates multiple fake identities (known as Sybil nodes) to gain control over the system or manipulate the results. By authenticating nodes, we can mitigate the risks associated with Sybil attacks and maintain the integrity of the system.

        In a public blockchain, there is no requirement for a login name and password. You simply download the blockchain client, connect to the internet, and run it. The protocol must be robust enough to manage consensus even without knowing the identities of participants.

        On the other hand, a private blockchain is less complex in the sense that it requires authentication of all nodes to prevent a single party from controlling multiple fake nodes.

    -   **Permission**

        Permission basically controls who has permission to join or leave the network or to perform other functions on the blockchain, such as creating transactions or participating in the consensus.

        A public blockchain can allow anyone to join or leave the network at any time, with no questions asked. This poses a huge challenge because you don't even know the electorate size to determine how many votes constitute a majority.

        ![anyone](./img/anyone.png)

        A private blockchain is less complicated in the sense that all nodes are authenticated, and only authenticated nodes have permission to join the network. This allows you to determine the electorate size and determine the majority votes much more easily.

    -   **Synchrony**

        ![timer](./img/timer.png)

        Synchrony refers to the ability to control communications between nodes in a synchronized manner.

        In a synchronous network, the timing and order of communication are controlled. This means you can determine the duration of the voting window and a cut-off time for the votes to be included in the vote counting process.

        In an asynchronous network, such as the public internet, there is no easy way to control this. Different nodes may be running under different performance or network conditions, so it's impossible to tell if a system has failed or if the system has voted based on a message that arrived later. This is particularly true when you have a large number of nodes from different geographical areas.

    -   **Latency**

        Latency refers to the delay in time it takes for a distributed system to reach a consensus. Latency is an important consideration in many theories involving distributed systems, such as the CAP theorem.

        Naturally, the longer the window, the easier it is to manage consensus between multiple systems. However, if the window is short, then achieving accurate consensus will require more synchrony among the components.

        In the case of Bitcoin, the average latency is around 10 minutes. This works for Bitcoin because the longer it takes to confirm, the more inefficiency is built into the protocol to prevent a 51% attack from happening.

        Compared to aircraft designs, you cannot afford to make a single mistake out of 1 billion transactions per hour (https://www.cs.indiana.edu/classes/p545/post/lec/fault-tolerance/Driscoll-Hall-Sivencrona-Xumsteg-03.pdf).

    -   **ELI5**

        -   Imagine you and your friends are building towers with blocks at different tables.

        -   Consistency means that whenever someone adds a block to their tower, everyone else's tower has to be updated right away. So if you add a block, all your friends' towers have to show the same thing immediately.

        -   Availability means that even if some of your friends' tables or towers are not accessible, they can still keep building on their own. So if one of your friends' tables is blocked, they can still add blocks to their tower without waiting for others.

        -   Partition tolerance means that even if you can't see or talk to some of your friends, you can keep building your own tower. If there's something blocking you from seeing or talking to them, you can still work independently.

        -   So basically, when it comes to building towers, you have to choose between making sure all the towers look the same right away (consistency), allowing your friends to keep building even if some of their stuff is not working (availability), or just keeping building your own tower no matter what (partition tolerance). Each choice has its pros and cons, and it depends on what's important to you and your friends.

-   **Public Blockchain Tradeoffs**

    The success of the Bitcoin protocol relies on certain trade-offs.

    -   Acceptance of a high latency of 10 minutes confirmation time.
    -   Multiple confirmations are usually required for transaction validity.
    -   Inability to guarantee consistency due to the risk of a 51% attack, although it is difficult to achieve.

    In return for these trade-offs, Bitcoin offers benefits such as:

    -   Solving the Byzantine General's problem without requiring identity and permission.
    -   Allowing nodes to span across the world on the public internet using cheap hardware.

    Bitcoin's trade-offs work because of its unique conditions and narrow use case.

    -   When Bitcoin was created, it appeared faster than the inefficient global correspondent banking system (SWIFT).

    -   To protect against the 51% attack, Bitcoin encourages a large number of nodes to participate by using an incentive mechanism.

    -   This led to the invention of the cryptocurrency Bitcoin, which rewards participating nodes.

    -   As more people believe in the security of Bitcoin, more join the network, making it more secure and fulfilling a self-fulfilling prophecy.

-   **Private Blockchain Tradeoffs**

    In a more sanitized business environment where nodes are authenticated and permissions are controlled, blockchain transitions from the public to the business world.

    The trade-offs are different in the business world.

    -   The need for high latency is reduced as the number of nodes is controlled.

    -   The risk of a 51% attack is reduced as the number of nodes is controlled.

    -   The need for an incentive mechanism is reduced as the number of nodes is controlled.

    In return for these trade-offs, private blockchains offer benefits such as:

    -   Identity and permission can be controlled.

    -   Consistency can be guaranteed.

    -   The need for an incentive mechanism is reduced.

    The trade-offs work because of the different conditions and use cases in the business world.

### h) Private Blockchain vs Traditional Database

A private blockchain is like a shared notebook where multiple businesses can write entries together. This is different from a traditional database, which is usually controlled by one organization. This shared setup of private blockchain is great for businesses working together because it creates a trusted and verifiable record.

A private blockchain also stops anyone from changing the records once they are written, which increases trust between businesses.

Even though regular databases can be faster than private blockchains, private blockchains have a built-in backup feature which makes them more reliable. This backup feature does not make the system more complicated. However, in traditional databases, creating similar backup systems can be complex and expensive.

## 5. Conclusion

This section is a review of basic blockchain and cryptocurrency concepts. In the next chapter, we will explore the functionalities of MultiChain both as a private blockchain as well as a derivative of the Bitcoin protocol and contrasting it to the concepts learnt from earlier lessons on Ethereum.