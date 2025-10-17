import React, { useState, useEffect } from "react";

import {
    CssBaseline,
    Container,
    Card,
    Grid,
    Button,
    TextField,
    Box,
    Divider,
    CircularProgress,
} from "@mui/material";
import {
    getAccount,
    getAddressA,
    getAddressB,
    getBalance,
    sellTokens,
} from "./dapp";

const App = () => {
    const [address, setAddress] = useState(null);
    const [tokenAddrA, setTokenAddrA] = useState(getAddressA());
    const [tokenAddrB, setTokenAddrB] = useState(getAddressB());
    const [balance, setBalance] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [amtA, setAmtA] = useState(0);
    const [amtB, setAmtB] = useState(0);

    useEffect(() => {
        const connectMetamask = async () => {
            // Get account from Metamask
            const account = await getAccount();
            if (!account) {
                // If no account found, show alert
                alert("Metamask not detected");
                return;
            }
            // If account found, assign the address to state variable
            const address = await account.getAddress();
            console.log(`Connected to Metamask with address ${address}`);
            setAddress(address);
        };
        connectMetamask();
    }, []);

    const handleCheckBalance = async () => {
        setIsLoading(true);
        try {
            const account = await getAccount();
            if (!account) {
                alert("Metamask not detected");
                setIsLoading(false);
                return;
            }
            const balance = await getBalance(tokenAddrA, tokenAddrB, account);
            console.log(balance);
            setBalance(balance);
        } catch (error) {
            console.error("Error fetching balances:", error);
            alert("Failed to fetch balances. Please try again.");
        }
        setIsLoading(false);
    };

    const handleSellA = async () => {
        const account = await getAccount();
        if (!account) {
            alert("Invalid account");
            return;
        }
        if (!amtA) {
            alert("Invalid amount");
            return;
        }
        setIsLoading(true);
        const amtB = await sellTokens(amtA, tokenAddrA, tokenAddrB, account);
        console.log(`Sold ${amtA} of A for ${amtB} of B`);
        setIsLoading(false);
    };

    const handleSellB = async () => {
        const account = await getAccount();
        if (!account) {
            alert("Invalid account");
            return;
        }
        if (!amtB) {
            alert("Invalid amount");
            return;
        }
        setIsLoading(true);
        const amtA = await sellTokens(amtB, tokenAddrB, tokenAddrA, account);
        console.log(`Sold ${amtB} of B for ${amtA} of A`);
        setIsLoading(false);
    };
    return (
        <>
            <CssBaseline />
            <Container>
                <h1>DEX DAPP</h1>
                <p>Connected to Metamask with address: {address}</p>
                <h2 style={{ marginBottom: "16px" }}>Liquidity Pool</h2>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <TextField
                        id='tokenAddrA'
                        label='TokenA Address'
                        value={tokenAddrA}
                        sx={{ flex: 1 }}
                        onChange={(e) => {
                            setTokenAddrA(e.target.value);
                        }}
                    ></TextField>
                    <TextField
                        id='tokenAddrB'
                        label='TokenB Address'
                        value={tokenAddrB}
                        sx={{ flex: 1 }}
                        onChange={(e) => {
                            setTokenAddrB(e.target.value);
                        }}
                    ></TextField>
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <Button
                            onClick={handleCheckBalance}
                            variant='contained'
                        >
                            Check
                        </Button>
                    )}
                </Box>
                <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                            Token Balance
                        </h3>
                        <Card sx={{ p: 3, flexGrow: 1 }}>
                            <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                <li>TokenA: {balance?.balanceA}</li>
                                <li>TokenB: {balance?.balanceB}</li>
                                <li>Liquidity: {balance?.liquidity}</li>
                            </ul>
                        </Card>
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <h3 style={{ marginTop: 0, marginBottom: "12px" }}>
                            Pool Reserves
                        </h3>
                        <Card sx={{ p: 3, flexGrow: 1 }}>
                            <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                <li>TokenA: {balance?.reservesA}</li>
                                <li>TokenB: {balance?.reservesB}</li>
                            </ul>
                        </Card>
                    </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
                <h2 style={{ marginBottom: "16px" }}>Token Swap</h2>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
                        <Button variant='outlined' onClick={handleSellA}>
                            Sell
                        </Button>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
                        <Button variant='outlined' onClick={handleSellB}>
                            Sell
                        </Button>
                    </Box>
                </Box>
            </Container>
        </>
    );
};
export default App;
