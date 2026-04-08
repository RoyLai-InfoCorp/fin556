# MultiChain 命令行工具

## 1. 运行 `multichain-cli`

运行 multichain 命令行工具有两种方式：交互模式和命令行模式。

-   在之前的实验中，您已经了解了如何以**交互模式**运行 multichain 命令行工具。在交互模式下，multichain-cli 作为应用程序启动，带有控制台，您可以在其中输入命令并查看输出，同时保持在控制台中。这对于快速测试和实验很有用。

    ```sh
    multichain-cli chain1
    ```

-   另一种方式是以**命令行模式**运行 multichain-cli。在此模式下，您可以将命令和参数作为参数传递给 multichain-cli 应用程序。当您想将 multichain-cli 作为脚本或程序的一部分运行时，这很有用。

    ```sh
    multichain-cli chain1 getinfo
    ```

-   当您不带任何参数运行 multichain 命令行工具时，您将看到它可以接受的参数列表，以管理您想要运行 multichain 的方式。

    ```sh
    multichain-cli
    ```

---

## 2. 将复杂参数传递给 RPC API

使用命令行工具时需要注意的一个重要方面是复杂参数的传入和检索。

并不总是简单地将字符串作为参数传入。有时您可能需要传入一个由一组参数组成的对象。

### 传入 JSON 字符串

让我们考虑以下示例。

```
issue {replace-with-address} '{"name":"asset1","open":true}'
```

上述命令 `issue` 传入 2 个参数，对应以下内容：

-   第一个参数是一个字符串，表示向其发行资产的节点地址。

-   第二个参数是一种称为 JSON 字符串的特殊类型字符串。JSON 字符串是对象的字符串表示。在这种情况下，该对象由 2 个参数组成，即 `name` 和 `open` 参数。

### JSON 字符串作为结果

您会注意到，当您从 MultiChain 收到输出时，输出采用引号和括号的形式。

让我们参考下面实验-2 的示例输出。

![Sample Output](./img/lab2-4.png)

getinfo 命令以 JSON 字符串形式返回结果。在这种情况下，它是一个包含区块链当前状态的对象。

---

## 3. JSON 字符串

JSON 代表 JavaScript 对象表示法。因为不同的编程语言表示对象的方式各不相同，但它们通常共享一种共同的表示字符串的方式，JSON 通常用作将对象表示为字符串的标准格式。

JSON 字符串有两种类型：JSON 对象和 JSON 数组。

### JSON 对象

-   在 JSON 对象中，每个项目称为"键值对"（也称为字段、属性或特性）。
-   键表示项目的名称或标识符，而值表示与该键关联的实际内容或数据。
-   键值对用大括号 **{ ... }** 包围，并用逗号 (,) 分隔。
-   "键"始终表示为字符串。
-   "值"可以是双引号中的字符串，或数字，或 true 或 false 或 null，或对象或数组。这些结构可以嵌套。

例如，以下 json 对象包含 4 个键值对：name、age、car、married。

```json
{
    "name": "John",
    "age": 30,
    "car": null,
    "married": true
}
```

-   "name" 属性包含字符串 "John"。字符串用 ".."（双引号）包围。
-   "age" 属性包含数字 30。数值不用 ".."（双引号）包围。
-   "car" 属性包含 null 值。null 值用词 "null" 表示，不用 ".."（双引号）包围。
-   "married" 属性包含布尔值 true。布尔值是 true 或 false，不用 ".."（双引号）包围。

-   当 JSON 对象作为参数在控制台中传入时，它必须用单引号 **'...'** 包围，以防止 shell 将大括号解释为 shell 命令。

因此，传入 MultiChain RPC API 的最终 JSON 字符串如下所示

```sh
'{ "name":"John", "age":30, "car":null, "married":true }'
```

### JSON 数组

-   在 JSON 数组中，每个项目称为"元素"。
-   元素用方括号 **[...]** 包围，并用逗号 (,) 分隔。
-   元素可以是双引号中的字符串，或数字，或 true 或 false 或 null，或对象或数组。这些结构可以嵌套。

例如，以下 json 数组包含 3 个元素："Ford"、"BMW"、"Fiat"，表示汽车的制造商。

```json
["Ford", "BMW", "Fiat"]
```

