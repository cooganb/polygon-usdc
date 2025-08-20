# DEX Integration Guide: Real Polygon Mainnet Swaps with Anvil Fork

This guide explains how to use Anvil to fork Polygon mainnet and implement real DEX swaps for POL to USDC using actual liquidity pools from Uniswap V3 and QuickSwap.

## 🔄 Overview

The DEX integration allows users to:
- Swap MATIC (POL) for USDC using real liquidity from Polygon mainnet
- Access live prices from Uniswap V3 and QuickSwap routers
- Execute swaps with actual slippage and gas costs
- Test with forked mainnet state without spending real tokens

## 🛠️ Prerequisites

### Install Foundry (Anvil)
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
anvil --version
```

### Environment Setup
Create a `.env.local` file for forked mainnet configuration:
```bash
# Copy the example
cp .env.example .env.local

# Edit for forked mainnet
POLYGON_RPC_ENDPOINT=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_NETWORK_NAME=polygon-mainnet-fork
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

## 🚀 Quick Start

### 1. Start Anvil Fork
```bash
# Start the fork (in a separate terminal)
./scripts/start-anvil-fork.sh

# Or manually:
anvil --fork-url https://polygon-rpc.com --chain-id 137 --port 8545
```

### 2. Fund Your Test Wallet
```bash
# The fork starts with funded accounts, but you can impersonate any address
# Example: Impersonate a whale address to get tokens
cast send --rpc-url http://localhost:8545 --unlocked 0xYourAddress --value 100ether 0x0000000000000000000000000000000000000000
```

### 3. Start the Application
```bash
npm run dev
```

### 4. Test Swaps
- Navigate to the swap tab in the application
- Enter MATIC amount to swap
- Get real-time quotes from multiple DEXes
- Execute swap with actual transaction

## 🔧 Technical Architecture

### DEX Integration Components

#### 1. **DEX Configuration** (`lib/dex-config.ts`)
- Contract addresses for all major Polygon DEXes
- ABI definitions for router contracts
- Token addresses and metadata
- Helper functions for calculations

#### 2. **DEX Service** (`lib/dex-service.ts`)
- Unified interface for multiple DEX protocols
- Price aggregation across Uniswap V3 and QuickSwap
- Swap execution with slippage protection
- Gas estimation and optimization

#### 3. **Network Configuration** (`lib/web3.ts`)
- Multi-network support (Amoy testnet, mainnet, forked mainnet)
- Dynamic RPC endpoint switching
- Environment-based configuration

### Supported DEX Protocols

#### **Uniswap V3** (Recommended for best liquidity)
```typescript
Router: 0xe592427a0aece92de3edee1f18e0157c05861564
Router2: 0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45
Quoter V2: 0x61fFE014bA17989E743c5F6cB21bF9697530B21e
Fee Tiers: 0.01%, 0.05%, 0.3%, 1%
```

#### **QuickSwap V2** (Lower fees, good liquidity)
```typescript
Router: 0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff
Factory: 0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32
```

#### **QuickSwap V3** (Latest version)
```typescript
Router: 0xf5b509bB0909a69B1c207E495f687a596C168E12
Factory: 0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28
```

## 💡 Usage Examples

### Basic Swap
```typescript
import { DEXService } from './lib/dex-service';
import { TOKENS } from './lib/dex-config';

const dexService = new DEXService(provider, wallet);

// Get best quote
const quote = await dexService.getBestQuote(
  TOKENS.WMATIC,
  TOKENS.USDC,
  "1.0" // 1 MATIC
);

// Execute swap
const result = await dexService.executeBestSwap({
  tokenIn: TOKENS.WMATIC,
  tokenOut: TOKENS.USDC,
  amountIn: "1.0",
  slippageTolerance: 0.5, // 0.5%
  recipient: wallet.address
});
```

### Custom DEX Selection
```typescript
// Use specific DEX
const uniswapQuote = await dexService.getUniswapV3Quote(
  TOKENS.WMATIC,
  TOKENS.USDC,
  "1.0"
);

const quickswapResult = await dexService.executeQuickSwapV2Swap({
  tokenIn: TOKENS.WMATIC,
  tokenOut: TOKENS.USDC,
  amountIn: "1.0",
  slippageTolerance: 0.5,
  recipient: wallet.address
});
```

## 🧪 Testing Workflow

### Test Scenarios
1. **Price Accuracy**: Compare quotes against DEX frontends
2. **Slippage Handling**: Test with different slippage tolerances
3. **Gas Estimation**: Verify gas costs are reasonable
4. **Error Handling**: Test with insufficient balance, etc.
5. **Multi-DEX Aggregation**: Ensure best price routing works

