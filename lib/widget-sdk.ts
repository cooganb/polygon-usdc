import { TransactionResult } from './usdc-service';

export interface WidgetConfig {
  // Network configuration
  polygonRpcEndpoint?: string;
  chainId?: number;
  usdcContractAddress?: string;
  privateKey?: string;

  // UI Configuration
  theme?: 'light' | 'dark';
  position?: 'center' | 'top-right' | 'bottom-right';
  title?: string;
  
  // Pre-filled values
  recipient?: string;
  amount?: string;
  
  // Callbacks
  onPaymentComplete?: (result: TransactionResult) => void;
  onClose?: () => void;
  onError?: (error: string) => void;
}

export interface PaymentRequest {
  recipient: string;
  amount: string;
  metadata?: Record<string, any>;
}

export class USDCWidgetSDK {
  private config: WidgetConfig;
  private isInitialized = false;

  constructor(config: WidgetConfig = {}) {
    this.config = config;
  }

  /**
   * Initialize the SDK with environment configuration
   */
  init(config?: Partial<WidgetConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Validate required config
    if (!this.config.polygonRpcEndpoint) {
      throw new Error('polygonRpcEndpoint is required');
    }
    
    this.isInitialized = true;
  }

  /**
   * Open payment widget with optional payment details
   */
  openPayment(request?: PaymentRequest): Promise<TransactionResult> {
    if (!this.isInitialized) {
      throw new Error('SDK must be initialized before use');
    }

    return new Promise((resolve, reject) => {
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'usdc-payment-widget';
      document.body.appendChild(widgetContainer);

      // Enhanced config with request data
      const widgetConfig = {
        ...this.config,
        recipient: request?.recipient || this.config.recipient,
        amount: request?.amount || this.config.amount,
        onPaymentComplete: (result: TransactionResult) => {
          this.cleanup();
          resolve(result);
          this.config.onPaymentComplete?.(result);
        },
        onClose: () => {
          this.cleanup();
          reject(new Error('Payment cancelled by user'));
          this.config.onClose?.();
        },
        onError: (error: string) => {
          this.cleanup();
          reject(new Error(error));
          this.config.onError?.(error);
        }
      };

      // Render widget (this would need React rendering in actual implementation)
      this.renderWidget(widgetContainer, widgetConfig);
    });
  }

  /**
   * Create a payment button that opens the widget when clicked
   */
  createPaymentButton(
    container: HTMLElement,
    request: PaymentRequest,
    buttonText = 'Pay with USDC'
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = buttonText;
    button.className = 'usdc-payment-button';
    button.style.cssText = `
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    `;
    
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#1d4ed8';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#2563eb';
    });

    button.addEventListener('click', () => {
      this.openPayment(request).catch(console.error);
    });

    container.appendChild(button);
    return button;
  }

  /**
   * Generate a payment link that opens the widget
   */
  generatePaymentLink(request: PaymentRequest): string {
    const params = new URLSearchParams({
      recipient: request.recipient,
      amount: request.amount,
      ...(request.metadata && { metadata: JSON.stringify(request.metadata) })
    });
    
    return `${window.location.origin}/widget?${params.toString()}`;
  }

  /**
   * Clean up widget resources
   */
  private cleanup() {
    const widget = document.getElementById('usdc-payment-widget');
    if (widget) {
      document.body.removeChild(widget);
    }
  }

  /**
   * Render the widget (placeholder - would need actual React rendering)
   */
  private renderWidget(container: HTMLElement, config: any) {
    // This is a placeholder. In a real implementation, you'd use React.render()
    // or create a standalone JavaScript widget
    container.innerHTML = `
      <div style="
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
      ">
        <div style="
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          width: 100%;
        ">
          <h2>USDC Payment Widget</h2>
          <p>This is a placeholder. Actual implementation would render the React component here.</p>
          <button onclick="document.getElementById('usdc-payment-widget').remove()">
            Close
          </button>
        </div>
      </div>
    `;
  }
}

// Global instance for easy access
export const USDCWidget = new USDCWidgetSDK();

// Browser global for CDN usage
if (typeof window !== 'undefined') {
  (window as any).USDCWidget = USDCWidget;
}