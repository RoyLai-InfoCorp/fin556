# ERC721 NFT 标准

在本课程中，我们将学习如何实现 ERC721 代币标准，这是以太坊上创建非同质化代币（NFT）最广泛使用的标准。本课程假设您熟悉基本的 Solidity 语法和 ERC20 代币概念。

---

## 1. NFT 和 ERC721 简介

非同质化代币（NFT）是一种独特的数字资产，代表区块链上特定物品或内容的所有权。与所有代币都相同且可互换（同质化）的 ERC20 代币不同，每个 NFT 都是唯一的，不能被另一个代币替代。

将 NFT 想象成：

- 房产契约 - 每个房产都是独特的
- 演唱会门票 - 每个座位都不同
- 艺术品 - 每件作品都是独一无二的

ERC721 是定义 NFT 在以太坊上如何工作的标准。官方规范可在 **https://eips.ethereum.org/EIPS/eip-721** 找到。

NFT 的常见用例包括：

- 数字艺术和收藏品
- 游戏物品和角色
- 房地产记录
- 活动门票
- 域名
- 证书和凭证

**主要区别：ERC20 与 ERC721**

| 特性  | ERC20                | ERC721                   |
| ---- | -------------------- | ------------------------ |
| 类型  | 同质化               | 非同质化                 |
| 身份  | 所有代币相同         | 每个代币唯一             |
| 价值  | 所有代币相同         | 每个代币不同             |
| 示例  | 货币、股票           | 艺术、收藏品             |

---

## 2. ERC721 核心概念

### 代币 ID

每个 NFT 都由一个唯一的 `tokenId` 标识，这是一个 `uint256` 数字。这个 tokenId 就像一个序列号，用于在同一合约内区分一个 NFT 与另一个 NFT。

```solidity
// 示例：tokenId 可以是任何数字
// tokenId: 1 -> 代表一个独特的 NFT
// tokenId: 2 -> 代表另一个不同的 NFT
```

### 所有权追踪

合约维护一个映射，用于追踪哪个地址拥有哪个 tokenId：

```solidity
mapping(uint256 => address) private _owners;
```

### 余额追踪

与追踪代币数量的 ERC20 不同，ERC721 追踪每个地址拥有的 NFT 数量：

```solidity
mapping(address => uint256) private _balances;
```

---

## 3. ERC721 必需函数

根据 ERC721 规范，合规的 NFT 合约必须实现：

-   **只读函数**

    ```solidity
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 _tokenId) external view returns (string memory);
    ```

-   **状态更改函数**

    ```solidity
    function approve(address _approved, uint256 _tokenId) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function setApprovalForAll(address _operator, bool _approved) external;
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
    function transferFrom(address _from, address _to, uint256 _tokenId) external;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external;
    ```

-   **必需事件**

    ```solidity
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
    ```

---

## 4. 关键函数说明

### balanceOf()

返回某个地址拥有的 NFT 数量（计数，而不是具体哪些代币）。

```solidity
function balanceOf(address _owner) external view returns (uint256)
```

### ownerOf()

返回拥有特定 tokenId 的地址。

```solidity
function ownerOf(uint256 _tokenId) external view returns (address)
```

### tokenURI()

返回指向 NFT 元数据（图像、描述、属性）的 URL 或 URI。这些元数据通常以 JSON 格式存储在链下。

```solidity
function tokenURI(uint256 _tokenId) external view returns (string memory)
```

**示例元数据 JSON：**

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

允许所有者批准另一个地址转移特定的 tokenId。

```solidity
function approve(address _approved, uint256 _tokenId) external
```

### transferFrom()

将 NFT 从一个地址转移到另一个地址。可以由所有者或已批准的地址调用。

```solidity
function transferFrom(address _from, address _to, uint256 _tokenId) external
```

---

## 🛠️ 实验实践：创建 DemoNFT

在本实验中，我们将从头开始实现一个符合 ERC721 标准的 NFT 合约，称为 **DemoNFT**，规格如下：

> - 名称：DemoNFT
> - 符号：DNFT
> - 初始供应量：0（NFT 将单独铸造）

1.  **安装项目依赖**

    ```bash
    cd /workspace/day-5/17-nft
    npm i
    ```

2.  **创建 package.json**

    如果 package.json 不存在，请创建它：

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

3.  **创建 hardhat.config.js**

    **hardhat.config.js**

    ```js
    require("@nomicfoundation/hardhat-ethers");
    module.exports = {
        solidity: "0.8.20",
    };
    ```

4.  **安装依赖**

    ```bash
    npm i
    ```

