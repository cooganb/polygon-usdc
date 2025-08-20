#!/bin/bash

# Anvil Fork Setup for Polygon Mainnet
# This script starts an Anvil fork of Polygon mainnet for local DEX testing

echo "🔧 Starting Anvil fork of Polygon mainnet..."

# Check if foundry is installed
if ! command -v anvil &> /dev/null; then
    echo "❌ Anvil not found. Please install Foundry first:"
    echo "   curl -L https://foundry.paradigm.xyz | bash"
    echo "   foundryup"
    exit 1
fi

# Default configuration
FORK_URL="https://polygon-rpc.com"
CHAIN_ID=137
PORT=8545
ACCOUNTS=10
BALANCE=10000

# Override with environment variables if they exist
if [ ! -z "$POLYGON_RPC_URL" ]; then
    FORK_URL="$POLYGON_RPC_URL"
fi

if [ ! -z "$ANVIL_PORT" ]; then
    PORT="$ANVIL_PORT"
fi

echo "🌐 Fork URL: $FORK_URL"
echo "⚡ Chain ID: $CHAIN_ID"
echo "🔌 Port: $PORT"
echo "👥 Accounts: $ACCOUNTS"
echo "💰 Balance per account: $BALANCE ETH"

# Start Anvil with Polygon mainnet fork
anvil \
    --fork-url $FORK_URL \
    --chain-id $CHAIN_ID \
    --port $PORT \
    --accounts $ACCOUNTS \
    --balance $BALANCE \
    --gas-limit 30000000 \
    --gas-price 1000000000 \
    --block-time 2 \
    --steps-tracing \
    --auto-impersonate

echo "✅ Anvil fork started successfully!"
echo "🔗 Connect your app to: http://localhost:$PORT"
echo "🛑 Press Ctrl+C to stop the fork"