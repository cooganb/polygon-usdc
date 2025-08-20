'use client';

import React, { useState } from 'react';
import USDCPaymentWidget from '../components/USDCPaymentWidget';
import { TransactionResult } from '../lib/usdc-service';

interface PaymentConfig {
  recipient: string;
  amount: string;
  theme: 'light' | 'dark';
  position: 'center' | 'top-right' | 'bottom-right';
  title: string;
}

export default function ReactIntegrationExample() {
  const [showWidget, setShowWidget] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    recipient: '',
    amount: '',
    theme: 'light',
    position: 'center',
    title: 'Send USDC Payment'
  });

  const [presets] = useState([
    {
      name: 'Coffee Shop',
      recipient: '0x742d35Cc6634C0532925a3b8D1df3f4E3C42bAb5',
      amount: '5.50',
      title: 'Pay for Coffee'
    },
    {
      name: 'Subscription',
      recipient: '0x1234567890123456789012345678901234567890',
      amount: '29.99',
      title: 'Monthly Subscription'
    },
    {
      name: 'Donation',
      recipient: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      amount: '10.00',
      title: 'Make a Donation'
    }
  ]);

  const handlePaymentComplete = (result: TransactionResult) => {
    console.log('Payment completed:', result);
    alert(`Payment successful! Transaction: ${result.hash}`);
    setShowWidget(false);
  };

  const handlePresetClick = (preset: typeof presets[0]) => {
    setPaymentConfig(prev => ({
      ...prev,
      recipient: preset.recipient,
      amount: preset.amount,
      title: preset.title
    }));
  };

  const handleConfigChange = (field: keyof PaymentConfig, value: string) => {
    setPaymentConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isConfigValid = paymentConfig.recipient && paymentConfig.amount && 
    parseFloat(paymentConfig.amount) > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          React USDC Payment Widget Integration
        </h1>
        <p className="text-gray-600 mb-8">
          Configure and test the payment widget with different settings
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Widget Configuration</h2>
            
            {/* Preset Buttons */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetClick(preset)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Configuration */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={paymentConfig.recipient}
                  onChange={(e) => handleConfigChange('recipient', e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (USDC)
                </label>
                <input
                  type="number"
                  value={paymentConfig.amount}
                  onChange={(e) => handleConfigChange('amount', e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Widget Title
                </label>
                <input
                  type="text"
                  value={paymentConfig.title}
                  onChange={(e) => handleConfigChange('title', e.target.value)}
                  placeholder="Custom title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={paymentConfig.theme}
                  onChange={(e) => handleConfigChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={paymentConfig.position}
                  onChange={(e) => handleConfigChange('position', e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="center">Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview and Testing */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Widget</h2>
            
            {/* Configuration Preview */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">Current Configuration:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Recipient:</strong> {paymentConfig.recipient || 'Not set'}</p>
                <p><strong>Amount:</strong> {paymentConfig.amount || 'Not set'} USDC</p>
                <p><strong>Title:</strong> {paymentConfig.title}</p>
                <p><strong>Theme:</strong> {paymentConfig.theme}</p>
                <p><strong>Position:</strong> {paymentConfig.position}</p>
              </div>
            </div>

            {/* Test Button */}
            <button
              onClick={() => setShowWidget(true)}
              disabled={!isConfigValid}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isConfigValid ? 'Test Payment Widget' : 'Configure Required Fields'}
            </button>

            {/* Code Example */}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Generated Code:</h3>
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`<USDCPaymentWidget
  isOpen={showWidget}
  onClose={() => setShowWidget(false)}
  onPaymentComplete={handlePaymentComplete}
  recipient="${paymentConfig.recipient}"
  amount="${paymentConfig.amount}"
  title="${paymentConfig.title}"
  theme="${paymentConfig.theme}"
  position="${paymentConfig.position}"
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* The Actual Widget */}
      <USDCPaymentWidget
        isOpen={showWidget}
        onClose={() => setShowWidget(false)}
        onPaymentComplete={handlePaymentComplete}
        recipient={paymentConfig.recipient}
        amount={paymentConfig.amount}
        title={paymentConfig.title}
        theme={paymentConfig.theme}
        position={paymentConfig.position}
      />
    </div>
  );
}