# CLAUDE.md - Project Context for AI Assistant

This file contains important context about the USDC Polygon Payment Interface project to help AI assistants understand the codebase and provide better assistance.

## Project Overview

This is a Next.js-based web application that provides a comprehensive interface for:
1. **USDC Payments**: Send USDC payments on Polygon Amoy testnet
2. **DEX Integration**: Real POL to USDC swaps using Uniswap V3 and QuickSwap
3. **Anvil Fork Support**: Test with real mainnet liquidity using forked state

The application supports multiple network configurations and uses server-side wallet functionality with a pre-configured private key.

## Architecture & Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3 Library**: Ethers.js v6
- **Networks**: 
  - Polygon Amoy Testnet (Chain ID: 80002)
  - Polygon Mainnet (Chain ID: 137)
  - Polygon Mainnet Fork (Anvil - Chain ID: 137)
- **Tokens**: USDC (6 decimals), MATIC/POL (18 decimals)
- **DEX Integration**: Uniswap V3, QuickSwap V2/V3
- **Testing**: Anvil (Foundry) for mainnet forking

## Key Configuration

### Environment Variables (`.env.local`)

**Testnet Configuration (Polygon Amoy):**
- `POLYGON_RPC_ENDPOINT=https://rpc-amoy.polygon.technology`
- `NEXT_PUBLIC_CHAIN_ID=80002`
- `NEXT_PUBLIC_NETWORK_NAME=polygon-amoy`
- `PRIVATE_KEY=102d511bc2aa7aaab7391d37484b52cf9e187f2f4ba16b9a3b155c5f5e0692c2`
- `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`