要在控制台中传入 JSON 数组作为参数，必须用单引号 **'...'** 包围，以防止 shell 将方括号解释为 shell 命令。

因此，传入 MultiChain RPC API 的最终 JSON 字符串如下所示

```sh
'["Ford", "BMW", "Fiat"]'
```

### 复杂示例

在以下示例中，JSON 对象包含一个 JSON 数组。

```sh
'{"name": "John", "age": 30, "cars": ["Ford", "BMW", "Fiat"]}'
```

在以下示例中，一个 JSON 对象嵌套在另一个 JSON 对象中。

```sh
'{"name": "John", "age": 30, "cars": null, "address": { "street": "Main", "city": "New York"}}'
```

在以下示例中，json 数组可以包含多个 JSON 对象或 json 数组。

```sh
'[{"name": "John","age": 30},{"name": "Smith","age": 50},{"name": "Jane","age": 20}]'
```

### 重要

不要混淆 JSON 字符串中标点符号的使用。

" "（双引号）用于包围字符串。
' '（单引号）用于将 JSON 字符串作为一个整体包围。
{ }（大括号）用于包围 JSON 对象。
[ ]（方括号）用于包围 JSON 数组。
``（反引号）不能在 JSON 字符串中使用。

---

## 4. 基本 MultiChain 命令

### a. `getinfo` 命令

`getinfo` 命令返回一个包含有关节点区块链各种状态信息的对象。

**语法**

```sh
getinfo
```

调用 getinfo 的结果是一个具有以下字段的 JSON 对象：

```json
{
  "version": xxxxx,                 (numeric) 服务器版本
  "protocolversion": xxxxx,         (numeric) 协议版本
  "chainname": "xxxx",              (string) multichain 网络名称
  "description": "xxxx",            (string) 网络描述
  "protocol": "xxxx",               (string) 协议 - multichain 或 bitcoin
  "port": xxxx,                     (numeric) 网络端口
  "setupblocks": "xxxx",            (string) 网络设置区块数
  "walletversion": xxxxx,           (numeric) 钱包版本
  "balance": xxxxxxx,               (numeric) 钱包的总原生货币余额
  "walletdbversion": xxxxx,         (numeric) 钱包数据库版本
  "blocks": xxxxxx,                 (numeric) 服务器当前处理的区块数
  "timeoffset": xxxxx,              (numeric) 时间偏移
  "connections": xxxxx,             (numeric) 连接数
  "proxy": "host:port",             (string, optional) 服务器使用的代理
  "difficulty": xxxxxx,             (numeric) 当前难度
  "testnet": true|false,            (boolean) 服务器是否使用测试网
  "keypoololdest": xxxxxx,          (numeric) 密钥池中最旧预生成密钥的时间戳（自 GMT 时代以来的秒数）
  "keypoolsize": xxxx,              (numeric) 预生成的新密钥数量
  "unlocked_until": ttt,            (numeric) 钱包解锁以进行转账的时间戳（自 1970 年 1 月 1 日 GMT 午夜以来的秒数），或 0 表示钱包已锁定
  "paytxfee": x.xxxx,               (numeric) 以 btc/kb 设置的交易费用
  "relayfee": x.xxxx,               (numeric) 非免费交易的最小中继费用（以 btc/kb 为单位）
  "errors": "..."                   (string) 任何错误消息
}
```

注意：

-   protocolversion：用于握手
-   protocol：默认为 multichain
-   port：确保防火墙打开此端口号以进行连接。
-   blocks：如果挖掘了新区块，此数字应不断变化。
-   connections：如果您已连接到网络，此数字不应为 0。

---

### b. `getpeerinfo` 命令

`getpeerinfo` 命令返回有关每个连接的网络节点的数据，作为对象的 json 数组。

**语法**

```sh
getpeerinfo
```

结果应显示以下内容：

