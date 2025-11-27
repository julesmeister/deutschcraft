/**
 * FeatureCard Example
 * Demonstrates how to use the FeatureCard and FeatureCardBlock components
 */

import { FeatureCard } from './FeatureCard';
import { FeatureCardBlock } from './FeatureCardBlock';

export function FeatureCardExample() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">FeatureCard Examples</h1>

      {/* Example 1: Basic Cards in a Block */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Exercise Cards</h2>
        <FeatureCardBlock>
          <FeatureCard
            title="Translation Exercise"
            subtitle="Translate sentences from English to German"
            badge={{
              text: 'easy',
              variant: 'success'
            }}
            button={{
              text: 'Start Exercise',
              onClick: () => console.log('Start clicked')
            }}
            features={[
              '10 sentences to translate',
              'Estimated time: 15 minutes',
              'Beginner friendly'
            ]}
          />

          <FeatureCard
            title="Creative Writing"
            subtitle="Write a short story about your daily routine"
            badge={{
              text: '✓ Attempted',
              variant: 'default'
            }}
            variant="highlighted"
            button={{
              text: 'Try Again',
              onClick: () => console.log('Try again clicked')
            }}
            features={[
              'Min. 150 words required',
              'Estimated time: 20 minutes',
              'Practice descriptive writing'
            ]}
          />
        </FeatureCardBlock>
      </div>

      {/* Example 2: Cards with Footer */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Cards with Custom Footer</h2>
        <FeatureCardBlock maxWidth="md">
          <FeatureCard
            title="Email Template"
            subtitle="Write a formal email to your professor"
            badge={{
              text: 'medium',
              variant: 'warning'
            }}
            footerLeft={<div className="text-sm">⏱️ 20 min</div>}
            footerRight={<div className="text-sm">200+ words</div>}
            button={{
              text: 'Start Writing',
              onClick: () => console.log('Start writing')
            }}
          />
        </FeatureCardBlock>
      </div>

      {/* Example 3: Pricing-style Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Pricing Example</h2>
        <FeatureCardBlock>
          <FeatureCard
            icon="https://cdn.prod.website-files.com/68941ce79405b89a4fe18624/689d7f249aa88817a9be77ce_Product%20Icon.svg"
            title="Starter Plan"
            subtitle="Perfect for small businesses and startups"
            footerLeft={<div>$499</div>}
            footerRight={<div>/month</div>}
            button={{
              text: 'Get Started',
              onClick: () => console.log('Get started')
            }}
            features={[
              'Social Media (Up to 4 platforms)',
              'Advanced SEO & Keyword Strategy',
              'Paid Ads (Google + Meta)',
              'Blog & Content Creation'
            ]}
          />

          <FeatureCard
            icon="https://cdn.prod.website-files.com/68941ce79405b89a4fe18624/689d87b143351f7144a6205e_colorfilter.svg"
            title="Growth Plan"
            subtitle="Perfect for growing companies"
            badge={{
              text: '#Best Deal',
              variant: 'warning'
            }}
            variant="highlighted"
            footerLeft={<div>$1,299</div>}
            footerRight={<div>/month</div>}
            button={{
              text: 'Get Started',
              onClick: () => console.log('Get started')
            }}
            features={[
              'Social Media Plan (All platforms)',
              'Technical SEO & Authority Building',
              'Paid Ads (Google, Meta, LinkedIn, TikTok)',
              'Content Plan (Blog, Video, Lead Magnets)'
            ]}
          />
        </FeatureCardBlock>
      </div>
    </div>
  );
}
