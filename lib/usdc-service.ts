import { ethers } from 'ethers';
import { getWallet, getUSDCContract, formatUSDC, parseUSDC } from './web3';

export interface PaymentParams {
  recipient: string;
  amount: string;
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  error?: string;
}

export class USDCPaymentService {
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.wallet = getWallet();
    this.contract = getUSDCContract(this.wallet);
  }

  async getBalance(): Promise<string> {
    try {
      const balance = await this.contract.balanceOf(this.wallet.address);
      return formatUSDC(balance);
    } catch (error) {
      throw new Error(`Failed to get balance: ${error}`);
    }
  }

  async sendPayment({ recipient, amount }: PaymentParams): Promise<TransactionResult> {
    try {
      if (!ethers.isAddress(recipient)) {
        throw new Error('Invalid recipient address');
      }

      const amountWei = parseUSDC(amount);
      const balance = await this.contract.balanceOf(this.wallet.address);

      if (balance < amountWei) {
        throw new Error('Insufficient USDC balance');
      }

      const tx = await this.contract.transfer(recipient, amountWei);
      await tx.wait();

      return {
        hash: tx.hash,
        success: true
      };
    } catch (error: any) {
      return {
        hash: '',
        success: false,
        error: error.message || 'Transaction failed'
      };
    }
  }

  async getTransactionStatus(hash: string): Promise<ethers.TransactionReceipt | null> {
    try {
      return await this.wallet.provider.getTransactionReceipt(hash);
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return null;
    }
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }
}