**Forked Mainnet Configuration (Anvil):**
- `POLYGON_RPC_ENDPOINT=http://localhost:8545`
- `NEXT_PUBLIC_CHAIN_ID=137`
- `NEXT_PUBLIC_NETWORK_NAME=polygon-mainnet-fork`
- `PRIVATE_KEY=your_test_private_key`
- `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

### Important Constants
- **Testnet Chain ID**: 80002 (Polygon Amoy)
- **Mainnet Chain ID**: 137 (Polygon)
- **USDC Decimals**: 6
- **MATIC Decimals**: 18
- **Block Explorers**: 
  - Amoy: https://amoy.polygonscan.com/
  - Mainnet: https://polygonscan.com/

## File Structure & Components

### Core Libraries
- `lib/web3.ts` - Multi-network Web3 provider setup, contract configuration, utility functions
- `lib/usdc-service.ts` - Payment service class with methods for balance, transfers, and transaction status
- `lib/dex-config.ts` - DEX router addresses, ABIs, and configuration for Polygon mainnet
- `lib/dex-service.ts` - Comprehensive DEX integration service supporting Uniswap V3 and QuickSwap

### React Components
- `components/PaymentForm.tsx` - USDC payment interface with form validation and wallet info
- `components/SwapForm.tsx` - Demo swap interface for testnet (mock functionality)
- `components/RealSwapForm.tsx` - Real DEX integration interface for forked mainnet
- `components/TransactionStatus.tsx` - Real-time transaction tracking with PolygonScan integration
- `app/page.tsx` - Main application page with tabbed interface for payments and swaps
- `app/layout.tsx` - Root layout with global styles and metadata

### Scripts & Tools
- `scripts/start-anvil-fork.sh` - Automated Anvil fork setup for Polygon mainnet
- `scripts/test-dex-integration.ts` - Comprehensive DEX integration testing script

### Configuration Files
- `package.json` - Dependencies including Next.js, React, Ethers.js, TypeScript, tsx for testing
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration with environment variable exposure
- `.env.example` - Environment variable examples for all network configurations

### Documentation
- `DEX_INTEGRATION.md` - Comprehensive guide for DEX integration and Anvil fork usage
- `README_DEX.md` - Quick start guide for the DEX functionality
- `CLAUDE.md` - This file (project context and instructions)

## Code Patterns & Conventions

### USDC Amount Handling
- Always use 6 decimals for USDC (standard)
- Use `ethers.formatUnits(amount, 6)` to display amounts
- Use `ethers.parseUnits(amount, 6)` to parse user input

### Error Handling
- Comprehensive try/catch blocks in all async operations
- User-friendly error messages in UI components
- Address validation using `ethers.isAddress()`
- Balance checking before transactions

### State Management
- Uses React hooks (useState, useEffect) for component state
- No external state management library (Redux, Zustand) currently
- Transaction state passed between components via props

## Development Commands

```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run fork:start   # Start Anvil fork of Polygon mainnet
npm run test:dex     # Test DEX integration functionality
```

## Testing Considerations

### Testing Approaches
- **Automated DEX Testing**: `npm run test:dex` - Tests DEX integration with forked mainnet
- **Manual Testing**: UI testing on Polygon Amoy testnet for basic functionality
- **Anvil Fork Testing**: Real DEX functionality testing with actual mainnet state
- **PolygonScan Integration**: Transaction verification for all networks

### Testing Environments
- **Testnet**: Safe testing with mock data and limited functionality
- **Forked Mainnet**: Full DEX functionality with real liquidity, zero cost
- **Production**: Live trading (use with extreme caution)

## Security Notes

- Private key is stored in environment variables (server-side)
- All transactions are signed server-side using the configured wallet
- Address validation prevents invalid recipients
- Balance validation prevents overdraft attempts

## DEX Integration Features

### Current DEX Functionality
- **Multi-DEX Support**: Uniswap V3, QuickSwap V2/V3 integration
- **Price Aggregation**: Automatically finds best prices across DEXes
- **Real Liquidity**: Uses actual Polygon mainnet liquidity pools via Anvil fork
- **Slippage Protection**: Configurable slippage tolerance (default 0.5%)
- **Gas Optimization**: Estimates and optimizes gas usage
- **Token Approvals**: Handles ERC-20 approvals automatically
- **Network Detection**: UI adapts based on connected network

### Supported DEX Routers
- **Uniswap V3 Router**: `0xe592427a0aece92de3edee1f18e0157c05861564`
- **Uniswap V3 Router2**: `0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45`
- **QuickSwap V2 Router**: `0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff`
- **QuickSwap V3 Router**: `0xf5b509bB0909a69B1c207E495f687a596C168E12`

## Future Development Ideas

When extending this project, consider:

1. **Multi-wallet Integration**: Add MetaMask, WalletConnect support
2. **Transaction History**: Store and display past transactions
3. **Batch Payments**: Allow multiple recipients in one transaction
4. **Advanced DEX Features**: MEV protection, limit orders, multi-token swaps
5. **Mobile Responsive**: Enhanced mobile UI/UX
6. **QR Codes**: Generate payment request QR codes
7. **Notifications**: Real-time transaction notifications
8. **Analytics**: Price charts, transaction analytics, portfolio tracking

## Common Issues & Solutions

### Payment Issues
- **Transaction Pending**: Check network connectivity and gas prices
- **Insufficient Balance**: Verify USDC balance on respective network
- **Invalid Address**: Ensure recipient address is valid Ethereum format
- **RPC Issues**: May need to switch RPC endpoints if network is unstable

### DEX Integration Issues
- **Fork Won't Start**: Check Foundry installation (`anvil --version`)
- **No Quotes Available**: Ensure Anvil fork is running on correct port (8545)
- **Swap Fails**: Check sufficient MATIC balance and increase slippage tolerance
- **Network Detection**: Verify environment variables match desired network configuration
- **Token Approvals**: Ensure wallet has sufficient balance for both swap amount and gas

## Dependencies to Note

- `ethers@^6.8.0` - Web3 interactions (v6 syntax differs from v5)
- `next@^14.0.0` - Uses App Router (not Pages Router)
- `typescript@^5.0.0` - Latest TypeScript features enabled
- `tailwindcss@^3.3.0` - Modern CSS framework for styling
- `tsx@^4.0.0` - TypeScript execution for testing scripts

## Quick Start Guide

### For Basic USDC Payments (Testnet)
```bash
npm install
npm run dev
# Use default .env.local configuration
```

### For DEX Integration (Forked Mainnet)
```bash
# 1. Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# 2. Configure for forked mainnet
cp .env.example .env.local
# Edit .env.local with forked mainnet settings

# 3. Start Anvil fork (Terminal 1)
npm run fork:start

# 4. Test DEX integration (Terminal 2)
npm run test:dex

# 5. Start application (Terminal 3)
npm run dev
```

This context should help future development and modifications to the USDC payment interface and DEX integration system.