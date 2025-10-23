# ERC721 NFT Standard

In this lesson, we will learn how to implement the ERC721 token standard, which is the most widely used standard for creating Non-Fungible Tokens (NFTs) on Ethereum. This lesson assumes familiarity with basic Solidity syntax and ERC20 token concepts.

---

## 1. Introduction to NFTs and ERC721

A Non-Fungible Token (NFT) is a unique digital asset that represents ownership of a specific item or piece of content on the blockchain. Unlike ERC20 tokens where all tokens are identical and interchangeable (fungible), each NFT is unique and cannot be replaced by another token.

Think of NFTs like:

- A house deed - each property is unique
- A concert ticket - each seat is different
- A piece of art - each artwork is one-of-a-kind

ERC721 is the standard that defines how NFTs work on Ethereum. The official specification can be found here **https://eips.ethereum.org/EIPS/eip-721**.

Common use cases for NFTs include:

- Digital art and collectibles
- Gaming items and characters
- Real estate records
- Event tickets
- Domain names
- Certificates and credentials

**Key Difference: ERC20 vs ERC721**

| Feature  | ERC20                | ERC721                   |
| -------- | -------------------- | ------------------------ |
| Type     | Fungible             | Non-Fungible             |
| Identity | All tokens identical | Each token unique        |
| Value    | Same for all tokens  | Different for each token |
| Example  | Currency, shares     | Art, collectibles        |

---

## 2. ERC721 Core Concepts

### Token ID

Each NFT is identified by a unique `tokenId` which is a `uint256` number. This tokenId is like a serial number that distinguishes one NFT from another within the same contract.

```solidity
// Example: tokenId can be any number
// tokenId: 1 -> represents one unique NFT
// tokenId: 2 -> represents a different unique NFT
```

### Ownership Tracking

The contract maintains a mapping that tracks which address owns which tokenId:

```solidity
mapping(uint256 => address) private _owners;
```

### Balance Tracking

Unlike ERC20 which tracks the amount of tokens, ERC721 tracks the count of how many NFTs each address owns:

```solidity
mapping(address => uint256) private _balances;
```

---

## 3. ERC721 Required Functions

According to the ERC721 specification, a compliant NFT contract must implement:

- **Read-Only Functions**

    ```solidity
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 _tokenId) external view returns (string memory);
    ```

- **State-Changing Functions**

    ```solidity
    function approve(address _approved, uint256 _tokenId) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function setApprovalForAll(address _operator, bool _approved) external;
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
    function transferFrom(address _from, address _to, uint256 _tokenId) external;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external;
    ```

- **Required Events**

    ```solidity
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
    ```

---

## 4. Key Function Explanations

### balanceOf()

Returns how many NFTs an address owns (count, not which specific tokens).

```solidity
function balanceOf(address _owner) external view returns (uint256)
```

### ownerOf()

Returns the address that owns a specific tokenId.

```solidity
function ownerOf(uint256 _tokenId) external view returns (address)
```

### tokenURI()

Returns a URL or URI that points to metadata about the NFT (image, description, properties). This metadata is typically stored off-chain in JSON format.

```solidity
function tokenURI(uint256 _tokenId) external view returns (string memory)
```

**Example metadata JSON:**

```json
{
    "name": "My NFT #1",
    "description": "A unique digital collectible",
    "image": "https://example.com/nft/1.png",
    "attributes": [
        { "trait_type": "Color", "value": "Blue" },
        { "trait_type": "Rarity", "value": "Common" }
    ]
}
```

### approve()

Allows the owner to approve another address to transfer a specific tokenId.

```solidity
function approve(address _approved, uint256 _tokenId) external
```

### transferFrom()

Transfers an NFT from one address to another. Can be called by the owner or approved address.

```solidity
function transferFrom(address _from, address _to, uint256 _tokenId) external
```

---

## 🛠️ Lab Practice: Create DemoNFT

In this lab, we will implement an ERC721-compliant NFT contract from scratch called **DemoNFT** with the following specifications:

> - Name: DemoNFT
> - Symbol: DNFT
> - Initial Supply: 0 (NFTs will be minted individually)