```json
[
  {
    "id": n,                        (numeric) 节点索引
    "addr":"host:port",             (string) 节点的 IP 地址和端口
    "addrlocal":"ip:port",          (string) 本地地址
    "services":"xxxxxxxxxxxxxxxx",  (string) 提供的服务
    "lastsend": ttt,                (numeric) 自上次发送以来的秒数（自 1970 年 1 月 1 日 GMT）
    "lastrecv": ttt,                (numeric) 自上次接收以来的秒数（自 1970 年 1 月 1 日 GMT）
    "bytessent": n,                 (numeric) 发送的总字节数
    "bytesrecv": n,                 (numeric) 接收的总字节数
    "conntime": ttt,                (numeric) 自连接以来的秒数（自 1970 年 1 月 1 日 GMT）
    "pingtime": n,                  (numeric) ping 时间
    "pingwait": n,                  (numeric) ping 等待
    "version": v,                   (numeric) 节点版本，例如 7001
    "subver": "/Satoshi:0.8.5/",    (string) 字符串版本
    "handshakelocal": n,            (string) 如果协议是 Multichain。握手时本地节点使用的地址。
    "handshake": n,                 (string) 如果协议是 Multichain。握手时远程节点使用的地址。
    "inbound": true|false,          (boolean) 传入 (true) 或传出 (false)
    "startingheight": n,            (numeric) 节点的起始高度（区块）
    "banscore": n,                  (numeric) 禁止分数
    "synced_headers": n,            (numeric) 我们与该节点的公共最新头
    "synced_blocks": n,             (numeric) 我们与该节点的公共最新区块
    "inflight": [
       n,                           (numeric) 我们当前正在向此节点请求的区块高度
       ...
    ]
  }
  ,...
]

```

注意：

-   addr：连接到此节点的节点的 IP 地址和端口。
-   addrlocal：此节点的本地 IP 地址和端口。
-   handshakelocal：此节点的钱包地址。
-   Handshake：连接到此节点的节点的钱包地址。
-   从此列表返回的节点数是否等于您组中的节点数？
-   如果不是，则某些节点可能离线，或者它们的配置不正确，无法连接到组中。否则，它们可能通过您连接到的另一个节点间接连接到您。

---

### c. `getaddresses` 命令

`getaddresses` 命令返回此节点钱包中的地址列表。

**语法**

```sh
getaddresses ( verbose )
```

**参数**

1. **verbose (boolean, optional, default=false)**: true|false

**示例**

以下示例返回此节点钱包中的地址列表。

```sh
getaddresses
```

示例输出显示当前节点的钱包中有 2 个地址。

```sh
[
    "12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL",
    "1bXk12QuUGXv9WXLaZwbTjfJ6UvNBJmuD9CFqc"
]
```

以下示例返回带有详细信息的此节点钱包中的地址列表。

```sh
getaddresses true
```

示例输出显示以下内容：

```sh
[
    {
        "address" : "12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL",
        "ismine" : true,
        "iswatchonly" : false,
        "isscript" : false,
        "pubkey" : "03cbb355bd0f558b892113dff5f45c847ef948219673f784970beb5fc532effe80",
        "iscompressed" : true,
        "account" : "",
        "synchronized" : false,
        "startblock" : 0
    },
    {
        "address" : "1bXk12QuUGXv9WXLaZwbTjfJ6UvNBJmuD9CFqc",
        "ismine" : false,
        "iswatchonly" : true,
        "isscript" : false,
        "account" : "",
        "synchronized" : true
    }
]
```

在最后一个示例中，带有详细信息的 getaddresses 命令输出显示节点钱包中有两个地址。

-   **12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL** 由该节点拥有（**ismine=true**）。这意味着该节点在其钱包中有此地址的私钥。它有更详细的信息可用，例如 pubkey，包括公钥和同步状态。
-   **1bXk12QuUGXv9WXLaZwbTjfJ6UvNBJmuD9CFqc** 是一个仅观察（**iswatchonly=true**）地址，不归该节点所有。这意味着该节点没有此地址的私钥，因为此地址是从另一个节点生成的。它只能显示基本信息，没有公钥或同步状态。

---

### d. `listpermissions` 命令

返回已明确授予地址的所有权限列表。

**语法**

```sh
listpermissions ( "permission(s)" address(es) verbose )
```

**参数：**

1. **"permission(s)" (string, optional, default=\*)**: 权限字符串，用逗号分隔。
   全局：connect,send,receive,issue,mine,admin,activate,create
   或每个资产：asset-identifier.issue,admin,activate,send,receive
   或每个流：stream-identifier.write,read,activate,admin
   或每个变量：variable-identifier.write,activate,admin
   或每个库：library-identifier.write,activate,admin

