import { ethers } from 'ethers';
import {
  DEX_ROUTERS,
  TOKENS,
  UNISWAP_V3_ROUTER_ABI,
  UNISWAP_V3_QUOTER_ABI,
  QUICKSWAP_V2_ROUTER_ABI,
  ERC20_ABI,
  SwapParams,
  SwapQuote,
  getDeadline,
  calculateMinAmountOut,
  UNISWAP_V3_DEFAULT_FEE,
  DEFAULT_SLIPPAGE
} from './dex-config';

export type DEXProvider = 'uniswap_v3' | 'quickswap_v2' | 'quickswap_v3';

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
  amountOut?: string;
  gasUsed?: string;
}

export class DEXService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;

  constructor(provider: ethers.Provider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;
  }

  /**
   * Get a quote for swapping tokens using Uniswap V3
   */
  async getUniswapV3Quote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    fee: number = UNISWAP_V3_DEFAULT_FEE
  ): Promise<SwapQuote> {
    try {
      const quoterContract = new ethers.Contract(
        DEX_ROUTERS.UNISWAP_V3.quoterV2,
        UNISWAP_V3_QUOTER_ABI,
        this.provider
      );

      const amountInWei = ethers.parseUnits(amountIn, await this.getTokenDecimals(tokenIn));
      
      // Get quote from Uniswap V3 quoter
      const quote = await quoterContract.quoteExactInputSingle.staticCall(
        tokenIn,
        tokenOut,
        fee,
        amountInWei,
        0 // sqrtPriceLimitX96 = 0 for no limit
      );

      const tokenOutDecimals = await this.getTokenDecimals(tokenOut);
      const amountOut = ethers.formatUnits(quote.amountOut || quote, tokenOutDecimals);

      // Calculate price impact (simplified)
      const priceImpact = this.calculatePriceImpact(amountIn, amountOut, tokenIn, tokenOut);

      return {
        amountOut,
        priceImpact,
        gasEstimate: '150000', // Estimated gas for Uniswap V3 swap
        route: [tokenIn, tokenOut],
        dex: 'Uniswap V3'
      };
    } catch (error: any) {
      throw new Error(`Failed to get Uniswap V3 quote: ${error.message}`);
    }
  }

  /**
   * Get a quote for swapping tokens using QuickSwap V2
   */
  async getQuickSwapV2Quote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<SwapQuote> {
    try {
      const routerContract = new ethers.Contract(
        DEX_ROUTERS.QUICKSWAP_V2.router,
        QUICKSWAP_V2_ROUTER_ABI,
        this.provider
      );

      const amountInWei = ethers.parseUnits(amountIn, await this.getTokenDecimals(tokenIn));
      const path = [tokenIn, tokenOut];

      // Get amounts out from QuickSwap V2
      const amounts = await routerContract.getAmountsOut(amountInWei, path);
      
      const tokenOutDecimals = await this.getTokenDecimals(tokenOut);
      const amountOut = ethers.formatUnits(amounts[1], tokenOutDecimals);

      const priceImpact = this.calculatePriceImpact(amountIn, amountOut, tokenIn, tokenOut);

      return {
        amountOut,
        priceImpact,
        gasEstimate: '120000', // Estimated gas for QuickSwap V2 swap
        route: path,
        dex: 'QuickSwap V2'
      };
    } catch (error: any) {
      throw new Error(`Failed to get QuickSwap V2 quote: ${error.message}`);
    }
  }

  /**
   * Execute a swap using Uniswap V3
   */
  async executeUniswapV3Swap(params: SwapParams): Promise<SwapResult> {
    try {
      const routerContract = new ethers.Contract(
        DEX_ROUTERS.UNISWAP_V3.router2,
        UNISWAP_V3_ROUTER_ABI,
        this.wallet
      );

      const tokenInDecimals = await this.getTokenDecimals(params.tokenIn);
      const amountIn = ethers.parseUnits(params.amountIn, tokenInDecimals);
      
      // Get quote to determine expected output
      const quote = await this.getUniswapV3Quote(
        params.tokenIn,
        params.tokenOut,
        params.amountIn
      );
      
      const minAmountOut = calculateMinAmountOut(
        quote.amountOut,
        params.slippageTolerance || DEFAULT_SLIPPAGE
      );
      
      const tokenOutDecimals = await this.getTokenDecimals(params.tokenOut);
      const amountOutMinimum = ethers.parseUnits(minAmountOut, tokenOutDecimals);

      // Check and approve token if necessary
      await this.ensureTokenApproval(
        params.tokenIn,
        DEX_ROUTERS.UNISWAP_V3.router2,
        amountIn
      );

      // Prepare swap parameters
      const swapParams = {
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        fee: UNISWAP_V3_DEFAULT_FEE,
        recipient: params.recipient,
        deadline: params.deadline || getDeadline(),
        amountIn: amountIn,
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0n
      };

      // Execute the swap
      const tx = await routerContract.exactInputSingle(swapParams);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        amountOut: quote.amountOut,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Uniswap V3 swap failed: ${error.message}`
      };
    }
  }

  /**
   * Execute a swap using QuickSwap V2
   */
  async executeQuickSwapV2Swap(params: SwapParams): Promise<SwapResult> {
    try {
      const routerContract = new ethers.Contract(
        DEX_ROUTERS.QUICKSWAP_V2.router,
        QUICKSWAP_V2_ROUTER_ABI,
        this.wallet
      );

      const tokenInDecimals = await this.getTokenDecimals(params.tokenIn);
      const amountIn = ethers.parseUnits(params.amountIn, tokenInDecimals);
      
      // Get quote
      const quote = await this.getQuickSwapV2Quote(
        params.tokenIn,
        params.tokenOut,
        params.amountIn
      );
      
      const minAmountOut = calculateMinAmountOut(
        quote.amountOut,
        params.slippageTolerance || DEFAULT_SLIPPAGE
      );
      
      const tokenOutDecimals = await this.getTokenDecimals(params.tokenOut);
      const amountOutMin = ethers.parseUnits(minAmountOut, tokenOutDecimals);

      // Check and approve token if necessary
      await this.ensureTokenApproval(
        params.tokenIn,
        DEX_ROUTERS.QUICKSWAP_V2.router,
        amountIn
      );

      const path = [params.tokenIn, params.tokenOut];
      
      // Execute the swap
      const tx = await routerContract.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        params.recipient,
        params.deadline || getDeadline()
      );
      
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        amountOut: quote.amountOut,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error: any) {
      return {
        success: false,
        error: `QuickSwap V2 swap failed: ${error.message}`
      };
    }
  }

  /**
   * Get the best quote across multiple DEXes
   */
  async getBestQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<SwapQuote & { dexProvider: DEXProvider }> {
    const quotes = await Promise.allSettled([
      this.getUniswapV3Quote(tokenIn, tokenOut, amountIn),
      this.getQuickSwapV2Quote(tokenIn, tokenOut, amountIn),
    ]);

    const validQuotes: Array<SwapQuote & { dexProvider: DEXProvider }> = [];

    if (quotes[0].status === 'fulfilled') {
      validQuotes.push({ ...quotes[0].value, dexProvider: 'uniswap_v3' });
    }
    
    if (quotes[1].status === 'fulfilled') {
      validQuotes.push({ ...quotes[1].value, dexProvider: 'quickswap_v2' });
    }

    if (validQuotes.length === 0) {
      throw new Error('No valid quotes available from any DEX');
    }

    // Return the quote with the highest output amount
    return validQuotes.reduce((best, current) => 
      parseFloat(current.amountOut) > parseFloat(best.amountOut) ? current : best
    );
  }

  /**
   * Execute swap using the best available DEX
   */
  async executeBestSwap(params: SwapParams): Promise<SwapResult> {
    try {
      const bestQuote = await this.getBestQuote(
        params.tokenIn,
        params.tokenOut,
        params.amountIn
      );

      console.log(`Using ${bestQuote.dex} for swap - Expected output: ${bestQuote.amountOut}`);

      switch (bestQuote.dexProvider) {
        case 'uniswap_v3':
          return await this.executeUniswapV3Swap(params);
        case 'quickswap_v2':
          return await this.executeQuickSwapV2Swap(params);
        default:
          throw new Error(`Unsupported DEX provider: ${bestQuote.dexProvider}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Best swap execution failed: ${error.message}`
      };
    }
  }

  /**
   * Helper function to get token decimals
   */
  private async getTokenDecimals(tokenAddress: string): Promise<number> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    return await contract.decimals();
  }

  /**
   * Helper function to ensure token approval
   */
  private async ensureTokenApproval(
    tokenAddress: string,
    spenderAddress: string,
    requiredAmount: bigint
  ): Promise<void> {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.wallet);
    
    const currentAllowance = await tokenContract.allowance(
      this.wallet.address,
      spenderAddress
    );

    if (currentAllowance < requiredAmount) {
      const approveTx = await tokenContract.approve(spenderAddress, requiredAmount);
      await approveTx.wait();
      console.log(`Approved ${tokenAddress} for ${spenderAddress}`);
    }
  }

  /**
   * Simple price impact calculation (placeholder - should use proper price oracles)
   */
  private calculatePriceImpact(
    amountIn: string,
    amountOut: string,
    tokenIn: string,
    tokenOut: string
  ): number {
    // This is a simplified calculation
    // In production, you should use proper price feeds
    return 0.1; // Return 0.1% as placeholder
  }

  /**
   * Get token balance for the connected wallet
   */
  async getTokenBalance(tokenAddress: string): Promise<string> {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
    const balance = await contract.balanceOf(this.wallet.address);
    const decimals = await contract.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  /**
   * Get native token (MATIC) balance
   */
  async getMaticBalance(): Promise<string> {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }
}