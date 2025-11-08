'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { MegaDropdown } from './MegaDropdown';

interface NavItem {
  name: string;
  href: string;
}

interface NavbarProps {
  /** Navigation items (default: landing page items) */
  navItems?: NavItem[];
  /** Show auth button (default: true) */
  showAuthButton?: boolean;
  /** Custom auth button text when logged in */
  authButtonText?: string;
  /** Custom auth button click handler */
  onAuthClick?: () => void;
  /** Dark theme variant (default: false) */
  dark?: boolean;
}

export function Navbar({
  navItems = [
    { name: 'Features', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
  ],
  showAuthButton = true,
  authButtonText,
  onAuthClick,
  dark = false,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = () => {
    if (onAuthClick) {
      onAuthClick();
    } else if (session) {
      // User is signed in, redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // User is not signed in, trigger Google sign-in
      signIn('google', { callbackUrl: '/dashboard' });
    }
  };

  const getAuthButtonText = () => {
    if (status === 'loading') return 'Loading...';
    if (authButtonText) return authButtonText;
    return session ? 'Go to Dashboard' : 'Start Learning';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 lg:py-4">
      <div className="container mx-auto px-6">
        <div className={`flex items-center justify-between transition-all duration-500 py-3 px-8 rounded-full shadow-lg ${
          dark
            ? 'bg-gray-900 text-white'
            : 'bg-white'
        } ${isScrolled ? 'shadow-2xl' : 'shadow-lg'}`}>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className={`w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
              dark
                ? 'rounded-full bg-white'
                : 'rounded-lg bg-piku-purple-dark'
            }`}>
              <span className={`font-black text-xl ${dark ? 'text-gray-900' : 'text-white'}`}>T</span>
            </div>
            <span className={`font-black text-xl ${dark ? 'text-white' : 'text-gray-900'}`}>
              Testmanship
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-bold text-[15px] transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full ${
                  dark
                    ? 'text-gray-300 hover:text-piku-cyan-accent after:bg-piku-cyan-accent'
                    : 'text-gray-900 hover:text-piku-cyan-accent after:bg-piku-cyan-accent'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          {showAuthButton && (
            <div className="hidden lg:flex items-center">
              <button
                onClick={handleAuthClick}
                disabled={status === 'loading'}
                className="theme-btn group inline-flex items-center bg-piku-purple-dark text-white font-black text-[14px] py-1.5 pl-5 pr-1.5 rounded-full disabled:opacity-50"
              >
                <span className="btn-text relative z-10 transition-colors duration-300">
                  {getAuthButtonText()}
                </span>
                <span className="btn-icon relative z-10 ml-4 w-9 h-9 flex items-center justify-center bg-white text-piku-purple-dark rounded-full transition-all duration-400 group-hover:bg-piku-cyan-accent group-hover:text-[#171417]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          )}

          {/* User Menu for Logged In Users */}
          {!showAuthButton && session && (
            <div className="hidden lg:flex items-center">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={`group inline-flex items-center font-black text-[14px] py-1.5 pl-5 pr-1.5 rounded-full ${
                  dark
                    ? 'theme-btn-dark bg-white text-gray-900'
                    : 'theme-btn bg-piku-purple-dark text-white'
                }`}
              >
                <span className={`relative z-10 transition-colors duration-300 ${
                  dark ? '' : 'btn-text'
                }`}>
                  Sign out
                </span>
                <span className={`relative z-10 ml-4 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-400 ${
                  dark
                    ? 'bg-gray-900 text-white'
                    : 'btn-icon bg-white text-piku-purple-dark group-hover:bg-piku-cyan-accent group-hover:text-[#171417]'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
              </button>
            </div>
          )}

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
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-piku-purple-dark font-medium"
                >
                  {item.name}
                </Link>
              ))}
              {showAuthButton && (
                <>
                  <hr />
                  <button
                    onClick={handleAuthClick}
                    disabled={status === 'loading'}
                    className="px-6 py-3 bg-gradient-to-r from-piku-purple-dark to-piku-cyan text-white font-semibold rounded-xl text-center disabled:opacity-50"
                  >
                    {getAuthButtonText()}
                  </button>
                </>
              )}
              {!showAuthButton && session && (
                <>
                  <hr />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl text-center hover:bg-gray-200"
                  >
                    Sign out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
