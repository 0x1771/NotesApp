import { supabase } from './supabase';

export interface Product {
  id: string;
  type: 'subscription';
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
  period: 'P1M' | 'P1Y'; // ISO 8601 duration
  skuToken: string;
}

export const products: Product[] = [
  {
    id: 'pro_monthly',
    type: 'subscription',
    title: 'Pro Plan',
    description: 'Unlimited notes, image attachments, voice recordings, and more',
    price: '₺20.00',
    priceAmount: 2000, // in smallest currency unit (kuruş)
    currency: 'TRY',
    period: 'P1M',
    skuToken: 'pro_monthly_subscription'
  },
  {
    id: 'premium_monthly',
    type: 'subscription',
    title: 'Premium Plan',
    description: 'Everything in Pro plus AI features and team collaboration',
    price: '₺30.00',
    priceAmount: 3000,
    currency: 'TRY',
    period: 'P1M',
    skuToken: 'premium_monthly_subscription'
  }
];

export interface PurchaseResult {
  success: boolean;
  error?: string;
  purchaseToken?: string;
  productId?: string;
}

export class BillingManager {
  private static instance: BillingManager;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): BillingManager {
    if (!BillingManager.instance) {
      BillingManager.instance = new BillingManager();
    }
    return BillingManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Initialize Google Play Billing when running in Android WebView
    if (window.PlayBilling) {
      try {
        await window.PlayBilling.initialize();
        this.isInitialized = true;
      } catch (error) {
        console.error('Failed to initialize billing:', error);
        throw error;
      }
    }
  }

  async getProducts(): Promise<Product[]> {
    return products;
  }

  async purchase(productId: string): Promise<PurchaseResult> {
    if (!window.PlayBilling) {
      return {
        success: false,
        error: 'Play Billing not available'
      };
    }

    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const result = await window.PlayBilling.purchase(product.skuToken);
      
      if (result.success) {
        // Update subscription in database
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            product_id: productId,
            purchase_token: result.purchaseToken,
            status: 'active',
            platform: 'android'
          });

        if (error) throw error;
      }

      return result;
    } catch (error) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  async validateSubscription(purchaseToken: string): Promise<boolean> {
    if (!window.PlayBilling) return false;

    try {
      const result = await window.PlayBilling.validatePurchase(purchaseToken);
      return result.isValid;
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  }
}

// Type definitions for the Play Billing interface
declare global {
  interface Window {
    PlayBilling?: {
      initialize(): Promise<void>;
      purchase(skuToken: string): Promise<PurchaseResult>;
      validatePurchase(purchaseToken: string): Promise<{ isValid: boolean }>;
    };
  }
}