1. **Install project dependencies**

    ```bash
    cd /workspace/day-5/17-nft
    npm i
    ```

2. **Create package.json**

    If package.json doesn't exist, create it:

    **package.json**

    ```json
    {
        "name": "nft-basic",
        "version": "1.0.0",
        "main": "index.js",
        "scripts": {
            "clean": "rm -rf artifacts cache node_modules"
        },
        "keywords": [],
        "author": "",
        "license": "ISC",
        "description": "",
        "devDependencies": {
            "@nomicfoundation/hardhat-ethers": "3.0.8",
            "chai": "^6.0.1",
            "ethers": "6.13.2",
            "hardhat": "2.22.15"
        },
        "dependencies": {
            "@openzeppelin/contracts": "5.4.0"
        }
    }
    ```

3. **Create hardhat.config.js**

    **hardhat.config.js**

    ```js
    require("@nomicfoundation/hardhat-ethers");
    module.exports = {
        solidity: "0.8.20",
    };
    ```

4. **Install dependencies**

    ```bash
    npm i
    ```

5. **Create DemoNFT contract**

    Create a new folder named `contracts` and create a file named `DemoNFT.sol` in it.

    **contracts/DemoNFT.sol**

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity 0.8.20;

    contract DemoNFT {
        string private _name;
        string private _symbol;
        uint256 private _tokenIdCounter;

        mapping(uint256 => address) private _owners;
        mapping(address => uint256) private _balances;
        mapping(uint256 => address) private _tokenApprovals;

        event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
        event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

        constructor(string memory name_, string memory symbol_) {
            _name = name_;
            _symbol = symbol_;
            _tokenIdCounter = 0;
        }
    }
    ```

    The contract contains the following state variables:
    - `_name`: a string variable to store the NFT collection name
    - `_symbol`: a string variable to store the NFT collection symbol
    - `_tokenIdCounter`: a counter to track the next tokenId to mint
    - `_owners`: a mapping to store which address owns which tokenId
    - `_balances`: a mapping to store how many NFTs each address owns
    - `_tokenApprovals`: a mapping to store which address is approved to transfer each tokenId

6. **Insert the read-only functions**

    Insert the following read-only functions into your contract:

    ```solidity

    // ERC721 Read-only functions

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "ERC721: address zero is not a valid owner");
        return _balances[owner];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "ERC721: invalid token ID");
        return owner;
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        require(_owners[tokenId] != address(0), "ERC721: invalid token ID");
        return _tokenApprovals[tokenId];
    }

    ```

7. **Insert the mint function**

    Insert the mint function into your contract. This function creates a new NFT and assigns it to an address.

    ```solidity

    // Mint function

    function mint(address to) public returns (uint256) {
        require(to != address(0), "ERC721: mint to the zero address");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);

        return tokenId;
    }

    ```

    **Note:** Minting an NFT is represented by a Transfer event from the zero address (address(0)) to the recipient.

8. **Insert state-changing functions**

- **approve()** This function allows the owner of a tokenId to approve another address to transfer the NFT.

    ```solidity

    // approve: Approve _approved to transfer _tokenId

    function approve(address approved, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner, "ERC721: approve caller is not token owner");

        _tokenApprovals[tokenId] = approved;
        emit Approval(owner, approved, tokenId);
    }

    ```

- **transferFrom()** This function transfers an NFT from one address to another. It can be called by the owner or an approved address.

    ```solidity

    // transferFrom: Transfer _tokenId from _from to _to

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: caller is not token owner or approved");
        require(ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");

        // Clear approvals
        _tokenApprovals[tokenId] = address(0);

        // Transfer ownership
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    ```

- **\_isApprovedOrOwner()** This is an internal helper function to check if an address is the owner or approved to manage a tokenId.

    ```solidity

    // Internal helper function

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender);
    }

    ```

9. **Compile the contract**

    Compile the contract using Hardhat:

    ```bash
    hh compile
    ```

10. **Create test file**

    Create a new folder named `test` and create a file named `testDemoNFT.js` in it.

    **test/testDemoNFT.js**

    ```js
    const { expect } = require("chai");

    describe("Test DemoNFT", () => {
        let nft;
        let accounts;

        beforeEach(async () => {
            accounts = await ethers.getSigners();
            const factory = await ethers.getContractFactory("DemoNFT");
            nft = await factory.deploy("DemoNFT", "DNFT");
        });

        it("Should have correct name and symbol", async () => {
            expect(await nft.name()).to.equal("DemoNFT");
            expect(await nft.symbol()).to.equal("DNFT");
        });

        it("Should mint NFT to account[0]", async () => {
            await nft.mint(accounts[0].address);
            const balance = await nft.balanceOf(accounts[0].address);
            expect(balance).to.equal(1n);
        });

        it("Should return correct owner of tokenId", async () => {
            await nft.mint(accounts[0].address);
            const owner = await nft.ownerOf(0);
            expect(owner).to.equal(accounts[0].address);
        });
    });
    ```

11. **Run the tests**

    Run the tests using Hardhat:

    ```bash
    hh test
    ```

    You should see the following output:

    ```
      Test DemoNFT
         Should have correct name and symbol (XXms)
         Should mint NFT to account[0] (XXms)
         Should return correct owner of tokenId (XXms)
        3 passing (XXms)
    ```

---

## 5. NFT Transfer Mechanics

### Minting NFTs

When an NFT is minted, a new tokenId is created and assigned to an owner:

```js
// Mint tokenId 0 to Alice
await nft.mint(alice.address);
```

**Internal state changes:**

- `_owners[0] = alice.address`
- `_balances[alice.address] = 1`
- Emits: `Transfer(address(0), alice.address, 0)`

### Direct Transfer

The owner can directly transfer their NFT to another address:

```js
// Alice transfers tokenId 0 to Bob
await nft.connect(alice).transferFrom(alice.address, bob.address, 0);
```

**Internal state changes:**

- `_owners[0] = bob.address`
- `_balances[alice.address] -= 1`
- `_balances[bob.address] += 1`
- Emits: `Transfer(alice.address, bob.address, 0)`

### Approved Transfer

The owner can approve another address to transfer their NFT:

```js
// Alice approves Bob to transfer tokenId 0
await nft.connect(alice).approve(bob.address, 0);

