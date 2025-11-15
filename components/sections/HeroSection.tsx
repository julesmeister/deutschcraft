'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function HeroSection() {
  const router = useRouter();
  const { data: session, status } = useSession();

  console.info('🎨 HeroSection rendered | Status:', status, '| Has session:', !!session);

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    console.info('🏠 Homepage useEffect - Status:', status, '| Session:', !!session);

    if (status === 'loading') {
      console.info('⏳ Still loading session...');
      return;
    }

    if (session) {
      // Validate session is not expired before redirecting
      const expiryDate = new Date(session.expires);
      const now = new Date();
      const isExpired = expiryDate < now;

      console.info('Session check - Email:', session.user?.email, '| Expired:', isExpired);

      if (!isExpired) {
        console.info('🔄 Auto-redirecting authenticated user to dashboard');
        window.location.href = '/dashboard';
      } else {
        console.warn('⚠️ Session is expired, not redirecting');
      }
    } else {
      console.info('ℹ️ No session, staying on homepage');
    }
  }, [session, status]);

  // Session validation happens in handleStartLearning

  const handleStartLearning = async () => {
    alert('🔵 BUTTON CLICKED!'); // DEBUG: Make it VERY obvious
    console.info('🔵 START LEARNING CLICKED');
    console.info('Status:', status, '| Session exists:', !!session);

    if (status === 'loading') {
      console.info('⏳ Session still loading...');
      return;
    }

    if (session) {
      console.info('✅ Session found:', session.user?.email);

      // Validate session is not expired
      const expiryDate = new Date(session.expires);
      const now = new Date();
      const isExpired = expiryDate < now;
      console.info('Session expired?', isExpired, '| Expires:', session.expires);

      if (isExpired) {
        console.info('🔄 Session expired, re-authenticating...');
        // Session expired, need to re-authenticate
        try {
          await signIn('google', {
            callbackUrl: window.location.origin + '/dashboard',
            redirect: true
          });
        } catch (error) {
          console.error('❌ Re-authentication failed:', error);
        }
        return;
      }

      // Valid session, redirect to dashboard
      console.info('🚀 Navigating to dashboard...');
      console.info('Current path:', window.location.pathname);

      // Use window.location.href directly since router.push has issues
      window.location.href = '/dashboard';
    } else {
      console.info('🔐 No session, triggering Google sign-in...');
      // No session, trigger sign-in
      try {
        await signIn('google', {
          callbackUrl: window.location.origin + '/dashboard',
          redirect: true
        });
        console.info('✓ signIn called');
      } catch (error) {
        console.error('❌ Sign-in failed:', error);
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#171417] pt-24 pb-12 md:pt-28 md:pb-16 lg:pt-20 lg:pb-20">
      {/* Vertical line grid pattern like Piku */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-white"
            style={{ left: `${i * 8.33}%` }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-6 md:space-y-8">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white animate-fade-in-down">
              AI-Powered German Learning
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in-up">
              Learn{' '}
              <span className="text-piku-purple-dark">
                German
              </span>{' '}
              Together
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-manrope animate-fade-in-up animation-delay-100">
              A unique approach to learning German with AI-powered flashcards, peer collaboration, and personalized teacher feedback.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-200">
              <button
                onClick={handleStartLearning}
                disabled={status === 'loading'}
                className="theme-btn theme-btn-light group inline-flex items-center justify-between bg-piku-purple-dark text-white font-black text-[15px] py-2 pl-8 pr-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="btn-text relative z-10 transition-colors duration-300">
                  {status === 'loading' ? 'Loading...' : session ? 'Go to Dashboard' : 'Start Learning'}
                </span>
                <span className="btn-icon relative z-10 ml-8 w-12 h-12 flex items-center justify-center bg-white text-piku-purple-dark rounded-md transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417] shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Stats Row - Responsive for mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-8 md:pt-12 animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-piku-cyan-accent flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-piku-cyan-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">60x Faster Learning</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-piku-gold flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-piku-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">70% Better Retention</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-piku-pink flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-piku-pink" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Save 4,000+ hours</h3>
              </div>
            </div>
          </div>

          {/* Right Content - Mockup/Illustration */}
          <div className="relative animate-fade-in-right animation-delay-200">
            <div className="relative">
              {/* Floating Cards */}
              <div className="absolute top-0 right-0 w-64 p-6 bg-white rounded-2xl shadow-lg animate-float">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-piku-yellow-light to-piku-gold" />
                  <div>
                    <p className="font-semibold text-gray-900">Daily Goal</p>
                    <p className="text-sm text-gray-600">20 words</p>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-piku-yellow-light to-piku-gold rounded-full w-3/4 animate-pulse" />
                </div>
                <p className="text-sm text-gray-600 mt-2">15/20 completed</p>
              </div>

              <div className="absolute bottom-0 left-0 w-64 p-6 bg-white rounded-2xl shadow-lg animate-float animation-delay-300">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Level</p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-piku-purple-dark">B1</span>
                    <span className="text-gray-600">Intermediate</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-2 bg-piku-purple-dark rounded-full" />
                  <div className="flex-1 h-2 bg-piku-purple-dark rounded-full" />
                  <div className="flex-1 h-2 bg-piku-purple-dark rounded-full" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                </div>
              </div>

              {/* Center Main Card */}
              <div className="relative z-10 w-80 mx-auto p-8 bg-white rounded-3xl shadow-lg">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">Flashcard</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">der Apfel</h3>
                  <p className="text-gray-600">What does this mean?</p>
                </div>
                <div className="space-y-3">
                  <button className="w-full p-4 bg-gradient-to-r from-piku-mint to-piku-green text-gray-900 font-semibold rounded-xl hover:shadow-lg transition-all">
                    Apple
                  </button>
                  <button className="w-full p-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                    Orange
                  </button>
                  <button className="w-full p-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all">
                    Banana
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
