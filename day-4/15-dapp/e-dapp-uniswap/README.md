## 🛠️ 实验实践：DApp - 部署合约

**DApp 高级目标：**

我们要构建的 DApp 将具有以下功能：

-   连接到 Metamask 钱包。
-   与部署在本地 Hardhat 节点上的合约交互。
-   显示用户当前的代币余额。
-   显示当前池储备。
-   允许用户交换代币。

实验将分为以下部分：

a) 设置 Web 框架（React）
b) 使用硬编码数据创建 DApp 模型
c) 扩展 DApp 以集成 Metamask
d) 将 Uniswap 合约部署到本地 Hardhat 节点
e) 完成 DApp 以允许代币交换 - 这部分 ✅

### 步骤 1：设置

-   **转到 React 项目目录**

    ```bash
    cd /workspace/day-4/15-dapp/e-dapp-uniswap/fin556-dapp
    ```

-   **安装依赖**

    ```bash
    npm i
    ```

### 1. 更新 React Hook 脚本库

-   **打开 fin556-dapp/src/useDapp.js**

    打开 **fin556-dapp/src** 目录中的文件 **useDapp.js** 并进行以下更改。

-   **更新 useDapp 参数**

    替换以下行。

    ```js
    const useDapp = ({ setSigner }) => {
    ```

    为此

    ```js
    const useDapp = ({
        setSigner,
        uniswapRouterAddress,
        uniswapFactoryAddress,
        tokenAddrA,
        tokenAddrB,
    }) => {
    ```

    这是扩展可以传入 useDapp hook 的参数列表，以包含其他状态变量，如 Uniswap 路由器和工厂地址，以及代币地址。