// Bob transfers tokenId 0 from Alice to Charlie
await nft.connect(bob).transferFrom(alice.address, charlie.address, 0);
```

This pattern is useful for:

- NFT marketplaces (owner approves marketplace contract)
- Escrow services
- Auction contracts

---

## 🛠️ Lab Practice: NFT Transfer

1. **Add test for mint()**

    Add a test that mints multiple NFTs and checks the balance:

    ```js
    it("Should mint multiple NFTs", async () => {
        await nft.mint(accounts[0].address);
        await nft.mint(accounts[0].address);
        await nft.mint(accounts[0].address);

        const balance = await nft.balanceOf(accounts[0].address);
        expect(balance).to.equal(3n);
    });
    ```

2. **Add test for transferFrom()**

    Add a test for direct transfer of an NFT:

    ```js
    it("Should transfer NFT from accounts[0] to accounts[1]", async () => {
        await nft.mint(accounts[0].address);

        const beforeBalance0 = await nft.balanceOf(accounts[0].address);
        const beforeBalance1 = await nft.balanceOf(accounts[1].address);

        await nft.transferFrom(accounts[0].address, accounts[1].address, 0);

        const afterBalance0 = await nft.balanceOf(accounts[0].address);
        const afterBalance1 = await nft.balanceOf(accounts[1].address);

        expect(beforeBalance0 - 1n).to.equal(afterBalance0);
        expect(beforeBalance1 + 1n).to.equal(afterBalance1);
        expect(await nft.ownerOf(0)).to.equal(accounts[1].address);
    });
    ```

3. **Add test for approve() and transferFrom()**

    Add a test for approved transfer:

    ```js
    it("Should approve and transfer NFT", async () => {
        await nft.mint(accounts[0].address);

        await nft.connect(accounts[0]).approve(accounts[1].address, 0);

        const approved = await nft.getApproved(0);
        expect(approved).to.equal(accounts[1].address);

        await nft
            .connect(accounts[1])
            .transferFrom(accounts[0].address, accounts[2].address, 0);

        expect(await nft.ownerOf(0)).to.equal(accounts[2].address);
    });
    ```

4. **Run the tests**

    ```bash
    hh test
    ```

    You should see:

    ```
      Test DemoNFT
         Should have correct name and symbol (XXms)
         Should mint NFT to account[0] (XXms)
         Should return correct owner of tokenId (XXms)
         Should mint multiple NFTs (XXms)
         Should transfer NFT from accounts[0] to accounts[1] (XXms)
         Should approve and transfer NFT (XXms)
        6 passing (XXms)
    ```

---

## 6. OpenZeppelin ERC721 Implementation

Just like with ERC20, manually implementing ERC721 from scratch is good for learning but not recommended for production. OpenZeppelin provides a battle-tested implementation that includes additional safety features and optimizations.

OpenZeppelin's ERC721 contract includes:

- All required ERC721 functions
- Safe transfer checks
- URI storage helpers
- Enumerable extension (to list all tokens)
- Burnable extension (to destroy tokens)

## 🛠️ Lab Practice: Using OpenZeppelin ERC721

1. **Install OpenZeppelin package**

    If not already installed:

    ```bash
    npm i @openzeppelin/contracts@5.4.0
    ```

2. **Create DemoNFT with OpenZeppelin**

    Create a new file `contracts/DemoNFTOpenZeppelin.sol`:

    **contracts/DemoNFTOpenZeppelin.sol**

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity 0.8.20;

    import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

    contract DemoNFTOpenZeppelin is ERC721 {
        uint256 private _tokenIdCounter;

        constructor() ERC721("DemoNFT", "DNFT") {
            _tokenIdCounter = 0;
        }

        function mint(address to) public returns (uint256) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _safeMint(to, tokenId);
            return tokenId;
        }
    }
    ```

    **Note:** OpenZeppelin uses `_safeMint()` instead of regular minting. This function checks if the recipient is a contract and if so, verifies that it can handle NFTs properly.

