'use client';

import { useState, useEffect } from 'react';
import { USDCPaymentService, TransactionResult } from '../../lib/usdc-service';

interface WidgetParams {
  recipient?: string;
  amount?: string;
  theme?: 'light' | 'dark';
  title?: string;
}

export default function WidgetPage() {
  const [params, setParams] = useState<WidgetParams>({});
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const paymentService = new USDCPaymentService();

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const widgetParams: WidgetParams = {
      recipient: urlParams.get('recipient') || undefined,
      amount: urlParams.get('amount') || undefined,
      theme: (urlParams.get('theme') as 'light' | 'dark') || 'light',
      title: urlParams.get('title') || 'Send USDC Payment'
    };
    
    setParams(widgetParams);
    setRecipient(widgetParams.recipient || '');
    setAmount(widgetParams.amount || '');
    
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      const address = paymentService.getWalletAddress();
      const currentBalance = await paymentService.getBalance();
      setWalletAddress(address);
      setBalance(currentBalance);
    } catch (err: any) {
      setError(`Failed to load wallet info: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await paymentService.sendPayment({
        recipient,
        amount
      });

      if (result.success) {
        setSuccess(`Payment sent successfully!`);
        
        // Notify parent window
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'USDC_PAYMENT_SUCCESS',
            data: result
          }, '*');
        }
        
        await loadWalletInfo();
      } else {
        setError(result.error || 'Payment failed');
        
        // Notify parent window
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'USDC_PAYMENT_ERROR',
            data: { error: result.error }
          }, '*');
        }
      }
    } catch (err: any) {
      const errorMessage = `Payment failed: ${err.message}`;
      setError(errorMessage);
      
      // Notify parent window
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'USDC_PAYMENT_ERROR',
          data: { error: errorMessage }
        }, '*');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = recipient && amount && parseFloat(amount) > 0;
  const isDark = params.theme === 'dark';

  return (
    <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className={`
        max-w-md mx-auto rounded-lg shadow-lg p-6
        ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        <h2 className="text-xl font-bold mb-4">{params.title}</h2>
        
        <div className={`
          mb-4 p-3 rounded-lg text-sm
          ${isDark ? 'bg-gray-700' : 'bg-gray-50'}
        `}>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <p className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            Balance: {balance} USDC
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className={`
                w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                }
              `}
              disabled={loading || !!params.recipient}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Amount (USDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              className={`
                w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                }
              `}
              disabled={loading || !!params.amount}
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send Payment'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}