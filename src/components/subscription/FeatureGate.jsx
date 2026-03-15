import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeatureGate({ user, children, featureName = 'This feature' }) {
  const isPaid = ['active', 'trialing'].includes(user?.subscription_status) || user?.role === 'admin';

  if (isPaid) return children;

  return (
    <div className="relative min-h-[60vh] flex flex-col">
      {/* Blurred preview */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden rounded-2xl" style={{ filter: 'blur(4px)', opacity: 0.3 }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-20 px-6 text-center">
        <div className="bg-white rounded-3xl border border-[#52796F]/20 shadow-xl p-8 max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-[#1B4332]/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-[#1B4332]" />
          </div>
          <h2 className="text-xl font-bold text-[#1B4332] mb-2">{featureName} is a Pro feature</h2>
          <p className="text-gray-500 text-sm mb-6">
            Upgrade to GreenThumb Professional to unlock AI diagnostics, growth analytics, learning tools, and more.
          </p>
          <Link to="/Pricing">
            <Button className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] h-11">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade — Start Free Trial
            </Button>
          </Link>
          <p className="text-xs text-gray-400 mt-3">7-day free trial · Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}