3. **Create test file**

    Create `test/testDemoNFTOpenZeppelin.js`:

    **test/testDemoNFTOpenZeppelin.js**

    ```js
    const { expect } = require("chai");

    describe("Test DemoNFTOpenZeppelin", () => {
        let nft;
        let accounts;

        beforeEach(async () => {
            accounts = await ethers.getSigners();
            const factory = await ethers.getContractFactory(
                "DemoNFTOpenZeppelin"
            );
            nft = await factory.deploy();
        });

        it("Should have correct name and symbol", async () => {
            expect(await nft.name()).to.equal("DemoNFT");
            expect(await nft.symbol()).to.equal("DNFT");
        });

        it("Should mint NFT to account[0]", async () => {
            await nft.mint(accounts[0].address);
            const balance = await nft.balanceOf(accounts[0].address);
            expect(balance).to.equal(1n);
        });

        it("Should transfer NFT", async () => {
            await nft.mint(accounts[0].address);
            await nft.transferFrom(accounts[0].address, accounts[1].address, 0);
            expect(await nft.ownerOf(0)).to.equal(accounts[1].address);
        });
    });
    ```

4. **Run the tests**

    ```bash
    hh test test/testDemoNFTOpenZeppelin.js
    ```

---

## 7. NFT Metadata with IPFS

One of the most important features of NFTs is their metadata - the information that describes what the NFT represents. This typically includes:

- Name of the NFT
- Description
- Image or media file
- Attributes or properties

### Why Use IPFS for NFT Metadata?

Storing large files directly on the blockchain is:

- **Expensive**: Every byte costs gas fees
- **Inefficient**: Blockchains are not designed for large file storage
- **Impractical**: Images, videos, and other media files are too large

Instead, NFTs use off-chain storage solutions like IPFS (InterPlanetary File System) to store:

- The actual digital asset (image, video, audio, etc.)
- The metadata JSON file describing the NFT

The blockchain only stores:

- The ownership information (who owns which token)
- A reference (URI) pointing to the off-chain metadata

### How IPFS Works with NFTs

IPFS is a peer-to-peer distributed file system where files are identified by their content (not location). Each file gets a unique Content Identifier (CID) based on its content.

