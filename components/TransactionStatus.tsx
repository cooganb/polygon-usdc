'use client';

import { useState, useEffect } from 'react';
import { USDCPaymentService } from '../lib/usdc-service';

interface TransactionStatusProps {
  hash: string;
  onClose?: () => void;
}

export default function TransactionStatus({ hash, onClose }: TransactionStatusProps) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const paymentService = new USDCPaymentService();

  useEffect(() => {
    if (hash) {
      checkTransactionStatus();
    }
  }, [hash]);

  const checkTransactionStatus = async () => {
    try {
      const receipt = await paymentService.getTransactionStatus(hash);
      
      if (receipt) {
        setReceipt(receipt);
        setStatus(receipt.status === 1 ? 'confirmed' : 'failed');
      } else {
        setTimeout(checkTransactionStatus, 2000);
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'confirmed': return 'Transaction Confirmed';
      case 'failed': return 'Transaction Failed';
      default: return 'Transaction Pending';
    }
  };

  if (!hash) return null;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Transaction Status</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Transaction Hash:</p>
          <p className="text-xs font-mono text-gray-800 break-all">{hash}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Status:</p>
          <p className={`font-semibold ${getStatusColor()}`}>
            {loading ? 'Checking...' : getStatusText()}
          </p>
        </div>

        {receipt && (
          <>
            <div>
              <p className="text-sm text-gray-600">Block Number:</p>
              <p className="text-sm text-gray-800">{receipt.blockNumber}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Gas Used:</p>
              <p className="text-sm text-gray-800">{receipt.gasUsed?.toString()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Network:</p>
              <p className="text-sm text-gray-800">Polygon Amoy Testnet</p>
            </div>
          </>
        )}

        <div className="pt-3">
          <a
            href={`https://amoy.polygonscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            View on PolygonScan
          </a>
        </div>
      </div>
    </div>
  );
}