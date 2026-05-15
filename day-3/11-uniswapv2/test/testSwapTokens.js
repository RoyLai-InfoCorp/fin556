const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test Swap Tokens", function () {
  it("Should sell exact 100 * 10^18 of token0 for token1", async function () {
    // Step 1: Get pair contract
    // -----------------------------------------------------------------
    const pairAddress = await factory.getPair(
      await token0.getAddress(),
      await token1.getAddress(),
    );
    const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

    // Step 2: Get initial pool reserves
    // -----------------------------------------------------------------
    const reserves = await pair.getReserves();
    const [reserve0, reserve1] =
      (await token0.getAddress()).toLowerCase() <
      (await token1.getAddress()).toLowerCase()
        ? [reserves._reserve0, reserves._reserve1]
        : [reserves._reserve1, reserves._reserve0];

    // Check initial balances
    const initialBalanceToken0 = await token0.balanceOf(signer.address);
    const initialBalanceToken1 = await token1.balanceOf(signer.address);

    // Step 3: Define exact input amount
    // -----------------------------------------------------------------
    // We are selling exactly 100 token0
    const amountIn = ethers.parseEther("100");

    // token0 is input, token1 is output
    const reserveIn = reserve0;
    const reserveOut = reserve1;

    // Calculate expected output using Uniswap V2 formula:
    // amountOut = (reserveOut * amountIn * 997) / (reserveIn * 1000 + amountIn * 997)
    const amountInWithFee = amountIn * 997n;
    const expectedAmountOut =
      (reserveOut * amountInWithFee) / (reserveIn * 1000n + amountInWithFee);

    // Check off-chain calculation with router's on-chain function
    const contractAmountOut = await router.getAmountOut(
      amountIn,
      reserveIn,
      reserveOut,
    );
    expect(contractAmountOut).to.equal(expectedAmountOut);

    // Set minimum output with 5% slippage tolerance
    const amountOutMin = (expectedAmountOut * 95n) / 100n;

    // Step 4: Prepare swap parameters
    // -----------------------------------------------------------------
    const path = [await token0.getAddress(), await token1.getAddress()];
    const to = signer.address;

    const block = await ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 600;

    // Step 5: Approve router to spend input token
    // -----------------------------------------------------------------
    await token0.approve(await router.getAddress(), amountIn);

    // Step 6: Execute swap
    // -----------------------------------------------------------------
    await router.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline,
    );

    // Step 7: Check final balances
    // -----------------------------------------------------------------
    const finalBalanceToken0 = await token0.balanceOf(signer.address);
    const finalBalanceToken1 = await token1.balanceOf(signer.address);

    console.log(
      "Amount of token0 decreased:",
      ethers.formatEther(initialBalanceToken0 - finalBalanceToken0),
    );
    console.log(
      "Amount of token1 increased:",
      ethers.formatEther(finalBalanceToken1 - initialBalanceToken1),
    );

    expect(finalBalanceToken0).to.equal(initialBalanceToken0 - amountIn);
    expect(finalBalanceToken1).to.equal(
      initialBalanceToken1 + expectedAmountOut,
    );
  });
  let signer;
  let factory, router, token0, token1;

  beforeEach(async function () {
    [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();

    // 部署 UniswapV2Factory
    const Factory = await ethers.getContractFactory("UniswapV2Factory");
    factory = await Factory.deploy(signerAddress);
    await factory.waitForDeployment();

    // 部署 UniswapV2Router02
    const Router = await ethers.getContractFactory("UniswapV2Router02");
    router = await Router.deploy(
      factory.target,
      "0x0000000000000000000000000000000000000000",
    );
    await router.waitForDeployment();

    // 部署 Token0
    const Token0 = await ethers.getContractFactory("DemoTokenA");
    token0 = await Token0.deploy();
    await token0.waitForDeployment();

    // 部署 Token1
    const Token1 = await ethers.getContractFactory("DemoTokenB");
    token1 = await Token1.deploy();
    await token1.waitForDeployment();

    // 创建配对
    await factory.createPair(
      await token0.getAddress(),
      await token1.getAddress(),
    );

    // 批准代币给路由器
    const amount0 = ethers.parseEther("1000");
    const amount1 = ethers.parseEther("5000");

    await token0.approve(await router.getAddress(), amount0);
    await token1.approve(await router.getAddress(), amount1);

    // 添加流动性
    const block = await ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 1000;

    await router.addLiquidity(
      await token0.getAddress(),
      await token1.getAddress(),
      amount0,
      amount1,
      0,
      0,
      signerAddress,
      deadline,
    );
  });

  it("Should buy exact 100 * 10^18 of token0 for token1", async function () {
    const signerAddress = await signer.getAddress();

    // 步骤 1：获取 Pair 合约
    const pairAddress = await factory.getPair(
      await token0.getAddress(),
      await token1.getAddress(),
    );

    const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

    // 步骤 2：获取初始池储备
    const reserves = await pair.getReserves();

    const token0Address = (await token0.getAddress()).toLowerCase();
    const token1Address = (await token1.getAddress()).toLowerCase();

    const [reserve0, reserve1] =
      token0Address < token1Address
        ? [reserves._reserve0, reserves._reserve1]
        : [reserves._reserve1, reserves._reserve0];

    // 检查初始余额
    const initialBalanceToken0 = await token0.balanceOf(signerAddress);
    const initialBalanceToken1 = await token1.balanceOf(signerAddress);

    // 步骤 3：准备 amountOut
    // 目标：买入精确 100 个 token0
    const amountOut = ethers.parseEther("100");

    // token1 是输入代币，token0 是输出代币
    const reserveIn = reserve1;
    const reserveOut = reserve0;

    // 计算需要支付多少 token1
    const expectedAmountIn =
      (reserveIn * amountOut * 1000n) / ((reserveOut - amountOut) * 997n) + 1n;

    // 检查链下计算和 Router 计算是否一致
    const contractAmountIn = await router.getAmountIn(
      amountOut,
      reserveIn,
      reserveOut,
    );

    expect(contractAmountIn).to.equal(expectedAmountIn);

    // 设置最大输入数量：5% 滑点容忍度
    const amountInMax = (expectedAmountIn * 105n) / 100n;

    // path：从 token1 换到 token0
    const path = [await token1.getAddress(), await token0.getAddress()];

    // 接收者
    const to = signerAddress;

    // deadline
    const block = await ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 600;

    // 步骤 4：批准 Router 花费 token1
    await token1.approve(await router.getAddress(), amountInMax);

    // 步骤 5：执行交换
    await router.swapTokensForExactTokens(
      amountOut,
      amountInMax,
      path,
      to,
      deadline,
    );

    // 检查最终余额
    const finalBalanceToken0 = await token0.balanceOf(signerAddress);
    const finalBalanceToken1 = await token1.balanceOf(signerAddress);

    console.log(
      "Amount of token0 increased:",
      ethers.formatEther(finalBalanceToken0 - initialBalanceToken0),
    );

    console.log(
      "Amount of token1 decreased:",
      ethers.formatEther(initialBalanceToken1 - finalBalanceToken1),
    );

    expect(finalBalanceToken0).to.equal(initialBalanceToken0 + amountOut);
    expect(finalBalanceToken1).to.equal(
      initialBalanceToken1 - expectedAmountIn,
    );
  });

  it("Quiz: Should sell exact 100 token0 for token1", async function () {
    const signerAddress = await signer.getAddress();

    const pairAddress = await factory.getPair(
      await token0.getAddress(),
      await token1.getAddress(),
    );

    const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
    const reserves = await pair.getReserves();

    const token0Address = (await token0.getAddress()).toLowerCase();
    const token1Address = (await token1.getAddress()).toLowerCase();

    const [reserve0, reserve1] =
      token0Address < token1Address
        ? [reserves._reserve0, reserves._reserve1]
        : [reserves._reserve1, reserves._reserve0];

    const initialBalanceToken0 = await token0.balanceOf(signerAddress);
    const initialBalanceToken1 = await token1.balanceOf(signerAddress);

    // 精确卖出 100 个 token0
    const amountIn = ethers.parseEther("100");

    // token0 是输入，token1 是输出
    const expectedAmountOut = await router.getAmountOut(
      amountIn,
      reserve0,
      reserve1,
    );

    // 5% 滑点保护
    const amountOutMin = (expectedAmountOut * 95n) / 100n;

    const path = [await token0.getAddress(), await token1.getAddress()];

    const block = await ethers.provider.getBlock("latest");
    const deadline = block.timestamp + 600;

    await token0.approve(await router.getAddress(), amountIn);

    await router.swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      signerAddress,
      deadline,
    );

    const finalBalanceToken0 = await token0.balanceOf(signerAddress);
    const finalBalanceToken1 = await token1.balanceOf(signerAddress);

    console.log(
      "Quiz token0 decreased:",
      ethers.formatEther(initialBalanceToken0 - finalBalanceToken0),
    );

    console.log(
      "Quiz token1 increased:",
      ethers.formatEther(finalBalanceToken1 - initialBalanceToken1),
    );

    expect(finalBalanceToken0).to.equal(initialBalanceToken0 - amountIn);
    expect(finalBalanceToken1).to.equal(
      initialBalanceToken1 + expectedAmountOut,
    );
  });
});