**Example:**

```
File content → Hash function → CID: QmYi7wrRFKVCcTB56A6Pep2j31Q5mHfmmu21RzHXu25RVR
```

Benefits of using IPFS:

- **Decentralized**: No single point of failure
- **Permanent**: Content-addressed, not location-addressed
- **Verifiable**: CID guarantees content integrity
- **Cost-effective**: Free to use, no blockchain storage costs

### NFT Metadata Structure

NFT metadata follows a standard JSON format:

```json
{
    "name": "Cool NFT #1",
    "description": "A unique digital collectible",
    "image": "ipfs://QmX...ABC/image.png",
    "attributes": [
        { "trait_type": "Color", "value": "Blue" },
        { "trait_type": "Rarity", "value": "Rare" }
    ]
}
```

The `tokenURI` in your smart contract points to this JSON file on IPFS:

```solidity
function tokenURI(uint256 tokenId) public view returns (string memory) {
    return string(abi.encodePacked("ipfs://", _tokenURIs[tokenId]));
}
```

---

## 🛠️ Lab Practice: NFT with IPFS Metadata

In this lab, we will create an NFT that stores its metadata and images on IPFS. We will:

1. Prepare NFT images
2. Upload images to IPFS
3. Create metadata JSON files
4. Upload metadata to IPFS
5. Mint NFTs with IPFS URIs

📌 Run the following in **Windows Terminal or terminal for Linux/Mac**

### Step 1: Set Up IPFS

Follow the steps from lesson 16 - [IPFS](../16-ipfs/README.md) to install and start up your IPFS daemon.

### Step 2: Upload Images to IPFS

Under the `assets/images` directory, you will find three images:

- blue-dragon.png
- red-phoenix.png
- green-turtle.png

These images will be used for our NFTs.

1. **Navigate to the images directory**

    ```bash
    cd ~/course/FIN556/day-5/17-nft/assets/images
    ```

2. **Add images to IPFS**

    ```bash
    ipfs add blue-dragon.png
    ipfs add green-turtle.png
    ipfs add red-phoenix.png

        # Sample Output:
        # added QmcYcWq82KHsaZK3Ze15s4kt95zkZyj8smTcm6mQfoPMD8 blue-dragon.png
        # added QmdsnZMfRiCpKrCBToNwMzxMe6xKFucWLF2uatYWPwrAbi red-phoenix.png
        # added QmWdktpwmLZfxvXTo45zNnu4UyiBTRUcNAJpAMfF9wDVFp green-turtle.png
    ```

    **Save these CIDs! You will need them for the metadata files.**

3. **Verify upload via local gateway**

    Open your browser and check:

    ```bash
    http://localhost:48080/ipfs/<CID>

     # Example:
     # http://127.0.0.1:48080/ipfs/QmcYcWq82KHsaZK3Ze15s4kt95zkZyj8smTcm6mQfoPMD8
    ```

4. **Check public IPFS gateway**

    Force announcement to the IPFS network:

    ```bash
    ipfs routing provide <CID>
    # Example:
    #  ipfs routing provide QmcYcWq82KHsaZK3Ze15s4kt95zkZyj8smTcm6mQfoPMD8
    ```

    Open the browser to check the files via a public IPFS gateway:

    ```bash
    https://dweb.link/ipfs/<CID>

    # Example:
    # https://dweb.link/ipfs/QmcYcWq82KHsaZK3Ze15s4kt95zkZyj8smTcm6mQfoPMD8
    ```

### Step 3: Upload Metadata Files

Under the `assets/metadata` directory, we will find three JSON files to create:

- blue-dragon.json
- red-phoenix.json
- green-turtle.json

Upload these metadata files to IPFS and save their CIDs for minting NFTs later.

1. **Navigate to metadata directory**

    ```bash
    cd ~/course/FIN556/day-5/17-nft/assets/metadata
    ```

