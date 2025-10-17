import { ethers } from "ethers";

// Update these constants with actual addresses.
const UNISWAP_ROUTER_ADDRESS = "0x4fcaaD9DB6C7Aa0e9c3764fB216DcECeAf3A5BF8";
const UNISWAP_FACTORY_ADDRESS = "0xEb8e214fc8bC4a4ed2C174635A01cD8e13Fc59d9";
const DEMO_TOKEN_A = "0x1A023B00f7a96f35319C740369d858787EE3e6f9";
const DEMO_TOKEN_B = "0x6D6970ee7480F2BFAed31FAd535E29CA04987549";

const provider = window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : null;

const getAccount = async () => {
    if (!provider) return null;
    await provider.send("eth_requestAccounts", []); // Login to metamask
    const account = provider.getSigner();

    const { chainId } = await provider.getNetwork();
    console.log("Connected to chainId:", chainId);

    // const DESIRED_CHAIN_ID = 31337; // This is the default chain ID for hardhat localhost network
    // if (chainId !== DESIRED_CHAIN_ID) {
    //     await provider.send("wallet_switchEthereumChain", [
    //         { chainId: `0x${DESIRED_CHAIN_ID.toString(16)}` }, // Must be in hex format
    //     ]);
    // }

    return account;
};

const getAddressA = () => DEMO_TOKEN_A;

const getAddressB = () => DEMO_TOKEN_B;

const getBalance = async (tokenAddrA, tokenAddrB, account) => {
    const address = await account.getAddress();

    const tokenA = new ethers.Contract(
        tokenAddrA,
        ["function balanceOf(address) view returns(uint)"],
        account
    );

    const tokenB = new ethers.Contract(
        tokenAddrB,
        ["function balanceOf(address) view returns(uint)"],
        account
    );

    // Pool
    const factory = new ethers.Contract(
        UNISWAP_FACTORY_ADDRESS,
        ["function getPair(address,address) view returns(address)"],
        account
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
        account
    );

    // Get Reserves
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

function getAmountOut(amountIn, reserveIn, reserveOut) {
    if (!amountIn || !reserveIn || !reserveOut) {
        throw new Error(
            "Invalid input: amountIn, reserveIn, and reserveOut must be provided"
        );
    }
    const amountInWithFee = ethers.toBigInt(amountIn) * ethers.toBigInt(997);
    const numerator = amountInWithFee * ethers.toBigInt(reserveOut);
    const denominator =
        ethers.toBigInt(reserveIn) * ethers.toBigInt(1000) + amountInWithFee;
    return numerator / denominator;
}

const getReserves = async (factory, { TOKEN_0, TOKEN_1 }, account) => {
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

const sellTokens = async (inputAmt, inputAddr, outputAddr, account) => {
    // Get Reserves
    const factory = new ethers.Contract(
        UNISWAP_FACTORY_ADDRESS,
        ["function getPair(address,address) view returns(address)"],
        account
    );

    const reserves = await getReserves(
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

    // Get OutputAmt
    const outputAmt = getAmountOut(
        inputAmt,
        reserves.reserveA,
        reserves.reserveB
    );

    // Load contract A and contract B
    const uniswap = new ethers.Contract(
        UNISWAP_ROUTER_ADDRESS,
        [`function swapExactTokensForTokens(uint,uint,address[],address,uint)`],
        account
    );

    // Approve router to withdraw 2000 TokenA from trader account
    const inputToken = new ethers.Contract(
        inputAddr,
        ["function approve(address,uint)"],
        account
    );
    const response = await inputToken.approve(UNISWAP_ROUTER_ADDRESS, inputAmt);
    await response.wait();
    console.log("trade: approved. receipt=", response.hash);

    // Trade 2000 TokenA for 1662 TokenB using trader account
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

const buyTokens = async (inputAmt, inputAddr, outputAddr, account) => {
    throw new Error("Not implemented yet");
};

export {
    getAccount,
    getAddressA,
    getAddressB,
    getBalance,
    sellTokens,
    buyTokens,
};
