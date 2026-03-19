import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Wrap any page/section with this to require an active subscription.
 * Props:
 *   user       — the current user object
 *   children   — content to show when subscribed
 */
export default function SubscriptionGate({ user, children }) {
  const isActive = ['active', 'trialing'].includes(user?.subscription_status);

  if (isActive) return children;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[#1B4332]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-[#1B4332]" />
        </div>
        <h2 className="text-xl font-bold text-[#1B4332] mb-2">Premium Feature</h2>
        <p className="text-gray-500 text-sm mb-6">
          This feature requires a GreenThumb Pro subscription. Start your 7-day free trial today.
        </p>
        <Link to="/Pricing">
          <Button className="bg-[#1B4332] hover:bg-[#2D6A4F] gap-2">
            <Zap className="w-4 h-4" />
            Start Free Trial
          </Button>
        </Link>
      </div>
    </div>
  );
}