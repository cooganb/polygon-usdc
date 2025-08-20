'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getWallet, getProvider, CURRENT_NETWORK } from '../lib/web3';
import { DEXService } from '../lib/dex-service';
import { TOKENS } from '../lib/dex-config';

interface SwapFormProps {
  onSwapComplete?: (result: { success: boolean; txHash?: string; error?: string }) => void;
}

export default function SwapForm({ onSwapComplete }: SwapFormProps) {
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
  
  // Mock exchange rate for demonstration (1 POL = 0.45 USDC)
  const exchangeRate = 0.45;

  useEffect(() => {
    loadWalletInfo();
  }, []);

  useEffect(() => {
    if (polAmount && !isNaN(parseFloat(polAmount))) {
      const calculatedUsdc = (parseFloat(polAmount) * exchangeRate).toFixed(6);
      setUsdcAmount(calculatedUsdc);
    } else {
      setUsdcAmount('');
    }
  }, [polAmount, exchangeRate]);

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

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // This is a mock implementation for demonstration
      // In a real implementation, you would:
      // 1. Call a DEX aggregator API (like 1inch, Paraswap, etc.)
      // 2. Execute the swap transaction through a router contract
      // 3. Handle slippage, gas estimation, etc.
      
      // Simulate swap delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success response
      const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      setSuccess(`Mock swap completed! In a real implementation, this would swap ${polAmount} POL for ${usdcAmount} USDC`);
      setPolAmount('');
      setUsdcAmount('');
      
      onSwapComplete?.({ 
        success: true, 
        txHash: mockTxHash 
      });
      
      await loadWalletInfo();
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Swap POL to USDC</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-600 mb-2">📝 Demo Implementation</p>
        <p className="text-xs text-blue-600">
          This is a demonstration interface. In production, integrate with a real DEX aggregator like 1inch, Paraswap, or deploy Uniswap contracts.
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Wallet Address:</p>
        <p className="text-xs font-mono text-gray-800 break-all">{walletAddress}</p>
        <p className="text-sm text-gray-600 mt-2">POL Balance:</p>
        <p className="text-lg font-bold text-purple-600">{parseFloat(polBalance).toFixed(4)} POL</p>
      </div>

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          <span className="font-semibold">Exchange Rate:</span> 1 POL = {exchangeRate} USDC
        </p>
        <p className="text-xs text-yellow-600 mt-1">Mock rate for demonstration</p>
      </div>

      <form onSubmit={handleSwap} className="space-y-4">
        <div>
          <label htmlFor="polAmount" className="block text-sm font-medium text-gray-700 mb-1">
            POL Amount to Swap
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
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Available: {parseFloat(polBalance).toFixed(4)} POL</p>
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
          <input
            type="text"
            id="usdcAmount"
            value={usdcAmount}
            readOnly
            placeholder="0.000000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Swapping...' : 'Swap POL for USDC'}
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
        <p className="font-semibold mb-2">For Production Implementation:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Integrate with 1inch API or Paraswap</li>
          <li>Add real-time price feeds (Chainlink, etc.)</li>
          <li>Implement slippage protection</li>
          <li>Add gas estimation and optimization</li>
          <li>Deploy or connect to real liquidity pools</li>
        </ul>
      </div>
    </div>
  );
}