5.  **创建 DemoNFT 合约**

    创建一个名为 `contracts` 的新文件夹，并在其中创建一个名为 `DemoNFT.sol` 的文件。

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

    合约包含以下状态变量：
    - `_name`：存储 NFT 集合名称的字符串变量
    - `_symbol`：存储 NFT 集合符号的字符串变量
    - `_tokenIdCounter`：追踪下一个要铸造的 tokenId 的计数器
    - `_owners`：映射以存储哪个地址拥有哪个 tokenId
    - `_balances`：映射以存储每个地址拥有多少个 NFT
    - `_tokenApprovals`：映射以存储哪个地址被批准转移每个 tokenId

6.  **插入只读函数**

    将以下只读函数插入到您的合约中：

    ```solidity

    // ERC721 只读函数

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

7.  **插入铸造函数**

    将铸造函数插入到您的合约中。此函数创建一个新 NFT 并将其分配给一个地址。

    ```solidity

    // 铸造函数

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

    **注意：** 铸造 NFT 表示从零地址（address(0)）到接收者的 Transfer 事件。

8.  **插入状态更改函数**

-   **approve()** 此函数允许 tokenId 的所有者批准另一个地址转移 NFT。

    ```solidity

    // approve: 批准 _approved 转移 _tokenId

    function approve(address approved, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(msg.sender == owner, "ERC721: approve caller is not token owner");

        _tokenApprovals[tokenId] = approved;
        emit Approval(owner, approved, tokenId);
    }

    ```

-   **transferFrom()** 此函数将 NFT 从一个地址转移到另一个地址。可以由所有者或已批准的地址调用。

    ```solidity

    // transferFrom: 将 _tokenId 从 _from 转移到 _to

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: caller is not token owner or approved");
        require(ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");

        // 清除批准
        _tokenApprovals[tokenId] = address(0);

        // 转移所有权
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    ```

-   **\_isApprovedOrOwner()** 这是一个内部辅助函数，用于检查地址是否是所有者或被批准管理 tokenId 的地址。

    ```solidity

    // 内部辅助函数

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender);
    }

    ```

9.  **编译合约**

    使用 Hardhat 编译合约：

    ```bash
    hh compile
    ```

10. **创建测试文件**

    创建一个名为 `test` 的新文件夹，并在其中创建一个名为 `testDemoNFT.js` 的文件。

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

11. **运行测试**

    使用 Hardhat 运行测试：

    ```bash
    hh test
    ```

    您应该看到以下输出：

    ```
      Test DemoNFT
        ✔ Should have correct name and symbol (XXms)
        ✔ Should mint NFT to account[0] (XXms)
        ✔ Should return correct owner of tokenId (XXms)
        3 passing (XXms)
    ```

---

## 5. NFT 转移机制

### 铸造 NFT

铸造 NFT 时，会创建新的 tokenId 并分配给所有者：

```js
// 为 Alice 铸造 tokenId 0
await nft.mint(alice.address);
```

**内部状态更改：**

- `_owners[0] = alice.address`
- `_balances[alice.address] = 1`
- 发出：`Transfer(address(0), alice.address, 0)`

### 直接转移

所有者可以直接将他们的 NFT 转移给另一个地址：

```js
// Alice 将 tokenId 0 转移给 Bob
await nft.connect(alice).transferFrom(alice.address, bob.address, 0);
```

**内部状态更改：**

- `_owners[0] = bob.address`
- `_balances[alice.address] -= 1`
- `_balances[bob.address] += 1`
- 发出：`Transfer(alice.address, bob.address, 0)`

### 批准转移

所有者可以批准另一个地址转移他们的 NFT：

```js
// Alice 批准 Bob 转移 tokenId 0
await nft.connect(alice).approve(bob.address, 0);

// Bob 将 tokenId 0 从 Alice 转移给 Charlie
await nft.connect(bob).transferFrom(alice.address, charlie.address, 0);
```

此模式适用于：

- NFT 市场（所有者批准市场合约）
- 托管服务
- 拍卖合约

---

## 🛠️ 实验实践：NFT 转移

1.  **添加铸造测试**

    添加一个铸造多个 NFT 并检查余额的测试：

    ```js
    it("Should mint multiple NFTs", async () => {
        await nft.mint(accounts[0].address);
        await nft.mint(accounts[0].address);
        await nft.mint(accounts[0].address);

        const balance = await nft.balanceOf(accounts[0].address);
        expect(balance).to.equal(3n);
    });
    ```

2.  **添加转移测试**

    添加 NFT 直接转移的测试：

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

3.  **添加批准和转移测试**

    添加批准转移的测试：

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

4.  **运行测试**

    ```bash
    hh test
    ```

    您应该看到：

    ```
      Test DemoNFT
        ✔ Should have correct name and symbol (XXms)
        ✔ Should mint NFT to account[0] (XXms)
        ✔ Should return correct owner of tokenId (XXms)
        ✔ Should mint multiple NFTs (XXms)
        ✔ Should transfer NFT from accounts[0] to accounts[1] (XXms)
        ✔ Should approve and transfer NFT (XXms)
        6 passing (XXms)
    ```

