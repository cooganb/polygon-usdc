(function() {
  'use strict';
  
  // Widget configuration
  const DEFAULT_CONFIG = {
    baseUrl: 'https://your-domain.com', // Replace with your actual domain
    theme: 'light',
    position: 'center',
    title: 'Send USDC Payment'
  };

  // Main USDCPaymentWidget class
  class USDCPaymentWidget {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.isOpen = false;
      this.iframe = null;
      this.overlay = null;
    }

    // Open the payment widget
    open(paymentData = {}) {
      if (this.isOpen) return;
      
      this.isOpen = true;
      this.createWidget(paymentData);
      
      // Setup message listener for iframe communication
      this.setupMessageListener();
    }

    // Close the payment widget
    close() {
      if (!this.isOpen) return;
      
      this.isOpen = false;
      this.removeWidget();
      this.removeMessageListener();
    }

    // Create the widget iframe and overlay
    createWidget(paymentData) {
      // Create overlay
      this.overlay = document.createElement('div');
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      // Close on overlay click
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });

      // Create iframe
      this.iframe = document.createElement('iframe');
      
      // Build URL with parameters
      const params = new URLSearchParams({
        theme: this.config.theme,
        title: this.config.title,
        ...paymentData
      });
      
      this.iframe.src = `${this.config.baseUrl}/widget?${params.toString()}`;
      this.iframe.style.cssText = `
        width: 100%;
        max-width: 480px;
        height: 600px;
        border: none;
        border-radius: 8px;
        background: white;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        margin: 20px;
      `;

      this.overlay.appendChild(this.iframe);
      document.body.appendChild(this.overlay);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    // Remove the widget from DOM
    removeWidget() {
      if (this.overlay && this.overlay.parentNode) {
        document.body.removeChild(this.overlay);
      }
      
      this.iframe = null;
      this.overlay = null;
      
      // Restore body scroll
      document.body.style.overflow = '';
    }

    // Setup iframe message communication
    setupMessageListener() {
      this.messageHandler = (event) => {
        // Verify origin for security
        if (!event.origin.includes(new URL(this.config.baseUrl).hostname)) {
          return;
        }

        const { type, data } = event.data;
        
        switch (type) {
          case 'USDC_PAYMENT_SUCCESS':
            this.handlePaymentSuccess(data);
            break;
          case 'USDC_PAYMENT_ERROR':
            this.handlePaymentError(data);
            break;
        }
      };
      
      window.addEventListener('message', this.messageHandler);
    }

    // Remove message listener
    removeMessageListener() {
      if (this.messageHandler) {
        window.removeEventListener('message', this.messageHandler);
        this.messageHandler = null;
      }
    }

    // Handle successful payment
    handlePaymentSuccess(result) {
      if (this.config.onSuccess) {
        this.config.onSuccess(result);
      }
      
      // Auto-close after success
      setTimeout(() => {
        this.close();
      }, 3000);
    }

    // Handle payment error
    handlePaymentError(error) {
      if (this.config.onError) {
        this.config.onError(error);
      }
    }

    // Create a payment button
    createButton(container, paymentData, buttonText = 'Pay with USDC') {
      const button = document.createElement('button');
      button.textContent = buttonText;
      button.className = 'usdc-payment-button';
      
      // Style the button
      button.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      `;
      
      // Hover effect
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      });

      // Click handler
      button.addEventListener('click', () => {
        this.open(paymentData);
      });

      // Add to container
      if (typeof container === 'string') {
        container = document.querySelector(container);
      }
      
      if (container) {
        container.appendChild(button);
      }
      
      return button;
    }
  }

  // Create global instance
  window.USDCPaymentWidget = USDCPaymentWidget;
  
  // Auto-initialize if config is provided
  if (window.usdcWidgetConfig) {
    window.usdcWidget = new USDCPaymentWidget(window.usdcWidgetConfig);
  }

  // Helper function for quick setup
  window.initUSDCWidget = function(config) {
    window.usdcWidget = new USDCPaymentWidget(config);
    return window.usdcWidget;
  };

  // Auto-process payment buttons with data attributes
  document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('[data-usdc-payment]');
    
    buttons.forEach(button => {
      const recipient = button.getAttribute('data-recipient');
      const amount = button.getAttribute('data-amount');
      const theme = button.getAttribute('data-theme') || 'light';
      
      if (recipient || amount) {
        const widget = new USDCPaymentWidget({ theme });
        
        button.addEventListener('click', (e) => {
          e.preventDefault();
          widget.open({ recipient, amount });
        });
      }
    });
  });

})();