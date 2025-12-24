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
    console.info('🔵 NAVBAR AUTH BUTTON CLICKED');
    console.info('Status:', status, '| Session exists:', !!session, '| Has custom handler:', !!onAuthClick);

    if (onAuthClick) {
      console.info('✓ Using custom onAuthClick handler');
      onAuthClick();
    } else if (session) {
      console.info('✅ Session found, navigating to dashboard');
      console.info('Current path:', window.location.pathname);
      // User is signed in, redirect to dashboard
      window.location.href = '/dashboard';
      console.info('✓ window.location.href set to /dashboard');
    } else {
      console.info('🔐 No session, triggering Google sign-in');
      // User is not signed in, trigger Google sign-in
      signIn('google', { callbackUrl: '/dashboard' });
      console.info('✓ signIn called');
    }
  };

  const getAuthButtonText = () => {
    if (status === 'loading') return 'Loading...';
    if (authButtonText) return authButtonText;
    return session ? 'Go to Dashboard' : 'Start Learning';
  };

  return (
    <header className="sticky left-0 right-0 top-0 z-[99] py-3 lg:py-3">
      <div className="mx-auto flex w-full max-w-7xl justify-center px-4 lg:px-8">
        {/* Modern floating navbar with backdrop blur */}
        <div className={`w-full transition-all duration-500 ease-out
          ${dark ? 'bg-gray-900/95 text-white' : 'bg-white/95'}
          backdrop-blur-md border rounded-2xl
          ${isScrolled
            ? 'border-gray-200/60 shadow-lg'
            : 'border-transparent shadow-none'
          }`}>
          <div className="flex items-center justify-between gap-8 p-2 pl-4 lg:p-2.5"
>
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

            {/* Desktop Navigation with separator */}
            <div className="hidden lg:flex items-center flex-1 justify-end gap-8">
              {/* Vertical separator */}
              <div className="h-4 w-px bg-gray-200/80"></div>

              <nav className="flex items-center space-x-10">
                {/* Nav Items */}
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`font-semibold text-sm transition-all duration-200 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:transition-all after:duration-300 hover:after:w-full ${
                      dark
                        ? 'text-gray-300 hover:text-piku-cyan-accent after:bg-piku-cyan-accent'
                        : 'text-gray-700 hover:text-gray-900 after:bg-piku-purple-dark'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* CTA Button */}
              {showAuthButton && (
                <div className="flex items-center">
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
                <div className="flex items-center">
                  <ActionButton
                    onClick={() => signOut({ callbackUrl: '/' })}
                    variant={dark ? 'gray' : 'purple'}
                    icon={<ActionButtonIcons.Logout />}
                  >
                    Sign out
                  </ActionButton>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 active:bg-gray-200 ${
                dark ? 'hover:bg-gray-800 active:bg-gray-700' : ''
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className={`w-6 h-6 ${dark ? 'text-white' : 'text-gray-900'}`}
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
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 py-4 bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-2xl shadow-lg animate-slide-down overflow-hidden">
            <nav className="flex flex-col space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-semibold py-2.5 px-3 text-sm rounded-lg transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              {showAuthButton && (
                <>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="px-3 pt-1">
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
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="px-3 pt-1">
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
