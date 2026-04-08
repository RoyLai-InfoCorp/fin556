## 🛠️ 实验实践：设置 Web 框架（React）

**DApp 高级目标：**

我们要构建的 DApp 将具有以下功能：

-   连接到 Metamask 钱包。
-   与部署在本地 Hardhat 节点上的合约交互。
-   显示用户当前的代币余额。
-   显示当前池储备。
-   允许用户交换代币。

实验将分为以下部分：

a) 设置 Web 框架（React）- 这部分 ✅
b) 使用硬编码数据创建 DApp 模型
c) 扩展 DApp 以集成 Metamask
d) 将 Uniswap 合约部署到本地 Hardhat 节点
e) 完成 DApp 以允许代币交换

**注意：这不是 React 课程。**

将在本实验中为您提供 React 代码供您构建，不需要详细了解 React 代码。本课程的重点是学习如何使用 ethers.js 库扩展代码以与区块链集成。如果您有兴趣了解更多关于 React 的信息，请参阅 [React 文档](https://react.dev/)。

我们将首先设置一个空的 React（Web 框架）项目，并将其精简到最低限度，以便我们可以从头开始构建 DApp UI。

### 步骤 1：设置

1. **转到 day-4/14-DApp 目录**

    ```bash
    cd /workspace/day-4/15-dapp/a-dapp-react
    ```

### 步骤 2：创建 React 项目

1.  **创建项目目录 fin556-dapp**

    使用 Vite 创建一个新的 React 项目。

    注意：如果您已经创建了 **fin556-dapp** 目录，它将抛出错误。您可以删除 **fin556-dapp** 目录并重新运行命令。

    ```bash
    npm create vite@8.0.2 fin556-dapp -- --template react --no-interactive
    ```

    请注意，该命令将在您当前目录内生成一个 **fin556-dapp** 目录。

    此目录将是您的 React 项目目录，包含启动和运行 React 服务器以进行浏览器测试所需的代码。

    确保在编写 DApp 代码时您在正确的目录中。

    进入 **fin556-dapp** 目录。

    ```bash
    cd fin556-dapp
    ```

2.  **安装 React 依赖**

    ```bash
    npm i
    ```

3.  **启动 React 服务器**

    ```bash
    npm run dev

     # 示例输出：
     # VITE v7.1.9  ready in 310 ms
     #
     # ➜  Local:   http://localhost:5173/
     # ➜  Network: use --host to expose
     # ➜  press h + enter to show help
    ```

4.  **在 http://localhost:5173 打开浏览器**

    如果您能看到以下页面，说明您的 React 服务器运行正常，可以从浏览器连接。

    ![empty-react-page](./img/empty-react-page.png)

    -   **故障排除**

        如果您看到错误页面，可能是由于以下原因之一：

        -   **端口冲突**这意味着您有另一个服务器在同一端口上运行。您可以通过更新 vite.config.js 文件更改 React 服务器的端口来避免冲突。

            -   打开 **fin556-dapp** 目录中的 **vite.config.js** 文件。
            -   替换

                ```js
                export default defineConfig({
                    plugins: [react()],
                });
                ```

                为新的端口号，例如 5174

                ```js
                export default defineConfig({
                    plugins: [react()],
                    server: {
                        port: 5174, // 改为不同的端口号
                    },
                });
                ```

        -   **防火墙阻止端口** 您的本地防火墙可能阻止了该端口。您可以尝试暂时禁用防火墙来测试是否是这个问题。如果是，那么您可以按照上述步骤更改端口或在防火墙设置中添加例外以允许该端口上的流量。确切的禁用防火墙步骤取决于您的操作系统以及是否安装了任何第三方防火墙应用程序，这超出了本实验的范围。请在线搜索适合您操作系统和防火墙应用程序的说明。

            **警告：** 记得在测试后重新打开防火墙。

5.  **停止 React 服务器**

    返回终端并按 `Ctrl + C` 停止服务器。

### 步骤 3：清理不必要的文件

1. **创建一个干净的 src 目录**

    在 fin556-dapp 目录中，删除 **index.html** 和 **README.md** 文件，因为我们将从头开始创建自己的文件。

    ```bash
    rm index.html
    rm README.md
    ```

    接下来，删除 **src** 和 **public** 目录中的所有文件，并创建新的空目录。

    ```bash
    rm -rf src public
    mkdir src public
    ```

2. **检查目录结构**

    要确认您走在正确的轨道上，请在 **fin556-dapp** 目录中运行以下命令来检查您的目录结构。

    ```bash
    tree -I node_modules

     # 确保输出如下所示：
     # .
     # ├── eslint.config.js
     # ├── package-lock.json
     # ├── package.json
     # ├── public
     # ├── src
     # └── vite.config.js
    ```

3. **创建 fin556-dapp/src/main.jsx**

    在 **fin556-dapp/src** 目录中创建 **main.jsx** 文件。

    添加以下代码。

    ```jsx
    import { createRoot } from "react-dom/client";
    import App from "./App.jsx";

    createRoot(document.getElementById("root")).render(<App />);
    ```

4. **创建 fin556-dapp/src/App.jsx**

    在 **fin556-dapp/src** 目录中创建 **App.jsx** 文件。

    添加以下代码。

    ```jsx
    import React from "react";
    const App = () => {
        return <h1>Hello DApp</h1>;
    };
    export default App;
    ```

5. **创建 fin556-dapp/index.html**

    在 **fin556-dapp** 目录中创建 **index.html** 文件。

    添加以下代码。

    ```html
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            />
            <title>FIN556 DApp</title>
        </head>
        <body>
            <div id="root"></div>
            <script type="module" src="/src/main.jsx"></script>
        </body>
    </html>
    ```

### 步骤 4：运行 DApp

1. **再次启动 React 服务器**

    创建这 3 个文件后，您可以再次启动 React 服务器

    ```bash
    npm run dev
    ```

2. **在 http://localhost:5173 打开浏览器**

    在 http://localhost:5173 打开浏览器。您应该看到一个带有"Hello DApp"文本的空页面。

    ![hello-dapp](./img/hello-dapp.png)

3. **停止 React 服务器**

    返回终端并按 `Ctrl + C` 停止服务器。

4. **任务完成 ✅**

    您已成功设置了一个空的 React 项目，准备好从头开始构建 DApp UI。
