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
import { getAccount } from "./dapp";

const App = () => {
    const [address, setAddress] = useState(null);
    const tokenAddrA = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"; // tokenA
    const tokenAddrB = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"; // tokenB
    const balance = {
        balanceA: 100,
        balanceB: 200,
        liquidity: 50,
        reservesA: 500,
        reservesB: 1000,
    };
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
                    ></TextField>
                    <TextField
                        id='tokenAddrB'
                        label='TokenB Address'
                        value={tokenAddrB}
                        sx={{ flex: 1 }}
                    ></TextField>
                    <Button variant='contained'>Check</Button>
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
                    <TextField id='amtA' label='TokenA Amount' fullWidth />
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant='contained'>Buy</Button>
                        <Button variant='outlined'>Sell</Button>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField id='amtB' label='TokenB Amount' fullWidth />
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Button variant='contained'>Buy</Button>
                        <Button variant='outlined'>Sell</Button>
                    </Box>
                </Box>
            </Container>
        </>
    );
};
export default App;