-   **在 useDapp() 内插入以下代码**

    在 `useDapp` 函数内插入以下代码以实现所需的功能。

    -   **添加 getBalance() 函数**

        添加以下代码以获取用户的代币余额和流动性池中的储备余额。

        ```js
        const getBalance = async (signer) => {
            const address = signer.address;

            const tokenA = new ethers.Contract(
                tokenAddrA,
                ["function balanceOf(address) view returns(uint)"],
                signer
            );

            const tokenB = new ethers.Contract(
                tokenAddrB,
                ["function balanceOf(address) view returns(uint)"],
                signer
            );

            // 池
            const factory = new ethers.Contract(
                uniswapFactoryAddress,
                ["function getPair(address,address) view returns(address)"],
                signer
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
                signer
            );

            // 获取储备
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

    -   **添加一个私有的 _getAmountOut() 函数**

        添加以下代码以在流动性池中交换代币。

        注意：此函数仅在 sellTokens 和 buyTokens 函数内部使用，这就是为什么它用下划线（_）作为前缀来指示它是私有的约定。

        ```js
        function _getAmountOut(amountIn, reserveIn, reserveOut) {
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

    -   **添加 _getReserves() 函数**

        添加以下代码以获取流动性池的储备。

        注意：此函数仅在 sellTokens 和 buyTokens 函数内部使用，这就是为什么它用下划线（_）作为前缀来指示它是私有的约定。

        ```js
        const _getReserves = async (factory, { TOKEN_0, TOKEN_1 }, account) => {
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

    -   **添加 sellTokens() 函数**

        添加以下代码以在流动性池中卖出代币。当用户通过提供输入金额、输入代币地址、输出代币地址和用户账户点击"SELL"按钮时，将调用此函数。

        ```js
        const sellTokens = async (inputAmt, inputAddr, outputAddr, account) => {
            // 获取储备
            const factory = new ethers.Contract(
                uniswapFactoryAddress,
                ["function getPair(address,address) view returns(address)"],
                account
            );

            const reserves = await _getReserves(
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

            // 获取输出金额
            const outputAmt = _getAmountOut(
                inputAmt,
                reserves.reserveA,
                reserves.reserveB
            );

            // 加载合约 A 和合约 B
            const uniswap = new ethers.Contract(
                uniswapRouterAddress,
                [
                    `function swapExactTokensForTokens(uint,uint,address[],address,uint)`,
                ],
                account
            );

            // 批准路由器从交易者账户提取 输入代币
            const inputToken = new ethers.Contract(
                inputAddr,
                ["function approve(address,uint)"],
                account
            );
            const response = await inputToken.approve(
                uniswapRouterAddress,
                inputAmt
            );
            await response.wait();
            console.log("trade: approved. receipt=", response.hash);

            // 使用交易者账户将 输入代币 换成 输出代币
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

    -   **添加 buyTokens() 函数**

        您应该根据目前所学自行实现此函数。现在，调用此函数将抛出错误。

        ```js
        const buyTokens = async (inputAmt, inputAddr, outputAddr, account) => {
            throw new Error("Not implemented yet");
        };
        ```

    -   **从 useDapp 返回新函数**

        替换以下返回语句。

        ```js
        return { connect };
        ```

        为此

        ```js
        return {
            connect,
            getBalance,
            sellTokens,
            buyTokens,
        };
        ```

### 2. 更新 App.jsx

-   **打开 App.jsx**

    打开 **fin556-dapp/src** 目录中的文件 **App.jsx**。

-   **更新 App 组件**

    在 `App` 组件内插入以下代码。

    -   **添加代币地址状态变量**

        替换以下行。

        ```js
        const [tokenAddrA, setTokenAddrA] = useState(
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        );
        const [tokenAddrB, setTokenAddrB] = useState(
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
        );
        const [uniswapRouterAddress, setUniswapRouterAddress] = useState(
            "0xcccccccccccccccccccccccccccccccccccccccc"
        );
        const [uniswapFactoryAddress, setUniswapFactoryAddress] = useState(
            "0xdddddddddddddddddddddddddddddddddddddddd"
        );
        const [balance, setBalance] = useState({
            balanceA: 100,
            balanceB: 200,
            liquidity: 50,
            reservesA: 500,
            reservesB: 1000,
        });
        ```

        为

        ```js
        const [tokenAddrA, setTokenAddrA] = useState("");
        const [tokenAddrB, setTokenAddrB] = useState("");
        const [uniswapRouterAddress, setUniswapRouterAddress] = useState("");
        const [uniswapFactoryAddress, setUniswapFactoryAddress] = useState("");
        const [balance, setBalance] = useState(null);
        ```

        -   用空字符串或 null 替换所有硬编码的初始值，以指示它们尚未设置。

    -   **添加 isLoading 状态变量以在加载数据时显示微调器**

        添加以下状态变量以在从区块链加载数据时控制视觉效果。这对于了解 DApp 是否在工作且没有冻结很有用。

        ```js
        const [isLoading, setIsLoading] = useState(false);
        ```

    -   **添加 amtA 和 amtB 状态变量**
        添加以下状态变量以存储要交换的 TokenA 和 TokenB 金额。

        ```js
        const [amtA, setAmtA] = useState(0);
        const [amtB, setAmtB] = useState(0);
        ```

    -   **加载 useDapp() hook**

        替换以下行。

        ```js
        const { connect } = useDapp({ setSigner });
        ```

        为此

        ```js
        const { connect, getBalance, sellTokens } = useDapp({
            setSigner,
            uniswapRouterAddress,
            uniswapFactoryAddress,
            tokenAddrA,
            tokenAddrB,
        });
        ```

    -   **创建 handleCheckBalance() 函数**

        添加以下函数来处理"Check"按钮点击事件。

        ```js
        const handleCheckBalance = async () => {
            setIsLoading(true);
            try {
                const balance = await getBalance(signer);
                console.log(balance);
                setBalance(balance);
            } catch (error) {
                console.error("Error fetching balances:", error);
                alert("Failed to fetch balances. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        ```

        -   当点击"Check"按钮时调用此函数。
        -   它将加载状态变量设置为 true 以显示加载微调器。
        -   它调用 `getAccount()` 函数以从 Metamask 获取签名者。
        -   如果未找到账户，它将显示警报消息并将加载状态变量设置为 false。
        -   如果找到账户，它将调用 `getBalance()` 函数来
            从区块链获取代币余额和池储备。

    -   **创建 handleSellA() 和 handleSellB() 函数**
        添加以下函数来处理"Sell"按钮点击事件。

        ```js
        const handleSell = async (aOrB) => {
            if (!amtA && !amtB) {
                alert("Invalid amount");
                return;
            }
            setIsLoading(true);
            try {
                if (aOrB === "A") {
                    const amtB = await sellTokens(
                        amtA,
                        tokenAddrA,
                        tokenAddrB,
                        signer
                    );
                    console.log(`Sold ${amtA} of A for ${amtB} of B`);
                    return;
                } else if (aOrB === "B") {
                    const amtA = await sellTokens(
                        amtB,
                        tokenAddrB,
                        tokenAddrA,
                        signer
                    );
                    console.log(`Sold ${amtB} of B for ${amtA} of A`);
                    return;
                } else {
                    throw new Error("Invalid token type. Must be 'A' or 'B'");
                }
            } catch (error) {
                console.error("Error selling tokens:", error);
                alert("Failed to sell tokens. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        ```

        -   该函数期望参数 `aOrB` 为"A"或"B"以指示要卖出哪个代币。
        -   它们检查输入的金额是否有效（大于 0）。
        -   它们将加载状态变量设置为 true 以显示加载微调器。
        -   它将调用 `sellTokens()` 函数以在流动性池中交换代币。
        -   交换完成后，它将记录结果并将加载状态变量设置为 false 以隐藏加载微调器。

    -   更新 **return** 语句以用状态变量替换硬编码值并添加加载微调器。

        -   **更新"Check"按钮以调用 handleCheckBalance()**

            在"Check"按钮中更新以下行。

            <!-- prettier-ignore -->
            ```js
                <Button variant='contained'>Check</Button>
            ```

            为

            <!-- prettier-ignore -->
            ```js
                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Button onClick={handleCheckBalance} variant='contained'>Check</Button>
                )}    
            ```

            -   如果加载状态变量为 true，则使用 Material UI 的 `CircularProgress` 组件显示加载微调器。
            -   如果加载状态变量为 false，则显示"Check"按钮。
            -   在按钮上添加 onClick 事件处理程序以在点击按钮时调用 `handleCheckBalance()` 函数。
            -   这将从区块链获取代币余额和池储备并更新状态变量 `balance`。

            **注意：** 微调器和按钮互斥很重要，即两者不能同时显示。这是为了防止用户在数据获取时多次点击按钮。

        -   **更新"Sell"按钮以调用 handleSellA() 和 handleSellB()**

            在"Sell"按钮中更新以下行。

            <!-- prettier-ignore -->
            ```js
                    <TextField id='amtA' label='TokenA Amount' fullWidth />
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant='contained'>Buy</Button>
                        <Button variant='outlined'>Sell</Button>
                    </Box>
            ```

            为

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
                        <Button variant='outlined' onClick={() => handleSell("A")}>Sell</Button>
                    </Box>
            ```

            和

            <!-- prettier-ignore -->
            ```js
                    <TextField id='amtB' label='TokenB Amount' fullWidth />
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant='contained'>Buy</Button>
                        <Button variant='outlined'>Sell</Button>
                    </Box>
            ```

            为

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
                        <Button variant='outlined' onClick={() => handleSell("B")}>Sell</Button>
                    </Box>

            ```

            -   如果加载状态变量为 true，则使用 Material UI 的 `CircularProgress` 组件显示加载微调器。
            -   如果加载状态变量为 false，则显示"Sell"按钮。
            -   在按钮上添加 onClick 事件处理程序以在点击按钮时调用 `handleSellA()` 或 `handleSellB()` 函数。
            -   这将在流动性池中交换代币并更新状态变量 `balance`。

### 3. 运行 DApp

-   **启动 React 开发服务器**

    ```bash
    cd /workspace/day-4/15-dapp/e-dapp-uniswap/fin556-dapp
    npm run dev
    ```

-   **在 http://localhost:5173 打开浏览器**

-   **输入合约地址**

    使用实验 **d-dapp-network** (../../d-dapp-network/scripts/addresses.json) 脚本目录中的 **addresses.json** 文件输入合约地址。

    通过点击"Check"按钮刷新余额。

    ![swap-0](./img/swap-0.png)

-   **检查 TokenA 和 TokenB 的代币余额**

    如果您提供了正确的钱包地址和代币地址，代币余额应大于 0。

    如果代币余额显示为 0，请检查以下内容：

    -   将 Metamask 中的钱包地址与 hardhat 节点终端中的 accounts[0] 地址进行比较。如果它们不同，意味着 .env 文件包含的助记词与用于创建 Metamask 钱包的助记词不同。

    -   将代币合约地址与实验 **d-dapp-network** (../../d-dapp-network/scripts/addresses.json) 脚本目录中的 **addresses.json** 文件中的地址进行比较。如果它们不同，请相应更新 DApp 中的合约地址。

-   **交换池储备**

    如果池储备未显示，请检查路由器和工厂合约地址。

-   **执行代币交换**

    b) 在"TokenA Amount"文本框中输入金额
    c) 点击旁边的"Sell"按钮以将 TokenA 换成 TokenB。

    ![swap-1](./img/swap-1.png)

    d) 在 Metamask 中批准交易。

    ![swap-2](./img/swap-2.png)

    d) 交易确认后，通过再次点击"Check"按钮刷新余额以查看更新的余额。

    ![swap-3](./img/swap-3.png)
