# 🔄 DEX Integration: Real Polygon Swaps with Anvil Fork

This project now includes **real DEX integration** that allows swapping POL (MATIC) to USDC using actual liquidity from Polygon mainnet DEXes like Uniswap V3 and QuickSwap.

## ✨ Features

- **Real DEX Integration**: Connect to actual Uniswap V3 and QuickSwap routers
- **Price Aggregation**: Automatically finds the best price across multiple DEXes
- **Anvil Fork**: Test with real mainnet state without spending actual tokens
- **Slippage Protection**: Configurable slippage tolerance
- **Gas Optimization**: Estimates and optimizes gas usage
- **Multi-Network Support**: Works with testnet, forked mainnet, and production

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Foundry (for Anvil)
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 3. Setup Environment for Forked Mainnet
```bash
# Copy example configuration
cp .env.example .env.local

# Edit .env.local for forked mainnet:
POLYGON_RPC_ENDPOINT=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_NETWORK_NAME=polygon-mainnet-fork
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

### 4. Start Anvil Fork (Terminal 1)
```bash
npm run fork:start
# Or manually: ./scripts/start-anvil-fork.sh
```

### 5. Test DEX Integration (Terminal 2)
```bash
npm run test:dex
```

### 6. Start Application (Terminal 3)
```bash
npm run dev
```

### 7. Use the Swap Interface
- Open http://localhost:3000
- Click on "🔄 Swap POL → USDC" tab
- Enter amount to swap
- Get real-time quotes from multiple DEXes
- Execute swap with actual transaction

## 📁 New Files and Structure

```
├── lib/
│   ├── dex-config.ts          # DEX router addresses and configurations
│   ├── dex-service.ts         # Main DEX integration service
│   └── web3.ts               # Updated with multi-network support
├── components/
│   ├── RealSwapForm.tsx      # Real DEX integration UI
│   └── SwapForm.tsx          # Original demo UI (for testnet)
├── scripts/
│   ├── start-anvil-fork.sh   # Anvil fork startup script
│   └── test-dex-integration.ts # DEX integration test
├── DEX_INTEGRATION.md        # Comprehensive documentation
├── .env.example              # Environment configuration examples
└── README_DEX.md            # This file
```

## 🔧 Supported DEX Protocols

### Uniswap V3 (Primary)
- **Router**: `0xe592427a0aece92de3edee1f18e0157c05861564`
- **Router2**: `0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45`
- **Features**: Best liquidity, multiple fee tiers (0.01%, 0.05%, 0.3%, 1%)

### QuickSwap V2
- **Router**: `0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff`
- **Features**: Lower fees, good MATIC/USDC liquidity

### QuickSwap V3
- **Router**: `0xf5b509bB0909a69B1c207E495f687a596C168E12`
- **Features**: Latest version with concentrated liquidity

## 🎯 How It Works

1. **Network Detection**: App automatically detects if you're on forked mainnet
2. **Price Fetching**: Queries multiple DEX routers for real-time prices
3. **Best Price Selection**: Automatically selects the DEX with the best output
4. **Token Approval**: Handles ERC-20 token approvals automatically
5. **Swap Execution**: Executes the swap with slippage protection
6. **Transaction Tracking**: Shows transaction status and updates balances

## 🧪 Testing

### Automated Testing
```bash
# Test DEX integration (with Anvil fork running)
npm run test:dex
```

### Manual Testing Checklist
- [ ] Fork starts successfully
- [ ] Real quotes appear (not mock data)
- [ ] Best price aggregation works
- [ ] Token approvals execute
- [ ] Swaps complete successfully
- [ ] Balances update correctly
- [ ] Error handling works

## ⚙️ Configuration

### Network Modes

#### **Testnet Mode** (Polygon Amoy)
```bash
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_NETWORK_NAME=polygon-amoy
```
- Shows demo/mock swap interface
- Safe for testing UI without real liquidity

#### **Forked Mainnet Mode**
```bash
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_NETWORK_NAME=polygon-mainnet-fork
POLYGON_RPC_ENDPOINT=http://localhost:8545
```
- Real DEX integration with actual liquidity
- Safe testing with forked state
- **Recommended for development**

#### **Production Mainnet**
```bash
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_NETWORK_NAME=polygon-mainnet
POLYGON_RPC_ENDPOINT=https://polygon-rpc.com
```
- Live production trading
- **Use with extreme caution**

## 💡 Key Code Examples

### Get Best Quote
```typescript
const quote = await dexService.getBestQuote(
  TOKENS.WMATIC,     // Input token
  TOKENS.USDC,       // Output token
  "1.0"              // Amount to swap
);
console.log(`Best price: ${quote.amountOut} USDC from ${quote.dex}`);
```

### Execute Swap
```typescript
const result = await dexService.executeBestSwap({
  tokenIn: TOKENS.WMATIC,
  tokenOut: TOKENS.USDC,
  amountIn: "1.0",
  slippageTolerance: 0.5,  // 0.5%
  recipient: wallet.address
});
```

## 🛡️ Security Notes

- **Test Keys Only**: Never use production private keys with forks
- **Local Testing**: All transactions are local when using Anvil fork
- **State Management**: Fork state becomes stale - restart periodically
- **Production Ready**: Code includes proper error handling and validation

## 📚 Documentation

- **[DEX_INTEGRATION.md](./DEX_INTEGRATION.md)**: Complete technical documentation
- **[.env.example](./.env.example)**: Configuration examples
- **Code Comments**: Detailed inline documentation

## 🎉 What's New

- ✅ Real Uniswap V3 integration
- ✅ QuickSwap V2/V3 support
- ✅ Price aggregation across DEXes
- ✅ Anvil forking setup
- ✅ Automated testing
- ✅ Multi-network configuration
- ✅ Production-ready error handling
- ✅ Comprehensive documentation

## 🐛 Troubleshooting

**Fork won't start?**
- Check Foundry installation: `anvil --version`
- Verify RPC endpoint: `curl https://polygon-rpc.com`

**No quotes available?**
- Ensure Anvil fork is running on port 8545
- Check network configuration in `.env.local`
- Verify token addresses are correct

**Swaps fail?**
- Check account has sufficient MATIC balance
- Increase slippage tolerance
- Verify token approvals worked

## 🔮 Future Enhancements

- [ ] MEV protection integration
- [ ] Multiple slippage strategies
- [ ] Historical price charts
- [ ] Limit order functionality
- [ ] Multi-token swaps
- [ ] Gas price optimization
- [ ] Mobile-responsive UI improvements

---

**Ready to start swapping with real DEX liquidity!** 🚀

The integration provides production-grade DEX functionality while maintaining safe testing practices through Anvil forking.