---

## 6. OpenZeppelin ERC721 实现

就像 ERC20 一样，从头手动实现 ERC721 对学习很有好处，但不建议用于生产。OpenZeppelin 提供了经过实战测试的实现，包含额外的安全功能和优化。

OpenZeppelin 的 ERC721 合约包括：

- 所有必需的 ERC721 函数
- 安全转移检查
- URI 存储辅助函数
- 枚举扩展（列出所有代币）
- 可销毁扩展（销毁代币）

## 🛠️ 实验实践：使用 OpenZeppelin ERC721

1.  **安装 OpenZeppelin 包**

    如果尚未安装：

    ```bash
    npm i @openzeppelin/contracts@5.4.0
    ```

2.  **使用 OpenZeppelin 创建 DemoNFT**

    创建新文件 `contracts/DemoNFTOpenZeppelin.sol`：

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

    **注意：** OpenZeppelin 使用 `_safeMint()` 而不是常规铸造。此函数检查接收者是否是合约，如果是，则验证它是否可以正确处理 NFT。

3.  **创建测试文件**

    创建 `test/testDemoNFTOpenZeppelin.js`：

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

4.  **运行测试**

    ```bash
    hh test test/testDemoNFTOpenZeppelin.js
    ```

---

## 7. 使用 IPFS 的 NFT 元数据

NFT 最重要的特性之一是它们的元数据——描述 NFT 代表什么的信息。这通常包括：

- NFT 的名称
- 描述
- 图像或媒体文件
- 属性或特性

### 为什么使用 IPFS 存储 NFT 元数据？

直接在区块链上存储大文件：

- **昂贵**：每个字节都需要支付 gas 费用
- **效率低下**：区块链不是为存储大文件而设计的
- **不切实际**：图像、视频和其他媒体文件太大

相反，NFT 使用链下存储解决方案（如 IPFS（星际文件系统））来存储：

- 实际数字资产（图像、视频、音频等）
- 描述 NFT 的元数据 JSON 文件

区块链只存储：

- 所有权信息（谁拥有哪个代币）
- 指向链下元数据的引用（URI）

### IPFS 如何与 NFT 配合工作

IPFS 是一个点对点分布式文件系统，其中文件通过其内容（而非位置）进行标识。每个文件都会根据其内容获得唯一的内容标识符（CID）。

**示例：**

```
文件内容 → 哈希函数 → CID: QmYi7wrRFKVCcTB56A6Pep2j31Q5mHfmmu21RzHXu25RVR
```

使用 IPFS 的好处：

- **去中心化**：没有单点故障
- **永久性**：基于内容寻址，而非位置寻址
- **可验证性**：CID 保证内容完整性
- **成本效益**：免费使用，无需区块链存储成本

### NFT 元数据结构

NFT 元数据遵循标准 JSON 格式：

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

智能合约中的 `tokenURI` 指向 IPFS 上的此 JSON 文件：

```solidity
function tokenURI(uint256 tokenId) public view returns (string memory) {
    return string(abi.encodePacked("ipfs://", _tokenURIs[tokenId]));
}
```

---

## 🛠️ 实验实践：使用 IPFS 元数据的 NFT

在本实验中，我们将创建一个将其元数据和图像存储在 IPFS 上的 NFT。我们将：

1. 准备 NFT 图像
2. 将图像上传到 IPFS
3. 创建元数据 JSON 文件
4. 将元数据上传到 IPFS
5. 使用 IPFS URI 铸造 NFT

📌 在 **Windows Terminal 或 Linux/Mac 的终端**中运行以下步骤

### 步骤 1：设置 IPFS

请按照课程 16 - [IPFS](../16-ipfs/README.md) 中的步骤安装和启动您的 IPFS 守护进程。

### 步骤 2：将图像上传到 IPFS

在 `assets/images` 目录下，您将找到三张图像：

- blue-dragon.png
- red-phoenix.png
- green-turtle.png

这些图像将用于我们的 NFT。

1.  **导航到图像目录**

    ```bash
    cd ~/course/FIN556/day-5/17-nft/assets/images
    ```

2.  **将图像添加到 IPFS**

    ```bash
    ipfs add blue-dragon.png
    ipfs add green-turtle.png
    ipfs add red-phoenix.png

        # 示例输出：
        # added QmcYcWq82KHsaZK3Ze15s4kt95zkZyj8smTcm6mQfoPMD8 blue-dragon.png
        # added QmdsnZMfRiCpKrCBToNwMzxMe6xKFucWLF2uatYWPwrAbi red-phoenix.png
        # added QmWdktpwmLZfxvXTo45zNnu4UyiBTRUcNAJpAMfF9wDVFp green-turtle.png
    ```

    **保存这些 CID！您将需要它们用于元数据文件。**

