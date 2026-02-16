'use client';

import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { HowItWorksSection } from '@/components/sections/HowItWorksSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CoursePricingSection } from '@/components/sections/CoursePricingSection';
import { ScreenshotCarousel } from '@/components/sections/ScreenshotCarousel';
import { CTASection } from '@/components/sections/CTASection';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero - No animation, immediately visible */}
      <HeroSection />

      {/* Stats - Slide up */}
      <ScrollReveal variant="slideUp" duration={0.7}>
        <StatsSection />
      </ScrollReveal>

      {/* Features - Scale in */}
      <ScrollReveal variant="scale" duration={0.8} delay={0.1}>
        <FeaturesSection />
      </ScrollReveal>

      {/* Screenshots - Carousel (no ScrollReveal — continuously animating) */}
      <ScreenshotCarousel />

      {/* How It Works - Slide from right */}
      <ScrollReveal variant="slideRight" duration={0.7} delay={0.2}>
        <HowItWorksSection />
      </ScrollReveal>

      {/* Testimonials - Fade in with blur */}
      <ScrollReveal variant="blur" duration={0.8} delay={0.1}>
        <TestimonialsSection />
      </ScrollReveal>

      {/* Pricing - Slide from left */}
      <ScrollReveal variant="slideLeft" duration={0.7} delay={0.2}>
        <CoursePricingSection />
      </ScrollReveal>

      {/* CTA - Scale in */}
      <ScrollReveal variant="scale" duration={0.8} delay={0.1}>
        <CTASection />
      </ScrollReveal>

      {/* Footer - Slide up */}
      <ScrollReveal variant="slideUp" duration={0.6}>
        <Footer />
      </ScrollReveal>
    </main>
  );
}