2. **Add metadata files to IPFS**

    ```bash
    ipfs add blue-dragon.json
    ipfs add green-turtle.json
    ipfs add red-phoenix.json

        # Sample Output:
        # added QmeRo8MrBWHRADr2UB6H3Mu7mPHgUvEzGb6mF2pesHCeEU blue-dragon.json
        # added QmUVRhto3YzhnazJPTEpqjF7yZgH4EQv7iMGgyfWnHyVkC green-turtle.json
        # added Qma8SAwuDMJCZtAkgRxLqn2gGCLzez6ZZqJYF932CZTo7b red-phoenix.json
    ```

    **Save these metadata CIDs! You will use them when minting NFTs.**

3. **Verify metadata via local gateway**

    Open your browser and check:

    ```
    http://localhost:48080/ipfs/<METADATA_CID>
    ```

4. **Check public IPFS gateway**

    Force announcement to the IPFS network:

    ```bash
    ipfs routing provide <CID>
    ```

    Open the browser to check the files via a public IPFS gateway:

    ```bash
    https://dweb.link/ipfs/<CID>
    ```

### Step 4: Create NFT Contract with IPFS Support

📌 Run the following **from devcontainer in Visual Studio Code**

1. **Create IPFSStorageNFT contract**

    Create `contracts/IPFSStorageNFT.sol`:

    **contracts/IPFSStorageNFT.sol**

    ```solidity
    // SPDX-License-Identifier: MIT
    pragma solidity 0.8.20;

    import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";

    contract IPFSStorageNFT is ERC721URIStorage, Ownable {
        uint256 private _tokenIdCounter;

        constructor() ERC721("IPFSStorageNFT", "IPFS") Ownable(msg.sender) {
            _tokenIdCounter = 0;
        }

        function mint(address to, string memory ipfsCID) public onlyOwner returns (uint256) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;

            _safeMint(to, tokenId);

            // Store the IPFS CID as the token URI
            string memory uri = string(abi.encodePacked("ipfs://", ipfsCID));
            _setTokenURI(tokenId, uri);

            return tokenId;
        }

        function totalSupply() public view returns (uint256) {
            return _tokenIdCounter;
        }
    }
    ```

2. **Compile the contract**

    ```bash
    hh compile
    ```

### Step 5: Create Tests

