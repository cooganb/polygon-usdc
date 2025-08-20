# USDC Payment Widget Integration Guide

This guide shows how to integrate the USDC payment widget into existing applications using various methods.

## Integration Methods

### 1. React Component (Recommended for React apps)

```tsx
import USDCPaymentWidget from './components/USDCPaymentWidget';

function MyApp() {
  const [showWidget, setShowWidget] = useState(false);

  const handlePaymentComplete = (result) => {
    console.log('Payment completed:', result);
    setShowWidget(false);
  };

  return (
    <div>
      <button onClick={() => setShowWidget(true)}>
        Pay with USDC
      </button>
      
      <USDCPaymentWidget
        isOpen={showWidget}
        onClose={() => setShowWidget(false)}
        onPaymentComplete={handlePaymentComplete}
        recipient="0x742d35Cc6634C0532925a3b8D1df3f"
        amount="10.50"
        theme="light"
        position="center"
      />
    </div>
  );
}
```

### 2. JavaScript SDK (For any website)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <button id="pay-button">Pay 10 USDC</button>

  <script>
    // Initialize SDK
    const widget = new USDCWidgetSDK({
      polygonRpcEndpoint: 'https://rpc-amoy.polygon.technology',
      chainId: 80002,
      usdcContractAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
      theme: 'light',
      onPaymentComplete: (result) => {
        alert('Payment successful: ' + result.hash);
      }
    });

    // Add click handler
    document.getElementById('pay-button').addEventListener('click', () => {
      widget.openPayment({
        recipient: '0x742d35Cc6634C0532925a3b8D1df3f',
        amount: '10.00'
      });
    });
  </script>
</body>
</html>
```

### 3. Embed Script (Easiest integration)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Method A: Automatic buttons -->
  <button 
    data-usdc-payment
    data-recipient="0x742d35Cc6634C0532925a3b8D1df3f"
    data-amount="10.00"
    data-theme="light"
  >
    Pay 10 USDC
  </button>

  <!-- Method B: Programmatic -->
  <div id="payment-container"></div>

  <!-- Load the widget script -->
  <script src="https://your-domain.com/usdc-widget-embed.js"></script>
  <script>
    // Configure and create button
    const widget = new USDCPaymentWidget({
      baseUrl: 'https://your-domain.com',
      theme: 'light',
      onSuccess: (result) => console.log('Success:', result),
      onError: (error) => console.log('Error:', error)
    });

    widget.createButton('#payment-container', {
      recipient: '0x742d35Cc6634C0532925a3b8D1df3f',
      amount: '25.00'
    }, 'Pay 25 USDC');
  </script>
</body>
</html>
```

### 4. Iframe Integration

```html
<!DOCTYPE html>
<html>
<body>
  <iframe 
    src="https://your-domain.com/widget?recipient=0x742d35Cc6634C0532925a3b8D1df3f&amount=10.00&theme=light"
    width="480"
    height="600"
    frameborder="0"
    style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
  ></iframe>

  <script>
    // Listen for payment results
    window.addEventListener('message', (event) => {
      if (event.data.type === 'USDC_PAYMENT_SUCCESS') {
        console.log('Payment successful:', event.data.data);
      }
    });
  </script>
</body>
</html>
```

## Configuration Options

### Widget Props/Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `recipient` | string | - | Pre-fill recipient address |
| `amount` | string | - | Pre-fill amount |
| `theme` | 'light' \| 'dark' | 'light' | Widget color scheme |
| `position` | 'center' \| 'top-right' \| 'bottom-right' | 'center' | Widget position |
| `title` | string | 'Send USDC Payment' | Widget title |
| `onPaymentComplete` | function | - | Success callback |
| `onClose` | function | - | Close callback |
| `onError` | function | - | Error callback |

### Network Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `polygonRpcEndpoint` | string | - | Polygon RPC URL |
| `chainId` | number | 80002 | Network chain ID |
| `usdcContractAddress` | string | - | USDC contract address |
| `privateKey` | string | - | Server wallet private key |

## Environment Setup

### For Polygon Amoy Testnet:
```bash
POLYGON_RPC_ENDPOINT=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
PRIVATE_KEY=your_private_key
```

### For Polygon Mainnet:
```bash
POLYGON_RPC_ENDPOINT=https://polygon-rpc.com
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
PRIVATE_KEY=your_private_key
```

## Styling and Customization

### CSS Classes for Custom Styling

```css
/* Payment button */
.usdc-payment-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.usdc-payment-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Widget container */
.usdc-widget-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999999;
}

.usdc-widget-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 480px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

## Security Considerations

1. **Private Key Security**: Store private keys securely in environment variables, never in client-side code
2. **Origin Validation**: Iframe communication validates origins for security
3. **Address Validation**: All recipient addresses are validated before transactions
4. **Balance Checks**: Insufficient balance scenarios are handled gracefully

## Testing

### Test with Polygon Amoy Testnet:
1. Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)
2. Get test USDC from the contract or faucet
3. Use the widget to send test payments

### Local Development:
```bash
npm run dev
# Widget available at http://localhost:3000/widget
```

## Error Handling

The widget handles common errors:

- Invalid recipient addresses
- Insufficient USDC balance
- Network connection issues
- Transaction failures

Error callbacks provide detailed error information for custom handling.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- Works with CSP policies (iframe-src and script-src permissions needed)

## Examples

See the `/examples` directory for complete integration examples:
- React app integration
- Vanilla JavaScript
- WordPress plugin
- Shopify integration
- E-commerce checkout flow