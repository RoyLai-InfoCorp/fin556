import { ethers } from "ethers";

const useDapp = ({
  setSigner,
  uniswapRouterAddress,
  uniswapFactoryAddress,
  tokenAddrA,
  tokenAddrB,
}) => {
  const provider = window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : null;

  const connect = async () => {
    if (!provider) {
      return {
        error: "MetaMask is not installed",
      };
    }

    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();

    const { chainId } = await provider.getNetwork();
    console.log("Connected to chainId:", chainId);

    setSigner(signer);

    return signer;
  };

  const getBalance = async (signer) => {
    if (!signer) {
      throw new Error("Signer not connected");
    }

    const address = await signer.getAddress();

    const tokenA = new ethers.Contract(
      tokenAddrA,
      ["function balanceOf(address) view returns(uint)"],
      signer,
    );

    const tokenB = new ethers.Contract(
      tokenAddrB,
      ["function balanceOf(address) view returns(uint)"],
      signer,
    );

    const factory = new ethers.Contract(
      uniswapFactoryAddress,
      ["function getPair(address,address) view returns(address)"],
      signer,
    );

    console.log(
      `Getting poolAddress for addressA(${tokenAddrA}) and addressB(${tokenAddrB})`,
    );

    const poolAddress = await factory.getPair(tokenAddrA, tokenAddrB);

    console.log(
      `poolAddress for addressA(${tokenAddrA}) and addressB(${tokenAddrB}) is ${poolAddress}`,
    );

    if (poolAddress === ethers.ZeroAddress) {
      throw new Error("No pool found for this token pair");
    }

    const pool = new ethers.Contract(
      poolAddress,
      [
        "function getReserves() view returns(uint112 reserve0,uint112 reserve1,uint32)",
        "function balanceOf(address) view returns(uint)",
      ],
      signer,
    );

    const { reserve0, reserve1 } = await pool.getReserves();

    const tokenALower = tokenAddrA.toLowerCase();
    const tokenBLower = tokenAddrB.toLowerCase();

    const reservesA = tokenALower < tokenBLower ? reserve0 : reserve1;
    const reservesB = tokenALower > tokenBLower ? reserve0 : reserve1;

    return {
      balanceA: (await tokenA.balanceOf(address)).toString(),
      balanceB: (await tokenB.balanceOf(address)).toString(),
      liquidity: (await pool.balanceOf(address)).toString(),
      reservesA: reservesA.toString(),
      reservesB: reservesB.toString(),
    };
  };

  function _getAmountOut(amountIn, reserveIn, reserveOut) {
    if (!amountIn || !reserveIn || !reserveOut) {
      throw new Error(
        "Invalid input: amountIn, reserveIn, and reserveOut must be provided",
      );
    }

    const amountInWithFee = ethers.toBigInt(amountIn) * ethers.toBigInt(997);

    const numerator = amountInWithFee * ethers.toBigInt(reserveOut);

    const denominator =
      ethers.toBigInt(reserveIn) * ethers.toBigInt(1000) + amountInWithFee;

    return numerator / denominator;
  }

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
      account,
    );

    const { reserve0, reserve1 } = await pool.getReserves();

    const token0Lower = TOKEN_0.toLowerCase();
    const token1Lower = TOKEN_1.toLowerCase();

    return {
      reserveA: token0Lower < token1Lower ? reserve0 : reserve1,
      reserveB: token0Lower > token1Lower ? reserve0 : reserve1,
    };
  };

  const sellTokens = async (inputAmt, inputAddr, outputAddr, account) => {
    const factory = new ethers.Contract(
      uniswapFactoryAddress,
      ["function getPair(address,address) view returns(address)"],
      account,
    );

    const reserves = await _getReserves(
      factory,
      {
        TOKEN_0: inputAddr,
        TOKEN_1: outputAddr,
      },
      account,
    );

    console.log("Reserves:", reserves);

    if (!reserves || !reserves.reserveA || !reserves.reserveB) {
      throw new Error("Failed to fetch reserves from the pool");
    }

    const outputAmt = _getAmountOut(
      inputAmt,
      reserves.reserveA,
      reserves.reserveB,
    );

    const uniswap = new ethers.Contract(
      uniswapRouterAddress,
      ["function swapExactTokensForTokens(uint,uint,address[],address,uint)"],
      account,
    );

    const inputToken = new ethers.Contract(
      inputAddr,
      ["function approve(address,uint)"],
      account,
    );

    const approveTx = await inputToken.approve(uniswapRouterAddress, inputAmt);

    await approveTx.wait();

    console.log("trade: approved. txHash =", approveTx.hash);

    const block = await provider.getBlock("latest");
    const deadline = block.timestamp + 1000;

    const swapTx = await uniswap.swapExactTokensForTokens(
      inputAmt,
      outputAmt,
      [inputAddr, outputAddr],
      await account.getAddress(),
      deadline,
    );

    await swapTx.wait();

    console.log("swap completed. txHash =", swapTx.hash);

    return outputAmt;
  };

  const buyTokens = async () => {
    throw new Error("Not implemented yet");
  };

  return {
    connect,
    getBalance,
    sellTokens,
    buyTokens,
  };
};

export default useDapp;
