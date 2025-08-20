// DEX Configuration for Polygon Mainnet
// Updated 2024 - Verified contract addresses

export const POLYGON_MAINNET_CHAIN_ID = 137;
export const POLYGON_MAINNET_RPC = "https://polygon-rpc.com";

// Token Addresses on Polygon Mainnet
export const TOKENS = {
  WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
} as const;

// DEX Router Configurations
export const DEX_ROUTERS = {
  UNISWAP_V3: {
    name: "Uniswap V3",
    router: "0xe592427a0aece92de3edee1f18e0157c05861564",
    router2: "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45", // SwapRouter02 - supports multicall
    universalRouter: "0x4c60051384bd2d3c01bfc845cf5f4b44bcbe9de5",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    quoterV2: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
    positionManager: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    feeTiers: [100, 500, 3000, 10000], // 0.01%, 0.05%, 0.3%, 1%
  },
  QUICKSWAP_V2: {
    name: "QuickSwap V2",
    router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
    factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
  },
  QUICKSWAP_V3: {
    name: "QuickSwap V3",
    router: "0xf5b509bB0909a69B1c207E495f687a596C168E12",
    factory: "0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28",
    quoter: "0xa15F0D7377B2A0C3c5cF3C96B4C7b5Bf51A63c55",
    positionManager: "0x8eF88E4c7CfbbaC1C163f7eddd4B578792201de6",
    feeTiers: [100, 500, 3000, 10000],
  },
  SUSHISWAP: {
    name: "SushiSwap",
    router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    tridentRouter: "0xc5017BE80b4446988e8686168396289a9A62668E",
    factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  }
} as const;

// Swap Router ABIs - Minimal required functions
export const UNISWAP_V3_ROUTER_ABI = [
  "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)",
  "function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountIn)",
  "function multicall(uint256 deadline, bytes[] calldata data) external payable returns (bytes[] memory results)",
] as const;

export const UNISWAP_V3_QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountIn, uint160 sqrtPriceLimitX96) external returns (uint256 amountOut)",
  "function quoteExactOutputSingle(address tokenIn, address tokenOut, uint24 fee, uint256 amountOut, uint160 sqrtPriceLimitX96) external returns (uint256 amountIn)",
] as const;

export const QUICKSWAP_V2_ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",
] as const;

// ERC20 ABI for token approvals
export const ERC20_ABI = [
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
] as const;

// Swap Parameters Interface
export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance: number; // percentage, e.g., 0.5 for 0.5%
  recipient: string;
  deadline?: number; // timestamp, defaults to 20 minutes from now
}

export interface SwapQuote {
  amountOut: string;
  priceImpact: number;
  gasEstimate: string;
  route: string[];
  dex: string;
}

// Default swap settings
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const DEFAULT_DEADLINE_MINUTES = 20;
export const UNISWAP_V3_DEFAULT_FEE = 3000; // 0.3%

// Helper function to get deadline timestamp
export function getDeadline(minutes: number = DEFAULT_DEADLINE_MINUTES): number {
  return Math.floor(Date.now() / 1000) + (minutes * 60);
}

// Helper function to calculate minimum amount out with slippage
export function calculateMinAmountOut(amountOut: string, slippageTolerance: number): string {
  const slippageMultiplier = (100 - slippageTolerance) / 100;
  const minAmount = (parseFloat(amountOut) * slippageMultiplier).toString();
  return minAmount;
}