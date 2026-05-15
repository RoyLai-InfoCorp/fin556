import { ethers } from "ethers";

const useDapp = ({ setSigner }) => {
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

  return {
    connect,
  };
};

export default useDapp;