2. **"address(es)" (string, optional, default=\_)**: 要检索权限的地址。"\_" 表示所有地址
   或
3. **address(es) (array, optional)**: 要返回权限的地址的 JSON 数组

4. **verbose (boolean, optional, default=false)**: 如果为 true，返回待处理授予列表

**示例**

a. 列出所有钱包地址的所有权限

结果应返回所有钱包地址的所有权限列表。

```sh
> listpermissions
```

示例输出显示区块链上只有 2 个地址。地址 "12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL" 有挖矿、管理、连接、发送和接收权限。地址 "1bXk12QuUGXv9WXLaZwbTjfJ6UvNBJmuD9CFqc" 有发送和接收权限。

```sh
[
    {
        "address" : "12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL",
        "for" : null,
        "type" : "mine",
        "startblock" : 0,
        "endblock" : 4294967295
    },
    {
        "address" : "12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL",
        "for" : null,
        "type" : "admin",
        "startblock" : 0,
        "endblock" : 4294967295
    },
    {
        "address" : "12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL",
        "for" : null,
        "type" : "connect",
        "startblock" : 0,
        "endblock" : 4294967295
    },
    {
        "address" : "12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL",
        "for" : null,
        "type" : "send",
        "startblock" : 0,
        "endblock" : 4294967295
    },
    {
        "address" : "12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL",
        "for" : null,
        "type" : "receive",
        "startblock" : 0,
        "endblock" : 4294967295
    },
    {
        "address" : "1Unpjzmh9TsuRZvVKCQNpqx1eDFkaGC215fpj6",
        "for" : null,
        "type" : "send",
        "startblock" : 0,
        "endblock" : 4294967295
    },
    {
        "address" : "1Unpjzmh9TsuRZvVKCQNpqx1eDFkaGC215fpj6",
        "for" : null,
        "type" : "receive",
        "startblock" : 0,
        "endblock" : 4294967295
    }
]
```

b. 列出具有特定权限的所有钱包地址

结果应返回具有 admin 权限的钱包地址列表。

```sh
> listpermissions admin
```

输出返回一个地址数组 `12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL`，这是区块链上的管理员。

```
[
    {
        "address" : "12S7Eg2Gz1ZSdRXqVjzjoSybBV1m9umdZz5nHL",
        "for" : null,
        "type" : "admin",
        "startblock" : 0,
        "endblock" : 4294967295
    }
]
```

c. 列出特定钱包地址的所有权限

结果应返回地址 `1Unpjzmh9TsuRZvVKCQNpqx1eDFkaGC215fpj6` 的权限列表。

```
> listpermissions * 1Unpjzmh9TsuRZvVKCQNpqx1eDFkaGC215fpj6
```

输出显示该地址仅包含 2 个权限：`send` 和 `receive`。

```
[
    {
        "address" : "1Unpjzmh9TsuRZvVKCQNpqx1eDFkaGC215fpj6",
        "for" : null,
        "type" : "send",
        "startblock" : 0,
        "endblock" : 4294967295
    },
    {
        "address" : "1Unpjzmh9TsuRZvVKCQNpqx1eDFkaGC215fpj6",
        "for" : null,
        "type" : "receive",
        "startblock" : 0,
        "endblock" : 4294967295
    }
]
```

---

### e. `grant` 命令

向给定地址授予权限。

**语法**

```sh
grant "address(es)" "permission(s)" ( native-amount startblock endblock "comment" "comment-to" )
```

**参数：**

1. **"address(es)" (string, required)**: 发送到的 multichain 地址（用逗号分隔）
2. **"permission(s)" (string, required)**: 权限字符串，用逗号分隔。
   全局：connect,send,receive,issue,mine,admin,activate,create
   或每个资产：asset-identifier.issue,admin,activate,send,receive
   或每个流：stream-identifier.write,read,activate,admin
   或每个变量：variable-identifier.write,activate,admin
   或每个库：library-identifier.write,activate,admin
3. **native-amount (numeric, optional)**: 发送的原生货币金额。例如 0.1。默认 - 0.0
4. **startblock (numeric, optional)**: 应用权限的起始区块（包括）。默认 - 0
5. **endblock (numeric, optional)**: 应用权限的结束区块（不包括）。默认 - 4294967295
   如果指定 -1，则使用默认值。
