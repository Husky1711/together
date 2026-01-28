'use client'

import PageContainer from '@/components/Layout/PageContainer'
import PageHeader from '@/components/Layout/PageHeader'

export default function PrivacyPolicy() {
  return (
    <PageContainer>
      <PageHeader 
        title="Privacy Policy" 
        description="Last updated: January 2025"
      />
      
      <div className="max-w-4xl mx-auto prose prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            1. Introduction
          </h2>
          <p className="text-soft-gray font-inter leading-relaxed mb-4">
            Welcome to Together ("we," "our," or "us"). Together is a relationship app designed for couples, families, and friends to share memories, track milestones, set goals, and create shared experiences.
          </p>
          <p className="text-soft-gray font-inter leading-relaxed">
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and web application (collectively, the "Service").
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            2. Information We Collect
          </h2>
          <h3 className="text-xl font-semibold text-charcoal mb-3">
            2.1 Information You Provide
          </h3>
          <p className="text-soft-gray font-inter leading-relaxed mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 text-soft-gray font-inter space-y-2 mb-4">
            <li>Personal information (names, relationship dates, milestones)</li>
            <li>Content you create (memories, photos, text notes, voice recordings)</li>
            <li>Goals and vision board items</li>
            <li>Music playlists and preferences</li>
            <li>Photos and images you upload</li>
          </ul>

          <h3 className="text-xl font-semibold text-charcoal mb-3">
            2.2 Automatically Collected Information
          </h3>
          <p className="text-soft-gray font-inter leading-relaxed mb-4">
            When you use our Service, we may automatically collect:
          </p>
          <ul className="list-disc pl-6 text-soft-gray font-inter space-y-2">
            <li>Device information (device type, operating system)</li>
            <li>Usage data (how you interact with the app)</li>
            <li>Local storage data (stored on your device)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            3. How We Use Your Information
          </h2>
          <p className="text-soft-gray font-inter leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-soft-gray font-inter space-y-2">
            <li>Provide, maintain, and improve our Service</li>
            <li>Store your memories, photos, and content locally on your device</li>
            <li>Enable features like timeline, vision board, and music playlists</li>
            <li>Personalize your experience</li>
            <li>Respond to your requests and provide customer support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            4. Data Storage
          </h2>
          <p className="text-soft-gray font-inter leading-relaxed mb-4">
            <strong>Local Storage:</strong> Your data is primarily stored locally on your device using:
          </p>
          <ul className="list-disc pl-6 text-soft-gray font-inter space-y-2 mb-4">
            <li>Browser localStorage (for app data, memories, vision items)</li>
            <li>IndexedDB (for music files and playlists)</li>
            <li>Device storage (for uploaded photos and media)</li>
          </ul>
          <p className="text-soft-gray font-inter leading-relaxed">
            <strong>No Cloud Storage:</strong> We do not store your personal data on external servers. All data remains on your device unless you explicitly choose to back it up or share it.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            5. Data Sharing and Disclosure
          </h2>
          <p className="text-soft-gray font-inter leading-relaxed mb-4">
            We do not sell, trade, or rent your personal information to third parties. Your data is:
          </p>
          <ul className="list-disc pl-6 text-soft-gray font-inter space-y-2">
            <li>Stored locally on your device</li>
            <li>Not transmitted to external servers</li>
            <li>Not shared with third parties</li>
            <li>Only accessible to you and users you explicitly share with</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            6. Your Rights and Choices
          </h2>
          <p className="text-soft-gray font-inter leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-soft-gray font-inter space-y-2">
            <li>Access your data stored locally on your device</li>
            <li>Delete your data at any time through the app</li>
            <li>Export your data (photos, memories, etc.)</li>
            <li>Clear all app data by uninstalling the app</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            7. Children's Privacy
          </h2>
          <p className="text-soft-gray font-inter leading-relaxed">
            Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            8. Security
          </h2>
          <p className="text-soft-gray font-inter leading-relaxed">
            We implement appropriate technical measures to protect your data. However, since data is stored locally on your device, you are responsible for maintaining the security of your device and preventing unauthorized access.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            9. Changes to This Privacy Policy
          </h2>
          <p className="text-soft-gray font-inter leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-playfair font-bold text-charcoal mb-4">
            10. Contact Us
          </h2>
          <p className="text-soft-gray font-inter leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="text-soft-gray font-inter leading-relaxed mt-2">
            Email: [Your Email Address]<br />
            App: Together - Your Shared Life App
          </p>
        </section>
      </div>
    </PageContainer>
  )
}

