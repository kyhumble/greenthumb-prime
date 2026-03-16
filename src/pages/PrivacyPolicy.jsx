import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-[#1B4332] mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-8">

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">1. Introduction</h2>
              <p>
                Welcome to GreenThumb Professional (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and
                handling your personal data with transparency and care. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use the GreenThumb Professional application
                (the &quot;App&quot;).
              </p>
              <p className="mt-3">
                By using the App, you agree to the collection and use of information in accordance with this policy.
                If you do not agree with the terms of this Privacy Policy, please do not access the App.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">2. Information We Collect</h2>
              <h3 className="text-base font-semibold text-[#2D6A4F] mb-2">2.1 Information You Provide Directly</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Account Information:</strong> Full name, email address, and password when you create an account.</li>
                <li><strong>Profile Information:</strong> Location (city/ZIP code), climate zone, growing environment, skill level, and gardening goals.</li>
                <li><strong>Plant Data:</strong> Plant names, species, locations, health scores, care notes, and growth stage information.</li>
                <li><strong>Photos:</strong> Images you upload of your plants for AI diagnostic analysis.</li>
                <li><strong>Payment Information:</strong> Billing details collected securely by our payment processor, Stripe. We do not store your payment card details on our servers.</li>
              </ul>

              <h3 className="text-base font-semibold text-[#2D6A4F] mb-2 mt-4">2.2 Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Location Data:</strong> With your explicit permission, we access your device&apos;s geolocation to provide weather-based care alerts for your outdoor plants. You may deny this permission and the App will function without weather features.</li>
                <li><strong>Usage Data:</strong> Information about how you use the App, including pages visited, features used, and interaction patterns.</li>
                <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers for compatibility and analytics purposes.</li>
              </ul>

              <h3 className="text-base font-semibold text-[#2D6A4F] mb-2 mt-4">2.3 Photos and Camera Access</h3>
              <p>
                When you use the plant diagnostic feature, you may upload photos from your device&apos;s photo library or take
                new photos using your device camera. These images are processed by our AI system to provide plant health
                analysis. Photos are stored securely and used only to provide the diagnostic service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li>Provide, operate, and improve the App and its features</li>
                <li>Process your subscription and payments through Stripe</li>
                <li>Generate AI-powered plant diagnoses and care recommendations</li>
                <li>Send care reminders and personalized notifications (with your consent)</li>
                <li>Provide weather-based alerts for your outdoor plants (with location permission)</li>
                <li>Analyze usage patterns to improve our services</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">4. Sharing Your Information</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li><strong>AI Service Providers:</strong> Images and plant data may be processed by AI/LLM providers (such as OpenAI) to generate diagnostic results. These providers are bound by their own privacy policies and data processing agreements.</li>
                <li><strong>Payment Processors:</strong> Stripe processes payments and is subject to its own privacy policy and PCI-DSS compliance standards.</li>
                <li><strong>Weather Data Services:</strong> Your approximate location coordinates may be shared with weather data APIs (such as Open-Meteo) to retrieve local weather conditions. These coordinates are not stored beyond the immediate request.</li>
                <li><strong>Infrastructure Providers:</strong> Our hosting and cloud infrastructure providers may have access to data as part of providing their services.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or governmental authority.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">5. Data Retention</h2>
              <p>
                We retain your personal data for as long as your account is active or as needed to provide services.
                You may request deletion of your account and associated data at any time through the Settings page in the App.
                Upon account deletion, we will remove your personal data within 30 days, except where retention is required
                by law or for legitimate business purposes such as fraud prevention.
              </p>
              <p className="mt-3">
                Plant photos used for AI diagnostic purposes may be retained in anonymized or aggregated form to improve our AI models.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">6. Your Rights and Choices</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete personal data via the Settings page</li>
                <li><strong>Deletion:</strong> Delete your account and all associated data via the Settings page (Danger Zone)</li>
                <li><strong>Opt-out:</strong> Opt out of non-essential communications</li>
                <li><strong>Location:</strong> Deny or revoke location permissions at any time through your device settings</li>
                <li><strong>Photo Access:</strong> Control photo library access through your device settings</li>
              </ul>
              <p className="mt-3">
                California residents may have additional rights under the California Consumer Privacy Act (CCPA).
                EU/EEA residents may have rights under the General Data Protection Regulation (GDPR).
                To exercise any of these rights, please contact us at privacy@greenthumb.app.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">7. Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal data
                against unauthorized access, alteration, disclosure, or destruction. Your data is transmitted using
                HTTPS encryption. However, no method of transmission over the Internet or electronic storage is
                100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">8. Children&apos;s Privacy</h2>
              <p>
                The App is not directed to children under the age of 13 (or 16 in the European Union). We do not
                knowingly collect personal information from children. If you believe we have inadvertently collected
                information from a child, please contact us immediately at privacy@greenthumb.app and we will
                promptly delete such information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">9. Third-Party Links</h2>
              <p>
                The App may contain links to third-party websites or services. We are not responsible for the privacy
                practices of those third parties and encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by
                updating the &quot;Last updated&quot; date at the top of this policy and, where appropriate, by providing
                additional notice (such as an in-app notification or email). Your continued use of the App after
                such changes constitutes your acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#1B4332] mb-3">11. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices,
                please contact us at:
              </p>
              <div className="mt-3 bg-[#F0F7F4] rounded-xl p-4">
                <p className="font-semibold text-[#1B4332]">GreenThumb Professional</p>
                <p>Email: <a href="mailto:privacy@greenthumb.app" className="text-[#52796F] hover:underline">privacy@greenthumb.app</a></p>
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
