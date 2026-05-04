const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Create Pool", function () {
    let signer;
    let factory, router, token0, token1;

    beforeEach(async function () {
        [signer] = await ethers.getSigners();

        // 部署 UniswapV2Factory
        const Factory = await ethers.getContractFactory("UniswapV2Factory");
        factory = await Factory.deploy(signer.address);
        await factory.waitForDeployment();

        // 部署 UniswapV2Router02
        const Router = await ethers.getContractFactory("UniswapV2Router02");
        router = await Router.deploy(
            factory.target,
            "0x0000000000000000000000000000000000000000"
        );
        await router.waitForDeployment();

        // 部署 Token0
        const TokenA = await ethers.getContractFactory("DemoTokenA");
        token0 = await TokenA.deploy();
        await token0.waitForDeployment();

        // 部署 Token1
        const TokenB = await ethers.getContractFactory("DemoTokenB");
        token1 = await TokenB.deploy();
        await token1.waitForDeployment();
    });

    it("Should create and fund a liquidity pool", async function () {
        // 步骤 1：创建池
        const txCreate = await factory.createPair(
            await token0.getAddress(),
            await token1.getAddress()
        );
        await txCreate.wait();

        // 步骤 2：获取池地址 - 方法 1：从 PairCreated 事件获取
        const logs = await factory.queryFilter(
            factory.filters.PairCreated(null)
        );

        const pairAddress = logs[0].args.pair;
        console.log("Pair address:", pairAddress);

        expect(pairAddress).to.not.equal(ethers.ZeroAddress);
        expect(ethers.isAddress(pairAddress)).to.equal(true);

        // 方法 2：用 getPair() 从工厂合约读取
        const pairAddress1 = await factory.getPair(
            await token0.getAddress(),
            await token1.getAddress()
        );

        expect(pairAddress1).to.equal(pairAddress);

        // 方法 3：使用 CREATE2 计算池地址
        let address0 = (await token0.getAddress()).toLowerCase();
        let address1 = (await token1.getAddress()).toLowerCase();

        if (address0 > address1) {
            [address0, address1] = [address1, address0];
        }

        const pairAddress2 = ethers.getCreate2Address(
            factory.target,
            ethers.keccak256(
                ethers.solidityPacked(
                    ["address", "address"],
                    [address0, address1]
                )
            ),
            "0x215a032792ab9f4a5eb14f1f4c1daed5017b1eee4de72ddb42e06c967b16c5d4"
        );

        expect(pairAddress2).to.equal(pairAddress);

        // 步骤 3：批准代币转移
        const amount0 = ethers.parseEther("1000");
        const amount1 = ethers.parseEther("5000");

        await token0.approve(await router.getAddress(), amount0);
        await token1.approve(await router.getAddress(), amount1);

        // 步骤 4：添加流动性
        const block = await ethers.provider.getBlock("latest");
        const deadline = block.timestamp + 600;

        const txLiquidity = await router.addLiquidity(
            await token0.getAddress(),
            await token1.getAddress(),
            amount0,
            amount1,
            amount0,
            amount1,
            await signer.getAddress(),
            deadline
        );

        await txLiquidity.wait();

        // 步骤 5：检查池储备
        const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

        const reserves = await pair.getReserves();

        const [reserve0, reserve1] =
            (await token0.getAddress()) < (await token1.getAddress())
                ? [reserves[0], reserves[1]]
                : [reserves[1], reserves[0]];

        console.log("Reserve0:", ethers.formatEther(reserve0));
        console.log("Reserve1:", ethers.formatEther(reserve1));

        expect(reserve0).to.equal(amount0);
        expect(reserve1).to.equal(amount1);

        // 步骤 6：检查 LP Token 余额
        const lpBalance = await pair.balanceOf(await signer.getAddress());
        console.log("LP Token Balance:", ethers.formatEther(lpBalance));

        function sqrtBigInt(value) {
            if (value < 0n) {
                throw new Error("Square root of negative numbers is not supported");
            }

            if (value < 2n) {
                return value;
            }

            let x = value;
            let y = (x + 1n) / 2n;

            while (y < x) {
                x = y;
                y = (x + value / x) / 2n;
            }

            return x;
        }

        const computedLpBalance = sqrtBigInt(amount0 * amount1) - 1000n;

        console.log(
            "Computed LP Token Balance:",
            ethers.formatEther(computedLpBalance)
        );

        expect(lpBalance).to.equal(computedLpBalance);
    });
});