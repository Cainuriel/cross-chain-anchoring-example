import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

// Configuración por defecto para desarrollo (NO USAR EN PRODUCCIÓN)
const defaultMnemonic = "test test test test test test test test test test test junk";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
      evmVersion: "berlin",
    },
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      accounts: process.env.ADMIN_WALLET_PRIV_KEY ? 
        [process.env.ADMIN_WALLET_PRIV_KEY] : 
        { mnemonic: defaultMnemonic },
      gasPrice: 400000000000,
      timeout: 120000, 
    },
    amoy: {
      url: "https://polygon-amoy.drpc.org",
      accounts: process.env.ADMIN_WALLET_PRIV_KEY ? 
        [process.env.ADMIN_WALLET_PRIV_KEY] : 
        { mnemonic: defaultMnemonic },
      gasPrice: 400000000000,
      timeout: 300000, 
    },
    alastria: {
      url: "http://108.142.237.13:8545",
      accounts: process.env.ADMIN_WALLET_PRIV_KEY ? 
        [process.env.ADMIN_WALLET_PRIV_KEY] : 
        { mnemonic: defaultMnemonic },
    },
  },
  // Configuración para verificación de contratos
  etherscan: {
    apiKey: {
      // Ethereum mainnet & testnets
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      goerli: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      
      // Polygon
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      
      // BSC
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || "",
    }
  },
  // Configuración adicional para sourcify
  sourcify: {
    enabled: true
  },
};

export default config;