3.  **通过本地网关验证上传**

    打开浏览器并检查：

    ```bash
    http://localhost:48080/ipfs/<CID>

     # 示例：
     # http://127.0.0.1:48080/ipfs/QmcYcWq82KHsaZK3Ze15s4kt95zkZyj8smTcm6mQfoPMD8
    ```

4.  **检查公共 IPFS 网关**

    强制宣布到 IPFS 网络：

    ```bash
    ipfs routing provide <CID>
    # 示例：
    #  ipfs routing provide QmcYcWq82KHsaZK3Ze15s4kt95zkZyj8smTcm6mQfoPMD8
    ```

    打开浏览器通过公共 IPFS 网关检查文件：

    ```bash
    https://dweb.link/ipfs/<CID>

    # 示例：
    # https://dweb.link/ipfs/QmcYcWq82KHsaZK3Ze15s4kt95zkZyj8smTcm6mQfoPMD8
    ```

### 步骤 3：上传元数据文件

在 `assets/metadata` 目录下，我们将找到三个要创建的 JSON 文件：

- blue-dragon.json
- red-phoenix.json
- green-turtle.json

将这些元数据文件上传到 IPFS 并保存它们的 CID 以便以后铸造 NFT。

1.  **导航到元数据目录**

    ```bash
    cd ~/course/FIN556/day-5/17-nft/assets/metadata
    ```

2.  **将元数据文件添加到 IPFS**

    ```bash
    ipfs add blue-dragon.json
    ipfs add green-turtle.json
    ipfs add red-phoenix.json

        # 示例输出：
        # added QmeRo8MrBWHRADr2UB6H3Mu7mPHgUvEzGb6mF2pesHCeEU blue-dragon.json
        # added QmUVRhto3YzhnazJPTEpqjF7yZgH4EQv7iMGgyfWnHyVkC green-turtle.json
        # added Qma8SAwuDMJCZtAkgRxLqn2gGCLzez6ZZqJYF932CZTo7b red-phoenix.json
    ```

    **保存这些元数据 CID！您将在铸造 NFT 时使用它们。**

3.  **通过本地网关验证元数据**

    打开浏览器并检查：

    ```
    http://localhost:48080/ipfs/<METADATA_CID>
    ```

4.  **检查公共 IPFS 网关**

    强制宣布到 IPFS 网络：

    ```bash
    ipfs routing provide <CID>
    ```

    打开浏览器通过公共 IPFS 网关检查文件：

    ```bash
    https://dweb.link/ipfs/<CID>
    ```

### 步骤 4：创建支持 IPFS 的 NFT 合约

📌 **从 Visual Studio Code 的 devcontainer 中运行以下步骤**

1.  **创建 IPFSStorageNFT 合约**

    创建 `contracts/IPFSStorageNFT.sol`：

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

            // 将 IPFS CID 存储为 token URI
            string memory uri = string(abi.encodePacked("ipfs://", ipfsCID));
            _setTokenURI(tokenId, uri);

            return tokenId;
        }

        function totalSupply() public view returns (uint256) {
            return _tokenIdCounter;
        }
    }
    ```

2.  **编译合约**

    ```bash
    hh compile
    ```

### 步骤 5：创建测试

1.  **创建测试文件**

    创建 `test/testIPFSStorageNFT.js`：

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

2.  **运行测试**

    ```bash
    hh test test/testIPFSStorageNFT.js

     #    ✔ Should have correct name and symbol
     #    ✔ Should mint NFT with IPFS URI
     #    ✔ Should mint multiple NFTs with different IPFS CIDs
     #
     #
     #  3 passing (692ms)
    ```

### 步骤 5：创建部署和铸造 NFT 的脚本

-   **创建部署脚本**

    创建 `scripts/deploy-ipfs-nft.js`：

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

-   **运行部署脚本**

    ```bash
    hh run scripts/deploy-ipfs-nft.js --network localhost
    ```

### 步骤 6：创建从 NFT 检索图像的脚本

-   **创建脚本**

    创建 **scripts/retrieveNFTImage.js**：

    **语法**

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

-   **运行脚本**

    在下面的示例中，运行脚本将从已部署的合约中检索 NFT ID 0 的图像，并将其保存到当前目录中的 `image.png`。

    ```bash
    hh run scripts/retrieveNFTImage.js <NFT_CONTRACT_ADDRESS> <NFT_ID> <OUTPUT_FILE>

    # 示例：
    # hh run scripts/retrieveNFTImage.js 0xYourNFTContractAddress 0 ./image.png
    ```

---

## 测验

1.  ERC20 和 ERC721 代币之间的主要区别是什么？

2.  拥有 NFT 是否意味着您拥有底层数字资产（例如图像、视频）？您如何证明这一点？
