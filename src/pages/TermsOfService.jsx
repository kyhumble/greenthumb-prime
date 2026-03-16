import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const lastUpdated = 'March 16, 2026';

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 max-w-4xl mx-auto">
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
        <Link to="/Landing" className="flex items-center gap-1.5 text-sm text-[#52796F] hover:text-[#1B4332] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 md:px-12 py-10 pb-20">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-5 h-5 text-[#52796F]" />
            <span className="text-sm font-medium text-[#52796F]">Legal</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1B4332] mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-8">

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using GreenThumb Professional (the &quot;App&quot;), you agree to be bound by these Terms of Service
                (&quot;Terms&quot;) and our Privacy Policy. If you do not agree to these Terms, please do not use the App.
                These Terms constitute a legally binding agreement between you and GreenThumb Professional (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">2. Description of Service</h2>
              <p>
                GreenThumb Professional is an AI-powered plant care management application that provides:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Plant collection management and tracking</li>
                <li>AI-powered plant health diagnostics via photo analysis</li>
                <li>Personalized care schedules and reminders</li>
                <li>Weather-based care alerts for outdoor plants</li>
                <li>Plant encyclopedia and educational content</li>
                <li>Growth analytics and health tracking</li>
                <li>AI specialist agents for advanced plant care guidance</li>
              </ul>
              <p className="mt-3">
                <strong>Important Disclaimer:</strong> AI-generated diagnoses and recommendations are for informational
                purposes only and should not be considered professional horticultural or agricultural advice. For critical
                plant health issues, we recommend consulting a licensed horticulturist or agricultural extension service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">3. Account Registration</h2>
              <p>
                To access most features of the App, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Provide accurate, current, and complete registration information</li>
                <li>Maintain the security of your password and account</li>
                <li>Promptly update your account information if it changes</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="mt-3">
                You must be at least 13 years of age (or 16 in the EU) to create an account.
                By creating an account, you represent that you meet this age requirement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">4. Subscription and Payments</h2>
              <h3 className="text-base font-semibold text-[#2D6A4F] mb-2">4.1 Free Tier</h3>
              <p>
                A limited free tier is available that allows you to manage up to 3 plant profiles and access basic features.
              </p>
              <h3 className="text-base font-semibold text-[#2D6A4F] mb-2 mt-4">4.2 Pro Subscription</h3>
              <p>
                GreenThumb Professional Pro is available for $9.99 per month, which includes a 7-day free trial for new subscribers.
                Pro subscribers get access to unlimited plant profiles, all AI diagnostic tools, advanced analytics, and all 7 AI specialist agents.
              </p>
              <h3 className="text-base font-semibold text-[#2D6A4F] mb-2 mt-4">4.3 Billing</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Subscriptions are billed monthly in advance via Stripe.</li>
                <li>Your subscription will automatically renew unless cancelled at least 24 hours before the end of the current billing period.</li>
                <li>You can manage and cancel your subscription at any time through the Settings page or by contacting support.</li>
                <li>Refunds are handled on a case-by-case basis. Please contact support@greenthumb.app for refund requests.</li>
              </ul>
              <h3 className="text-base font-semibold text-[#2D6A4F] mb-2 mt-4">4.4 Free Trial</h3>
              <p>
                The 7-day free trial is available to new subscribers only. After the trial period ends, you will be
                charged the monthly subscription fee unless you cancel before the trial expires.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">5. Acceptable Use</h2>
              <p>You agree not to use the App to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Upload content that is illegal, harmful, offensive, or infringes third-party rights</li>
                <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
                <li>Reverse engineer, decompile, or disassemble any part of the App</li>
                <li>Use automated bots, scrapers, or similar tools to access the App</li>
                <li>Interfere with or disrupt the App&apos;s infrastructure or servers</li>
                <li>Share your account credentials with others</li>
                <li>Use the App for any commercial purpose without our prior written consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">6. User Content</h2>
              <p>
                You retain ownership of any content you upload to the App, including plant photos and notes.
                By uploading content, you grant us a limited, non-exclusive, royalty-free license to use, store,
                and process that content for the sole purpose of providing the App&apos;s services to you.
              </p>
              <p className="mt-3">
                You represent and warrant that you have all necessary rights to the content you upload and that
                such content does not violate any third-party rights or applicable laws.
              </p>
              <p className="mt-3">
                We may use anonymized, aggregated data derived from user interactions (including plant photos with
                identifying information removed) to improve our AI models and services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">7. AI-Generated Content Disclaimer</h2>
              <p>
                The App uses artificial intelligence to provide plant diagnoses, care recommendations, and educational content.
                You acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>AI-generated diagnoses may not be accurate or complete</li>
                <li>AI recommendations are informational and not a substitute for professional horticultural advice</li>
                <li>We are not responsible for any loss or damage to plants resulting from following AI-generated recommendations</li>
                <li>The quality of AI diagnoses depends on the quality and clarity of uploaded photos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">8. Intellectual Property</h2>
              <p>
                The App and its original content, features, and functionality are owned by GreenThumb Professional and
                are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                You may not copy, modify, distribute, sell, or lease any part of the App without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">9. Termination</h2>
              <p>
                We may terminate or suspend your account at our discretion, with or without cause, with or without notice,
                if we believe you have violated these Terms. You may delete your account at any time through the Settings page.
                Upon termination, your right to use the App will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, GreenThumb Professional shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of
                profits, data, or goodwill, arising from your use of or inability to use the App.
              </p>
              <p className="mt-3">
                Our total liability to you for any claim arising from or related to these Terms or the App shall not
                exceed the amount you paid to us in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">11. Disclaimer of Warranties</h2>
              <p>
                The App is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied,
                including but not limited to implied warranties of merchantability, fitness for a particular purpose,
                and non-infringement. We do not warrant that the App will be uninterrupted, error-free, or free of viruses.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the United States,
                without regard to its conflict of law provisions. Any disputes arising under these Terms shall be
                subject to the exclusive jurisdiction of the courts located in the United States.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of significant changes by
                updating the &quot;Last updated&quot; date and, where appropriate, by providing additional notice. Your continued
                use of the App after changes are posted constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">14. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="mt-3 bg-[#F0F7F4] rounded-xl p-4">
                <p className="font-semibold text-[#1B4332]">GreenThumb Professional</p>
                <p>Email: <a href="mailto:legal@greenthumb.app" className="text-[#52796F] hover:underline">legal@greenthumb.app</a></p>
                <p>Support: <a href="mailto:support@greenthumb.app" className="text-[#52796F] hover:underline">support@greenthumb.app</a></p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <Link to="/PrivacyPolicy" className="hover:text-[#52796F] transition-colors">Privacy Policy</Link>
          <Link to="/TermsOfService" className="hover:text-[#52796F] transition-colors">Terms of Service</Link>
          <a href="mailto:support@greenthumb.app" className="hover:text-[#52796F] transition-colors">Contact</a>
        </div>
        © 2026 GreenThumb Professional. All rights reserved.
      </footer>
    </div>
  );
}
