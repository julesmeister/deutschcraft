'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { ActionButton, ActionButtonIcons } from '@/components/ui/ActionButton';

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
  const router = useRouter();
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
      // User is signed in, redirect to dashboard using Next.js router
      router.push('/dashboard');
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
    <header className="fixed top-0 left-0 right-0 z-50 lg:py-3 lg:py-4">
      <div className="lg:container lg:mx-auto lg:px-6">
        {/* Mobile: Sticky bar, no floating, no curves, no shadow */}
        {/* Desktop: Floating with rounded corners */}
        <div className={`flex items-center justify-between transition-all duration-500
          lg:py-3 lg:px-8 lg:rounded-full lg:shadow-lg
          py-4 px-4
          ${dark ? 'bg-gray-900 text-white' : 'bg-white'}
          ${isScrolled ? 'lg:shadow-2xl' : 'lg:shadow-lg'}`}>
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
            {/* Nav Items */}
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
            <div className="hidden lg:flex items-center w-48">
              <ActionButton
                onClick={handleAuthClick}
                disabled={status === 'loading'}
                variant="purple"
                icon={<ActionButtonIcons.ArrowRight />}
              >
                {getAuthButtonText()}
              </ActionButton>
            </div>
          )}

          {/* User Menu for Logged In Users */}
          {!showAuthButton && session && (
            <div className="hidden lg:flex items-center w-40">
              <ActionButton
                onClick={() => signOut({ callbackUrl: '/' })}
                variant={dark ? 'gray' : 'purple'}
                icon={<ActionButtonIcons.Logout />}
              >
                Sign out
              </ActionButton>
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
          <div className="lg:hidden mt-0 py-4 bg-white border-t border-gray-200 animate-slide-down overflow-hidden">
            <nav className="flex flex-col space-y-3 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-piku-purple-dark font-bold py-2 text-base"
                >
                  {item.name}
                </Link>
              ))}
              {showAuthButton && (
                <>
                  <div className="pt-2">
                    <ActionButton
                      onClick={() => {
                        handleAuthClick();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={status === 'loading'}
                      variant="purple"
                      icon={<ActionButtonIcons.ArrowRight />}
                    >
                      {getAuthButtonText()}
                    </ActionButton>
                  </div>
                </>
              )}
              {!showAuthButton && session && (
                <>
                  <div className="pt-2">
                    <ActionButton
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setIsMobileMenuOpen(false);
                      }}
                      variant="gray"
                      icon={<ActionButtonIcons.Logout />}
                    >
                      Sign out
                    </ActionButton>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
