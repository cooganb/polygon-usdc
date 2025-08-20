'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getWallet, getProvider, CURRENT_NETWORK } from '../lib/web3';
import { DEXService } from '../lib/dex-service';
import { TOKENS } from '../lib/dex-config';

interface RealSwapFormProps {
  onSwapComplete?: (result: { success: boolean; txHash?: string; error?: string }) => void;
}

export default function RealSwapForm({ onSwapComplete }: RealSwapFormProps) {
  const [polAmount, setPolAmount] = useState('');
  const [usdcAmount, setUsdcAmount] = useState('');
  const [polBalance, setPolBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<any>(null);
  const [dexService, setDexService] = useState<DEXService | null>(null);
  const [isMainnetFork, setIsMainnetFork] = useState(false);

  useEffect(() => {
    initializeDEXService();
    loadWalletInfo();
  }, []);

  const initializeDEXService = async () => {
    try {
      const provider = getProvider();
      const wallet = getWallet();
      const service = new DEXService(provider, wallet);
      setDexService(service);
      setIsMainnetFork(CURRENT_NETWORK.name === 'polygon-mainnet-fork' || CURRENT_NETWORK.chainId === 137);
    } catch (err: any) {
      setError(`Failed to initialize DEX service: ${err.message}`);
    }
  };

  const loadWalletInfo = async () => {
    try {
      const wallet = getWallet();
      const address = wallet.address;
      const provider = getProvider();
      const balance = await provider.getBalance(address);
      
      setWalletAddress(address);
      setPolBalance(ethers.formatEther(balance));
    } catch (err: any) {
      setError(`Failed to load wallet info: ${err.message}`);
    }
  };

  const getQuote = useCallback(async (amount: string) => {
    if (!dexService || !amount || parseFloat(amount) <= 0) return;

    setIsGettingQuote(true);
    setError('');

    try {
      const quote = await dexService.getBestQuote(
        TOKENS.WMATIC,
        TOKENS.USDC,
        amount
      );
      
      setCurrentQuote(quote);
      setUsdcAmount(quote.amountOut);
    } catch (err: any) {
      setError(`Failed to get quote: ${err.message}`);
      setUsdcAmount('');
      setCurrentQuote(null);
    } finally {
      setIsGettingQuote(false);
    }
  }, [dexService]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (polAmount && isMainnetFork) {
        getQuote(polAmount);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [polAmount, getQuote, isMainnetFork]);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dexService || !currentQuote) {
      setError('No quote available. Please try again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await dexService.executeBestSwap({
        tokenIn: TOKENS.WMATIC,
        tokenOut: TOKENS.USDC,
        amountIn: polAmount,
        slippageTolerance: 0.5,
        recipient: walletAddress
      });

      if (result.success) {
        setSuccess(`Swap completed! Received ${result.amountOut} USDC`);
        setPolAmount('');
        setUsdcAmount('');
        setCurrentQuote(null);
        
        onSwapComplete?.({ 
          success: true, 
          txHash: result.txHash 
        });
        
        await loadWalletInfo();
      } else {
        setError(result.error || 'Swap failed');
        onSwapComplete?.({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (err: any) {
      const errorMessage = `Swap failed: ${err.message}`;
      setError(errorMessage);
      onSwapComplete?.({ 
        success: false, 
        error: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = polAmount && parseFloat(polAmount) > 0 && parseFloat(polAmount) <= parseFloat(polBalance);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Swap MATIC → USDC</h2>
      
      {!isMainnetFork ? (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700 mb-2">⚠️ Real DEX Integration Unavailable</p>
          <p className="text-xs text-yellow-600">
            Switch to Anvil forked mainnet to use real DEX liquidity. See documentation for setup instructions.
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 mb-2">✅ Real DEX Integration Active</p>
          <p className="text-xs text-green-600">
            Connected to forked Polygon mainnet with real liquidity pools.
          </p>
        </div>
      )}
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Wallet Address:</p>
        <p className="text-xs font-mono text-gray-800 break-all">{walletAddress}</p>
        <p className="text-sm text-gray-600 mt-2">MATIC Balance:</p>
        <p className="text-lg font-bold text-purple-600">{parseFloat(polBalance).toFixed(4)} MATIC</p>
        <p className="text-xs text-gray-500 mt-1">Network: {CURRENT_NETWORK.name}</p>
      </div>

      <form onSubmit={handleSwap} className="space-y-4">
        <div>
          <label htmlFor="polAmount" className="block text-sm font-medium text-gray-700 mb-1">
            MATIC Amount to Swap
          </label>
          <input
            type="number"
            id="polAmount"
            value={polAmount}
            onChange={(e) => setPolAmount(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            max={polBalance}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading || !isMainnetFork}
          />
          <p className="text-xs text-gray-500 mt-1">Available: {parseFloat(polBalance).toFixed(4)} MATIC</p>
        </div>

        <div className="flex items-center justify-center py-2">
          <div className="bg-gray-200 rounded-full p-2">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <div>
          <label htmlFor="usdcAmount" className="block text-sm font-medium text-gray-700 mb-1">
            USDC Amount (Estimated)
          </label>
          <div className="relative">
            <input
              type="text"
              id="usdcAmount"
              value={usdcAmount}
              readOnly
              placeholder="0.000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
            />
            {isGettingQuote && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              </div>
            )}
          </div>
          {currentQuote && (
            <div className="text-xs text-gray-500 mt-1">
              <p>Best route: {currentQuote.dex}</p>
              <p>Price impact: ~{currentQuote.priceImpact.toFixed(3)}%</p>
              <p>Est. gas: {parseInt(currentQuote.gasEstimate).toLocaleString()}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading || !isMainnetFork || !currentQuote}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Swapping...' : !isMainnetFork ? 'Switch to Forked Mainnet' : 'Swap MATIC for USDC'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <p className="font-semibold mb-2">DEX Integration Details:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Uses Uniswap V3 and QuickSwap routers</li>
          <li>Automatic best price aggregation</li>
          <li>Real liquidity from Polygon mainnet</li>
          <li>0.5% slippage tolerance</li>
          <li>Gas optimized transactions</li>
        </ul>
      </div>
    </div>
  );
}