1. **Create test file**

    Create `test/testIPFSStorageNFT.js`:

    **test/testIPFSStorageNFT.js**

    ```js
    const { expect } = require("chai");

    describe("Test IPFSStorageNFT", () => {
        let nft;
        let owner;
        let addr1;

        beforeEach(async () => {
            [owner, addr1] = await ethers.getSigners();
            const factory = await ethers.getContractFactory("IPFSStorageNFT");
            nft = await factory.deploy();
        });

        it("Should have correct name and symbol", async () => {
            expect(await nft.name()).to.equal("IPFSStorageNFT");
            expect(await nft.symbol()).to.equal("IPFS");
        });

        it("Should mint NFT with IPFS URI", async () => {
            const cid = "QmeRo8MrBWHRADr2UB6H3Mu7mPHgUvEzGb6mF2pesHCeEU";
            await nft.mint(addr1.address, cid);

            expect(await nft.balanceOf(addr1.address)).to.equal(1n);
            expect(await nft.ownerOf(0)).to.equal(addr1.address);
            expect(await nft.tokenURI(0)).to.equal(`ipfs://${cid}`);
        });

        it("Should mint multiple NFTs with different IPFS CIDs", async () => {
            const cids = [
                "QmeRo8MrBWHRADr2UB6H3Mu7mPHgUvEzGb6mF2pesHCeEU",
                "QmUVRhto3YzhnazJPTEpqjF7yZgH4EQv7iMGgyfWnHyVkC",
                "Qma8SAwuDMJCZtAkgRxLqn2gGCLzez6ZZqJYF932CZTo7b",
            ];

            for (let i = 0; i < cids.length; i++) {
                await nft.mint(addr1.address, cids[i]);
            }

            expect(await nft.totalSupply()).to.equal(3n);
            expect(await nft.balanceOf(addr1.address)).to.equal(3n);

            for (let i = 0; i < cids.length; i++) {
                expect(await nft.tokenURI(i)).to.equal(`ipfs://${cids[i]}`);
            }
        });
    });
    ```

2. **Run the tests**

    ```bash
    hh test test/testIPFSStorageNFT.js

     #    ✔ Should have correct name and symbol
     #    ✔ Should mint NFT with IPFS URI
     #    ✔ Should mint multiple NFTs with different IPFS CIDs
     #
     #
     #  3 passing (692ms)
    ```

### Step 5: Create Script to Deploy and Mint NFT

- **Create deployment script**

    Create `scripts/deploy-ipfs-nft.js`:

    **scripts/deploy-ipfs-nft.js**

    ```js
    const { ethers } = require("hardhat");

    async function main() {
        const factory = await ethers.getContractFactory("IPFSStorageNFT");
        const nft = await factory.deploy();
        await nft.waitForDeployment();
        console.log("IPFSStorageNFT deployed to:", nft.address);

        const [owner] = await ethers.getSigners();
        console.log("Deployer address:", owner.address);

        const cids = [
            "QmeRo8MrBWHRADr2UB6H3Mu7mPHgUvEzGb6mF2pesHCeEU",
            "QmUVRhto3YzhnazJPTEpqjF7yZgH4EQv7iMGgyfWnHyVkC",
            "Qma8SAwuDMJCZtAkgRxLqn2gGCLzez6ZZqJYF932CZTo7b",
        ];

        for (let i = 0; i < cids.length; i++) {
            await nft.mint(owner.address, cids[i]);
            console.log(`Minted NFT ${i} with CID: ${cids[i]}`);
        }
    }

    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
    ```

- **Run deployment script**

    ```bash
    node scripts/deploy-ipfs-nft.js --network localhost
    ```

### Step 6: Create Script to Retrieve Images from NFT

- **Create script**

    Create **scripts/retrieveNFTImage.js**:

    **syntax**

    ```bash
    node scripts/retrieveNFTImage.js <NFT_CONTRACT_ADDRESS> <NFT_ID> <OUTPUT_FILE>
    ```

    **scripts/retrieveNFTImage.js**

    ```js
    const { ethers } = require("hardhat");
    const fs = require("fs");
    const axios = require("axios");
    const IPFSStorageNFTABI = [
        "function tokenURI(uint256 tokenId) public view returns (string memory)",
    ];
    async function main() {
        const [, , nftAddress, nftId, outputFile] = process.argv;

        if (!nftAddress || !nftId || !outputFile) {
            console.error(
                "Usage: node retrieve-nft-image.js <NFT_CONTRACT_ADDRESS> <NFT_ID> <OUTPUT_FILE>"
            );
            process.exit(1);
        }

        const nftContract = await ethers.getContractAt(
            IPFSStorageNFTABI,
            nftAddress
        );
        const tokenURI = await nftContract.tokenURI(nftId);

        if (!tokenURI.startsWith("ipfs://")) {
            console.error("Token URI is not an IPFS URI");
            process.exit(1);
        }

        const cid = tokenURI.replace("ipfs://", "");
        const metadataUrl = `https://dweb.link/ipfs/${cid}`;

        const metadataResponse = await axios.get(metadataUrl);
        const imageIpfsUri = metadataResponse.data.image;

        if (!imageIpfsUri.startsWith("ipfs://")) {
            console.error("Image URI is not an IPFS URI");
            process.exit(1);
        }

        const imageCid = imageIpfsUri.replace("ipfs://", "");
        const imageUrl = `https://dweb.link/ipfs/${imageCid}`;

        const imageResponse = await axios.get(imageUrl, {
            responseType: "arraybuffer",
        });
        fs.writeFileSync(outputFile, imageResponse.data);

        console.log(`Image saved to ${outputFile}`);
    }

    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
    ```

- **Run the script**

    In the example below, running the script will retrieve the image for NFT ID 0 from the deployed contract and save it to `image.png` in the current directory.

    ```bash
    hh run scripts/retrieveNFTImage.js <NFT_CONTRACT_ADDRESS> <NFT_ID> <OUTPUT_FILE>

    # Example:
    # hh run scripts/retrieveNFTImage.js 0xYourNFTContractAddress 0 ./image.png
    ```

---

## Quiz

1. What is the main difference between ERC20 and ERC721 tokens?

2. Does owning an NFT mean you own the underlying digital asset (e.g., image, video)? How can you prove this?