### Development Testing
```bash
# Terminal 1: Start fork
./scripts/start-anvil-fork.sh

# Terminal 2: Run application
npm run dev

# Terminal 3: Monitor transactions
cast logs --rpc-url http://localhost:8545
```

### Manual Testing Checklist
- [ ] Fork starts successfully with funded accounts
- [ ] Application connects to fork (check network indicator)
- [ ] Real quotes are fetched from DEX routers
- [ ] Token approvals work correctly
- [ ] Swaps execute and update balances
- [ ] Transaction receipts are valid
- [ ] Error states handle gracefully

## 📋 Configuration Options

### Environment Variables
```bash
# Required
POLYGON_RPC_ENDPOINT=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_NETWORK_NAME=polygon-mainnet-fork
PRIVATE_KEY=your_private_key
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

# Optional
ANVIL_PORT=8545                    # Custom Anvil port
POLYGON_RPC_URL=https://polygon-rpc.com  # Custom RPC for forking
NEXT_PUBLIC_DEFAULT_SLIPPAGE=0.5   # Default slippage %
```

### Anvil Fork Options
```bash
anvil \
  --fork-url https://polygon-rpc.com \
  --chain-id 137 \
  --port 8545 \
  --accounts 10 \
  --balance 10000 \
  --gas-limit 30000000 \
  --gas-price 1000000000 \
  --block-time 2 \
  --steps-tracing \
  --auto-impersonate
```

## ⚠️ Important Notes

### Security Considerations
- **Never use production private keys** with forked networks
- Generated test accounts are prefunded automatically
- All transactions are local and don't affect mainnet
- Private keys in environment files should be test-only

### Limitations
- Fork state becomes stale over time - restart periodically
- Some MEV and arbitrage opportunities may not be available
- Gas prices are simulated and may differ from mainnet
- Complex DeFi interactions may behave differently

### Performance Tips
- Use faster RPC endpoints for forking (Alchemy, Infura, QuickNode)
- Increase `--gas-limit` for complex swaps
- Set reasonable `--block-time` for testing (1-2 seconds)
- Use `--steps-tracing` for debugging transaction failures

## 🐛 Troubleshooting

### Common Issues

#### **1. Fork Won't Start**
```bash
Error: Failed to get chainId
```
**Solution**: Check RPC endpoint is reachable
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"}' \
  https://polygon-rpc.com
```

#### **2. No Liquidity Found**
```bash
Error: No valid quotes available from any DEX
```
**Solution**: Ensure tokens have liquidity pools
- Check pool exists on Polygon mainnet
- Verify token addresses are correct
- Try different token pairs

#### **3. Transaction Reverts**
```bash
Error: Transaction reverted
```
**Solution**: Common causes and fixes
- Insufficient token balance → Fund the account
- Insufficient gas → Increase gas limit
- Slippage too low → Increase slippage tolerance
- Token not approved → Check approval step

#### **4. Application Won't Connect**
```bash
Error: could not detect network
```
**Solution**: Environment configuration
- Verify `NEXT_PUBLIC_CHAIN_ID=137`
- Check `POLYGON_RPC_ENDPOINT=http://localhost:8545`
- Restart application after env changes

### Debugging Commands
```bash
# Check fork status
curl -X POST -H "Content-Type: application/json" \
  --data '{"method":"eth_chainId","params":[],"id":1,"jsonrpc":"2.0"}' \
  http://localhost:8545

# Check account balance
cast balance 0xYourAddress --rpc-url http://localhost:8545

# Monitor logs
cast logs --rpc-url http://localhost:8545

# Get transaction receipt
cast receipt 0xTransactionHash --rpc-url http://localhost:8545
```

## 🔄 Network Switching

The application automatically detects the network and shows appropriate interfaces:

- **Polygon Amoy Testnet**: Shows demo swap interface
- **Forked Mainnet**: Shows real DEX integration
- **Polygon Mainnet**: Production mode (use carefully)

To switch networks, update `.env.local` and restart the application.

## 📈 Production Deployment

For production deployment with real mainnet:

1. **Use Production RPC**:
   ```bash
   POLYGON_RPC_ENDPOINT=https://polygon-rpc.com
   NEXT_PUBLIC_CHAIN_ID=137
   NEXT_PUBLIC_NETWORK_NAME=polygon-mainnet
   ```

2. **Security Hardening**:
   - Use secure private key management (AWS KMS, etc.)
   - Implement proper error handling and logging
   - Add transaction monitoring and alerts
   - Use multiple RPC endpoints for redundancy

3. **Performance Optimization**:
   - Implement quote caching
   - Add retry logic for failed transactions
   - Use gas price optimization
   - Consider MEV protection

This implementation provides a robust foundation for DEX integration that works with real Polygon mainnet liquidity while maintaining safe testing practices.