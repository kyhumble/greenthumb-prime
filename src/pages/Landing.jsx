import React from 'react';
import { base44 } from '@/api/base44Client';
import { Leaf, Camera, TrendingUp, Bot, CalendarDays, BookMarked, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Camera, title: 'AI Diagnostics', desc: 'Upload a photo and get instant plant health analysis with treatment plans.' },
  { icon: Bot, title: 'Specialist Agents', desc: '7 specialized AI agents — from differential diagnosis to care planning.' },
  { icon: TrendingUp, title: 'Growth Analytics', desc: 'Track progress over time with AI-powered growth projections.' },
  { icon: CalendarDays, title: 'Care Schedules', desc: 'Never miss a watering or fertilizing with smart reminders.' },
  { icon: BookMarked, title: 'Plant Encyclopedia', desc: 'Instantly look up care guides for thousands of plant species.' },
  { icon: Leaf, title: 'Plant Collection', desc: 'Organize and monitor all your plants in one beautiful place.' },
];

const benefits = [
  'Identify diseases & pests with AI',
  'Get personalized care plans',
  'Track health over time',
  'Season-aware recommendations',
];

export default function Landing() {
  const handleLogin = () => {
    base44.auth.redirectToLogin('/Dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69b58c93938d13c9af653602/39bf079b2_generated_image.png"
              alt="GreenThumb Professional"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-[#1B4332] text-lg">GreenThumb Professional</span>
        </div>
        <Button onClick={handleLogin} className="bg-[#1B4332] hover:bg-[#2D6A4F] rounded-full px-6">
          Sign In
        </Button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#1B4332]/10 text-[#1B4332] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <Leaf className="w-3.5 h-3.5" /> AI-Powered Plant Care
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#1B4332] leading-tight mb-6">
          Your plants deserve<br />
          <span className="text-[#52796F]">expert-level care.</span>
        </h1>
        <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          GreenThumb Professional uses AI to diagnose plant problems, build personalized care plans, and help your garden thrive — season after season.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleLogin}
            size="lg"
            className="bg-[#1B4332] hover:bg-[#2D6A4F] rounded-full px-8 text-base"
          >
            Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Benefits list */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-10">
          {benefits.map(b => (
            <div key={b} className="flex items-center gap-1.5 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-[#52796F]" /> {b}
            </div>
          ))}
        </div>
      </section>

      {/* Hero image strip */}
      <div className="w-full overflow-hidden px-6 md:px-12 mb-20">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-[#1B4332]/10">
          <img
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80"
            alt="Beautiful garden"
            className="w-full h-64 md:h-96 object-cover"
          />
        </div>
      </div>

      {/* Features grid */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1B4332] text-center mb-3">
          Everything your garden needs
        </h2>
        <p className="text-gray-400 text-center mb-12">Six powerful tools, one beautiful platform.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#1B4332]/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-[#1B4332]" />
              </div>
              <h3 className="font-semibold text-[#1B4332] mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="bg-[#1B4332] rounded-3xl p-10 md:p-16 text-center text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to grow smarter?</h2>
          <p className="text-white/70 mb-8 text-lg">Join plant lovers who trust GreenThumb Professional for expert AI care.</p>
          <Button
            onClick={handleLogin}
            size="lg"
            className="bg-white text-[#1B4332] hover:bg-white/90 rounded-full px-10 text-base font-semibold"
          >
            Start for Free <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © 2026 GreenThumb Professional. All rights reserved.
      </footer>
    </div>
  );
}