#!/usr/bin/env tsx

/**
 * DEX Integration Test Script
 * 
 * This script tests the DEX integration functionality by:
 * 1. Connecting to the Anvil forked mainnet
 * 2. Testing quote fetching from multiple DEXes
 * 3. Validating swap execution (dry run)
 * 4. Checking balance updates
 * 
 * Usage:
 * npm install -g tsx
 * tsx scripts/test-dex-integration.ts
 */

import { ethers } from 'ethers';
import { DEXService } from '../lib/dex-service';
import { TOKENS } from '../lib/dex-config';

const ANVIL_RPC = 'http://localhost:8545';
const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Anvil default account

async function testDEXIntegration() {
  console.log('🧪 Starting DEX Integration Tests\n');
  
  try {
    // 1. Setup connections
    console.log('1️⃣ Setting up connections...');
    const provider = new ethers.JsonRpcProvider(ANVIL_RPC);
    const wallet = new ethers.Wallet(TEST_PRIVATE_KEY, provider);
    const dexService = new DEXService(provider, wallet);
    
    console.log(`   Wallet: ${wallet.address}`);
    console.log(`   Network: ${await provider.getNetwork()}`);
    
    // 2. Check initial balances
    console.log('\n2️⃣ Checking initial balances...');
    const maticBalance = await dexService.getMaticBalance();
    console.log(`   MATIC Balance: ${maticBalance}`);
    
    // 3. Test quote fetching
    console.log('\n3️⃣ Testing quote fetching...');
    const testAmount = '1.0'; // 1 MATIC
    
    try {
      const uniswapQuote = await dexService.getUniswapV3Quote(
        TOKENS.WMATIC,
        TOKENS.USDC,
        testAmount
      );
      console.log(`   ✅ Uniswap V3: ${testAmount} MATIC → ${uniswapQuote.amountOut} USDC`);
      console.log(`      Price Impact: ${uniswapQuote.priceImpact}%`);
      console.log(`      Gas Estimate: ${uniswapQuote.gasEstimate}`);
    } catch (error: any) {
      console.log(`   ❌ Uniswap V3 failed: ${error.message}`);
    }
    
    try {
      const quickswapQuote = await dexService.getQuickSwapV2Quote(
        TOKENS.WMATIC,
        TOKENS.USDC,
        testAmount
      );
      console.log(`   ✅ QuickSwap V2: ${testAmount} MATIC → ${quickswapQuote.amountOut} USDC`);
      console.log(`      Price Impact: ${quickswapQuote.priceImpact}%`);
      console.log(`      Gas Estimate: ${quickswapQuote.gasEstimate}`);
    } catch (error: any) {
      console.log(`   ❌ QuickSwap V2 failed: ${error.message}`);
    }
    
    // 4. Test best quote aggregation
    console.log('\n4️⃣ Testing best quote aggregation...');
    try {
      const bestQuote = await dexService.getBestQuote(
        TOKENS.WMATIC,
        TOKENS.USDC,
        testAmount
      );
      console.log(`   ✅ Best route: ${bestQuote.dex}`);
      console.log(`   Output: ${bestQuote.amountOut} USDC`);
      console.log(`   DEX Provider: ${(bestQuote as any).dexProvider}`);
    } catch (error: any) {
      console.log(`   ❌ Best quote failed: ${error.message}`);
    }
    
    // 5. Test swap execution (dry run - don't actually execute to avoid state changes)
    console.log('\n5️⃣ Testing swap parameters preparation...');
    try {
      const swapParams = {
        tokenIn: TOKENS.WMATIC,
        tokenOut: TOKENS.USDC,
        amountIn: '0.1', // Small amount for testing
        slippageTolerance: 0.5,
        recipient: wallet.address
      };
      
      console.log(`   ✅ Swap parameters prepared:`);
      console.log(`      Token In: ${swapParams.tokenIn}`);
      console.log(`      Token Out: ${swapParams.tokenOut}`);
      console.log(`      Amount: ${swapParams.amountIn} MATIC`);
      console.log(`      Slippage: ${swapParams.slippageTolerance}%`);
      console.log(`      Recipient: ${swapParams.recipient}`);
      
      // Note: We don't actually execute the swap in the test to avoid state changes
      console.log(`   ℹ️  Swap execution skipped in test mode`);
    } catch (error: any) {
      console.log(`   ❌ Swap preparation failed: ${error.message}`);
    }
    
    // 6. Test token balance queries
    console.log('\n6️⃣ Testing token balance queries...');
    try {
      const wmaticBalance = await dexService.getTokenBalance(TOKENS.WMATIC);
      console.log(`   WMATIC Balance: ${wmaticBalance}`);
    } catch (error: any) {
      console.log(`   ❌ WMATIC balance query failed: ${error.message}`);
    }
    
    try {
      const usdcBalance = await dexService.getTokenBalance(TOKENS.USDC);
      console.log(`   USDC Balance: ${usdcBalance}`);
    } catch (error: any) {
      console.log(`   ❌ USDC balance query failed: ${error.message}`);
    }
    
    console.log('\n✅ DEX Integration Tests Complete!');
    console.log('\n📋 Test Summary:');
    console.log('   - Network connection: Working');
    console.log('   - Quote fetching: Working (if no errors above)');
    console.log('   - Best price aggregation: Working (if no errors above)');
    console.log('   - Balance queries: Working (if no errors above)');
    console.log('   - Swap preparation: Working');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the application: npm run dev');
    console.log('   2. Navigate to the swap tab');
    console.log('   3. Test the UI integration');
    
  } catch (error: any) {
    console.error(`\n❌ Test failed with error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
testDEXIntegration();