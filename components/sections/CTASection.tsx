'use client';

import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-piku-purple-dark via-piku-cyan to-piku-blue relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 text-center text-white">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to master German?
        </h2>
        <p className="text-xl md:text-2xl mb-8 text-white/90">
          Join thousands of students achieving fluency with Testmanship
        </p>
        <Link
          href="/signup"
          className="theme-btn group inline-flex items-center bg-white text-piku-purple-dark font-black text-[15px] py-2 pl-8 pr-2 rounded-md"
        >
          <span className="btn-text relative z-10 transition-colors duration-300">Start Learning Today - It's Free!</span>
          <span className="btn-icon relative z-10 ml-8 w-12 h-12 flex items-center justify-center bg-piku-purple-dark text-white rounded-md transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
}