6. **"comment" (string, optional)**: 用于存储交易目的的注释。
   这不是交易的一部分，仅保存在您的钱包中。
7. **"comment-to" (string, optional)**: 用于存储您向其发送交易的人或组织名称的注释。
   这不是交易的一部分，仅保存在您的钱包中。

**示例**

1. 授予单一权限

以下命令向 12tDDPm72xRFqmQ96jJtqT4cCGwTHNVsz2A4HB 授予单一权限。

```
grant 12tDDPm72xRFqmQ96jJtqT4cCGwTHNVsz2A4HB connect
```

2. 授予多个权限

以下命令向 12tDDPm72xRFqmQ96jJtqT4cCGwTHNVsz2A4HB 授予 3 个权限。

```
grant 12tDDPm72xRFqmQ96jJtqT4cCGwTHNVsz2A4HB connect,send,receive
```

3. 授予实体级权限

要授予实体级权限，您需要在权限命令中指定资产或流名称。资产级权限可以有 **send**、**receive**、**issue** 权限。流级权限可以有 **admin**、**write** 和 **activate** 权限。

以下命令向名为 asset01 的资产授予资产级权限。

```sh
grant {replace-with-address} asset01.send, asset01.receive, asset01.issue
```

以下命令向名为 stream01 的流授予流级权限。

```sh
grant {replace-with-address} stream01.admin, stream01.write, stream01.activate
```

---

## 🛠️ 实验实践：MultiChain 命令行工具

在交互模式下运行以下内容。

### a) "getinfo" 命令

-   检索有关此节点和区块链的一般信息

-   交互模式

    ```
    > getinfo
    ```

-   输出：
    -   protocolversion：用于握手
    -   protocol：可以是 multichain 或 bitcoin
    -   port：确保防火墙打开此端口号以进行连接。
    -   blocks：如果挖掘了新区块，此数字应不断变化。
    -   connections：显示与 multichaind 服务的连接数。

---

### b) "getpeerinfo" 命令

-   返回有关每个连接的网络节点的数据
-   交互模式

    ```
    > getpeerinfo
    ```

-   输出：
    -   addr：连接到此节点的节点的 IP 地址和端口。
    -   addrlocal：此节点的本地 IP 地址和端口。
    -   handshakelocal：此节点的钱包地址。
    -   Handshake：连接到此节点的节点的钱包地址。
    -   从此列表返回的节点数是否等于您组中的节点数？
    -   如果不是，则某些节点可能离线，或者它们的配置不正确，无法连接到组中。

---

### c) "getaddresses" 命令

-   返回此节点跟踪的钱包地址列表。
-   交互模式

    ```
    > getaddresses true
    ```

-   输出：
    -   "address"：钱包地址
    -   "ismine"：如果此地址由您生成，则为 true。如果您正在监听别人的地址，则为 false。
    -   "iswatchonly"：如果此地址是使用 "importaddress" 命令导入的仅观察地址，则为 true。

---

### d) "listpermissions" 命令

-   返回当前钱包中的权限列表。

    - **列出所有钱包地址的所有权限**

        -   交互模式

            ```
            > listpermissions
            ```

        -   输出：
            结果应返回所有钱包地址的所有权限列表。

    - **列出具有特定权限的所有钱包地址**

        -   交互模式

            ```
            > listpermissions admin
            ```

        -   输出：
            结果应返回具有 admin 权限的钱包地址列表。

    - **列出特定钱包地址的所有权限**

        -   交互模式

            ```
            > listpermissions * {replace-with-wallet-address}
            ```

        -   输出：
            结果应返回此钱包地址的权限列表。

---

### e) "grant" 命令

-   此命令只能由管理员执行。该命令需要 2 个参数：

    -   要授予权限的钱包地址。
    -   要授予的权限：activate、admin、connect、create、issue、mine、receive、send、receive、write

-   交互模式

    ```
    > grant {address} (activate | admin | connect | create | issue | mine | receive | send | receive | write)
    ```

-   将 {address} 替换为您的对等方的钱包地址

-   输出：

    -   运行 listpermission 确认已向钱包地址授予 "activate"。
