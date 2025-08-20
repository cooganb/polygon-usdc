'use client';

import { useState, useEffect } from 'react';
import { USDCPaymentService, TransactionResult } from '../lib/usdc-service';

interface PaymentFormProps {
  onPaymentComplete?: (result: TransactionResult) => void;
}

export default function PaymentForm({ onPaymentComplete }: PaymentFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const paymentService = new USDCPaymentService();

  useEffect(() => {
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
        setSuccess(`Payment sent successfully! Transaction: ${result.hash}`);
        setRecipient('');
        setAmount('');
        await loadWalletInfo();
        onPaymentComplete?.(result);
      } else {
        setError(result.error || 'Payment failed');
      }
    } catch (err: any) {
      setError(`Payment failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = recipient && amount && parseFloat(amount) > 0;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Send USDC Payment</h2>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">Wallet Address:</p>
        <p className="text-xs font-mono text-gray-800 break-all">{walletAddress}</p>
        <p className="text-sm text-gray-600 mt-2">USDC Balance:</p>
        <p className="text-lg font-bold text-green-600">{balance} USDC</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (USDC)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.000001"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
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
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
    </div>
  );
}