import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Loader2, Leaf, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PRICE_ID = 'price_1TAwUYIP3e1rI6SDydUccbuE';

const features = [
  'Unlimited plant profiles',
  'AI-powered plant diagnostics',
  'Growth analytics & projections',
  'Personalized care schedules',
  'Plant encyclopedia access',
  '7 AI specialist agents',
  'Photo timeline & history',
  'Weather-based care alerts',
];

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSubscribe = async () => {
    // Block if running in iframe (preview mode)
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please open the app directly.');
      return;
    }
    setLoading(true);
    const res = await base44.functions.invoke('createCheckoutSession', {
      price_id: PRICE_ID,
      success_url: `${window.location.origin}/Dashboard?subscribed=true`,
      cancel_url: `${window.location.origin}/Pricing`,
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      setLoading(false);
    }
  };

  const isActive = ['active', 'trialing'].includes(user?.subscription_status);

  return (
    <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b58c93938d13c9af653602/39bf079b2_generated_image.png" alt="GreenThumb Pro" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-[#1B4332]">GreenThumb Pro</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1B4332] mb-2">Simple, transparent pricing</h1>
          <p className="text-gray-500">Start your 7-day free trial. Cancel anytime.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#52796F]/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] p-8 text-white text-center">
            <div className="text-sm font-medium opacity-80 mb-1">Monthly plan</div>
            <div className="flex items-end justify-center gap-1">
              <span className="text-5xl font-bold">$9.99</span>
              <span className="opacity-70 mb-2">/mo</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium">
              <Zap className="w-3.5 h-3.5" />
              7-day free trial included
            </div>
          </div>

          <div className="p-8">
            <ul className="space-y-3 mb-8">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-[#52796F] flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {isActive ? (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-4 py-2 text-sm font-medium mb-4">
                  <Shield className="w-4 h-4" />
                  You're subscribed!
                </div>
                <br />
                <Link to="/Dashboard">
                  <Button className="bg-[#1B4332] hover:bg-[#2D6A4F] w-full">Go to Dashboard</Button>
                </Link>
              </div>
            ) : (
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] h-12 text-base"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? 'Redirecting...' : 'Start Free Trial'}
              </Button>
            )}

            <p className="text-xs text-gray-400 text-center mt-4">
              No credit card required during trial. Cancel anytime.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/Dashboard" className="text-sm text-[#52796F] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}