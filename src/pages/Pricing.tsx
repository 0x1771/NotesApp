import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { BillingManager, type Product } from '../lib/billing';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Free',
    price: '0',
    features: [
      '5 notes per month',
      'Basic text notes',
      'Tags organization',
      'Calendar integration',
      'Basic reminders'
    ]
  },
  {
    name: 'Pro',
    price: '20',
    productId: 'pro_monthly',
    features: [
      'Unlimited notes',
      'Image attachments',
      'Voice recordings',
      'OCR text extraction',
      'Advanced reminders',
      'Location-based notes',
      'Priority support'
    ]
  },
  {
    name: 'Premium',
    price: '30',
    productId: 'premium_monthly',
    features: [
      'Everything in Pro',
      'AI-powered summaries',
      'Translation to 10+ languages',
      'Advanced image editing',
      'Custom tags',
      'Team collaboration',
      '24/7 priority support',
      'Early access to new features'
    ]
  }
];

export function Pricing() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initBilling = async () => {
      try {
        const billingManager = BillingManager.getInstance();
        await billingManager.initialize();
        const products = await billingManager.getProducts();
        setProducts(products);
      } catch (error) {
        console.error('Failed to initialize billing:', error);
      }
    };

    initBilling();
  }, []);

  const handleSubscribe = async (tier: 'free' | 'pro' | 'premium') => {
    if (!profile) {
      navigate('/auth');
      return;
    }

    if (tier === 'free') {
      toast.success('You are already on the free plan!');
      return;
    }

    setIsLoading(true);
    try {
      const productId = tier === 'pro' ? 'pro_monthly' : 'premium_monthly';
      const billingManager = BillingManager.getInstance();
      const result = await billingManager.purchase(productId);

      if (result.success) {
        toast.success(`Successfully subscribed to ${tier} plan!`);
        navigate('/');
      } else {
        toast.error(result.error || 'Subscription failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to subscribe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#FE6902] mb-4">
            Choose Your Plan
          </h1>
          <p className="text-[#E5E5E5] text-lg">
            Select the perfect plan for your note-taking needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const product = products.find(p => p.id === plan.productId);
            return (
              <div
                key={plan.name}
                className="bg-[#262626] rounded-2xl p-8 flex flex-col"
              >
                <h3 className="text-2xl font-bold text-[#FE6902] mb-2">
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#E5E5E5]">
                    ₺{product?.priceAmount ? (product.priceAmount / 100).toFixed(2) : plan.price}
                  </span>
                  <span className="text-[#666]">/month</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={20} className="text-[#FE6902] flex-shrink-0" />
                      <span className="text-[#E5E5E5]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.name.toLowerCase() as 'free' | 'pro' | 'premium')}
                  disabled={isLoading || profile?.subscription_tier === plan.name.toLowerCase()}
                  className={`w-full py-2 rounded-xl font-medium transition-colors ${
                    isLoading
                      ? 'bg-[#393737] text-[#666] cursor-not-allowed'
                      : profile?.subscription_tier === plan.name.toLowerCase()
                      ? 'bg-[#393737] text-[#666] cursor-not-allowed'
                      : 'bg-[#FE6902] text-white hover:bg-[#ff7b1d]'
                  }`}
                >
                  {isLoading
                    ? 'Processing...'
                    : profile?.subscription_tier === plan.name.toLowerCase()
                    ? 'Current Plan'
                    : 'Subscribe'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}