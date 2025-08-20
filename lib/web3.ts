import { ethers } from 'ethers';

// Network configuration
export const NETWORKS = {
  POLYGON_AMOY: {
    chainId: 80002,
    name: 'polygon-amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    usdcAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582'
  },
  POLYGON_MAINNET: {
    chainId: 137,
    name: 'polygon-mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    usdcAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
  },
  POLYGON_MAINNET_FORK: {
    chainId: 137,
    name: 'polygon-mainnet-fork',
    rpcUrl: 'http://localhost:8545',
    usdcAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
  }
} as const;

// Get current network configuration
function getCurrentNetwork() {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '80002');
  const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME || 'polygon-amoy';
  
  if (chainId === 137) {
    return networkName === 'polygon-mainnet-fork' 
      ? NETWORKS.POLYGON_MAINNET_FORK 
      : NETWORKS.POLYGON_MAINNET;
  }
  
  return NETWORKS.POLYGON_AMOY;
}

export const CURRENT_NETWORK = getCurrentNetwork();
export const POLYGON_AMOY_CHAIN_ID = 80002; // Keep for backward compatibility
export const USDC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || CURRENT_NETWORK.usdcAddress;

export const USDC_ABI = [
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

export function getProvider() {
  return new ethers.JsonRpcProvider(process.env.POLYGON_RPC_ENDPOINT);
}

export function getWallet() {
  const provider = getProvider();
  return new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
}

export function getUSDCContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const provider = signerOrProvider || getProvider();
  return new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, provider);
}

export function formatUSDC(amount: bigint): string {
  return ethers.formatUnits(amount, 6);
}

export function parseUSDC(amount: string): bigint {
  return ethers.parseUnits(amount, 6);
}