'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 lg:py-4">
      <div className="container mx-auto px-6">
        <div className={`flex items-center justify-between transition-all duration-500 bg-white py-3 px-8 rounded-full shadow-lg ${
          isScrolled ? 'shadow-2xl' : 'shadow-lg'
        }`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-piku-purple-dark flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-black text-xl">T</span>
            </div>
            <span className="font-black text-xl text-gray-900">
              Testmanship
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            <Link
              href="#how-it-works"
              className="font-bold text-[15px] text-gray-900 hover:text-piku-cyan-accent transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-cyan-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="font-bold text-[15px] text-gray-900 hover:text-piku-cyan-accent transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-cyan-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              Pricing
            </Link>
            <Link
              href="#testimonials"
              className="font-bold text-[15px] text-gray-900 hover:text-piku-cyan-accent transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-cyan-accent after:transition-all after:duration-300 hover:after:w-full"
            >
              Testimonials
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link
              href="/login"
              className="font-bold text-[15px] px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-gray-900 hover:text-piku-purple-dark"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="theme-btn group inline-flex items-center bg-piku-purple-dark text-white font-black text-[14px] py-1.5 pl-5 pr-1.5 rounded-full"
            >
              <span className="btn-text relative z-10 transition-colors duration-300">Start Learning</span>
              <span className="btn-icon relative z-10 ml-4 w-9 h-9 flex items-center justify-center bg-white text-piku-purple-dark rounded-full transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white rounded-lg shadow-lg animate-fade-in-down">
            <nav className="flex flex-col space-y-4 px-4">
              <Link href="#how-it-works" className="text-gray-700 hover:text-piku-purple-dark font-medium">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-piku-purple-dark font-medium">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-piku-purple-dark font-medium">
                Testimonials
              </Link>
              <hr />
              <Link href="/login" className="text-gray-700 hover:text-piku-purple-dark font-medium">
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-gradient-to-r from-piku-purple-dark to-piku-cyan text-white font-semibold rounded-xl text-center"
              >
                Start Learning
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
