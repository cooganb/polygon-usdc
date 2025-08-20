'use client';

import { useState } from 'react';
import PaymentForm from '../components/PaymentForm';
import SwapForm from '../components/SwapForm';
import RealSwapForm from '../components/RealSwapForm';
import TransactionStatus from '../components/TransactionStatus';
import { TransactionResult } from '../lib/usdc-service';
import { CURRENT_NETWORK } from '../lib/web3';

export default function HomePage() {
  const [currentTransaction, setCurrentTransaction] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'payment' | 'swap'>('payment');

  const handlePaymentComplete = (result: TransactionResult) => {
    if (result.success) {
      setCurrentTransaction(result.hash);
    }
  };

  const handleSwapComplete = (result: { success: boolean; txHash?: string; error?: string }) => {
    if (result.success && result.txHash) {
      setCurrentTransaction(result.txHash);
    }
  };

  const handleCloseTransaction = () => {
    setCurrentTransaction('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          USDC Polygon Interface
        </h1>
        <p className="text-gray-600">
          Send USDC payments and swap POL for USDC on Polygon Amoy Testnet
        </p>
      </div>

      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'payment'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            💳 Send Payment
          </button>
          <button
            onClick={() => setActiveTab('swap')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'swap'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🔄 Swap POL → USDC
          </button>
        </div>
      </div>

      {activeTab === 'payment' ? (
        <PaymentForm onPaymentComplete={handlePaymentComplete} />
      ) : (
        CURRENT_NETWORK.chainId === 137 ? (
          <RealSwapForm onSwapComplete={handleSwapComplete} />
        ) : (
          <SwapForm onSwapComplete={handleSwapComplete} />
        )
      )}
      
      {currentTransaction && (
        <TransactionStatus 
          hash={currentTransaction} 
          onClose={handleCloseTransaction}
        />
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Network: Polygon Amoy Testnet</p>
        <p>USDC Contract: {process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS}</p>
      </div>
    </div>
  );
}