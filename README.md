# USDC Polygon Payment Interface

A simple web interface for sending USDC payments on the Polygon Amoy testnet.

## What Was Built

This project provides a complete USDC payment system with the following components:

### Core Architecture
- **Next.js 14** with App Router and TypeScript
- **Ethers.js v6** for Web3 blockchain interactions
- **Tailwind CSS** for responsive UI styling
- **Server-side wallet** using provided private key

### Key Components
- `lib/web3.ts` - Web3 provider setup and USDC contract configuration
- `lib/usdc-service.ts` - Payment service with balance checking and transaction handling
- `components/PaymentForm.tsx` - Main payment interface with form validation
- `components/TransactionStatus.tsx` - Real-time transaction tracking component
- `app/page.tsx` - Main application page orchestrating all components

### Features Implemented
- **Payment Processing**: Send USDC to any valid Ethereum address
- **Balance Display**: Real-time wallet balance and address display  
- **Form Validation**: Address validation, amount checking, and insufficient funds detection
- **Transaction Tracking**: Live status updates with block confirmation
- **Error Handling**: Comprehensive error messages and user feedback
- **PolygonScan Integration**: Direct links to view transactions on block explorer

## Setup

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env.local`:
- `POLYGON_RPC_ENDPOINT=https://rpc-amoy.polygon.technology`
- `PRIVATE_KEY=102d511bc2aa7aaab7391d37484b52cf9e187f2f4ba16b9a3b155c5f5e0692c2`
- `NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. The interface automatically loads your wallet address and USDC balance
2. Enter recipient address (must be valid Ethereum address)
3. Enter amount to send (validates against available balance)
4. Click "Send Payment" to execute the transaction
5. Monitor transaction status with real-time updates
6. View transaction details on PolygonScan via provided links

## Technical Details

### Smart Contract Integration
- Uses standard ERC-20 interface for USDC token transfers
- 6 decimal places for USDC amounts (standard for USDC)
- Built-in allowance and balance checking

### Network Configuration
- **Network**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC Endpoint**: https://rpc-amoy.polygon.technology
- **USDC Contract**: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
- **Block Explorer**: https://amoy.polygonscan.com/

### Security Considerations
- Private key stored in environment variables (server-side only)
- Address validation prevents invalid recipients
- Balance checking prevents overdraft attempts
- Transaction status confirmation before success display

## Future Enhancement Ideas

- Multi-wallet support (MetaMask, WalletConnect)
- Transaction history and receipts
- Batch payments functionality
- Mainnet deployment configuration
- QR code generation for payment requests
- Mobile-responsive optimizations
- Gas fee estimation and customization