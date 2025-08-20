'use client';

import { useState, useEffect } from 'react';
import { USDCPaymentService, TransactionResult } from '../lib/usdc-service';

interface USDCPaymentWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete?: (result: TransactionResult) => void;
  recipient?: string;
  amount?: string;
  title?: string;
  theme?: 'light' | 'dark';
  position?: 'center' | 'top-right' | 'bottom-right';
}

export default function USDCPaymentWidget({
  isOpen,
  onClose,
  onPaymentComplete,
  recipient: initialRecipient = '',
  amount: initialAmount = '',
  title = 'Send USDC Payment',
  theme = 'light',
  position = 'center'
}: USDCPaymentWidgetProps) {
  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState(initialAmount);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const paymentService = new USDCPaymentService();

  useEffect(() => {
    if (isOpen) {
      loadWalletInfo();
    }
  }, [isOpen]);

  useEffect(() => {
    setRecipient(initialRecipient);
    setAmount(initialAmount);
  }, [initialRecipient, initialAmount]);

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
        setSuccess(`Payment sent successfully! Transaction: ${result.hash}`);
        onPaymentComplete?.(result);
        
        // Auto-close after 3 seconds on success
        setTimeout(() => {
          onClose();
          setSuccess('');
          if (!initialRecipient) setRecipient('');
          if (!initialAmount) setAmount('');
        }, 3000);
        
        await loadWalletInfo();
      } else {
        setError(result.error || 'Payment failed');
      }
    } catch (err: any) {
      setError(`Payment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    onClose();
  };

  const isFormValid = recipient && amount && parseFloat(amount) > 0;

  if (!isOpen) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-4 right-4 z-50';
      case 'bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      default:
        return 'fixed inset-0 z-50 flex items-center justify-center';
    }
  };

  const themeClasses = theme === 'dark' 
    ? 'bg-gray-800 text-white border-gray-700' 
    : 'bg-white text-gray-800 border-gray-300';

  const backdropClasses = position === 'center' 
    ? 'absolute inset-0 bg-black bg-opacity-50' 
    : '';

  return (
    <div className={getPositionClasses()}>
      {position === 'center' && (
        <div 
          className={backdropClasses}
          onClick={handleClose}
        />
      )}
      
      <div className={`
        relative w-full max-w-md mx-4 rounded-lg shadow-xl border p-6 
        ${themeClasses}
        ${position === 'center' ? 'z-10' : ''}
      `}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={handleClose}
            className={`
              text-2xl leading-none hover:opacity-70 transition-opacity
              ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}
            `}
          >
            ×
          </button>
        </div>
        
        <div className={`
          mb-4 p-3 rounded-lg text-sm
          ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}
        `}>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <p className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            Balance: {balance} USDC
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
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
                ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                }
              `}
              disabled={loading || !!initialRecipient}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
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
                ${theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                }
              `}
              disabled={loading || !!initialAmount}
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