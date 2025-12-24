'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
  icon?: string;
  description?: string;
}

interface DropdownColumn {
  title: string;
  items: DropdownItem[];
}

interface HighlightSection {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  image?: string;
}

interface MegaDropdownProps {
  trigger: string;
  highlight?: HighlightSection;
  columns: DropdownColumn[];
  icon?: string;
  onNavigate?: () => void;
}

export function MegaDropdown({ trigger, highlight, columns, icon, onNavigate }: MegaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRipple = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownPanel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-x-0 top-0 z-[9999] pt-20 pointer-events-auto"
        >
            <div className="container mx-auto px-6">
              <div className="bg-white shadow-2xl border border-gray-100 rounded-3xl overflow-hidden mx-auto max-w-6xl">
                <div className="p-8">
                  <div className="grid grid-cols-12 gap-16">
                    {/* Highlight Section (if provided) */}
                    {highlight && (
                      <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: 0,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="col-span-5"
                      >
                        <div className="border border-gray-100 rounded-2xl p-8 h-full flex flex-col justify-between bg-gradient-to-br from-gray-50 to-white">
                          <div>
                            <div className="inline-flex items-center gap-2.5 bg-white border border-gray-100 px-4 py-2 rounded-full text-xs font-medium text-gray-900 mb-5 shadow-sm">
                              {icon && <span className="text-base">{icon}</span>}
                              {highlight.badge}
                            </div>
                            <h5 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                              {highlight.title}
                            </h5>
                            <p className="text-sm font-normal text-gray-600 mb-8 leading-relaxed">
                              {highlight.description}
                            </p>
                          </div>
                          <Link
                            href={highlight.buttonHref}
                            onMouseEnter={handleRipple}
                            onClick={() => {
                              setIsOpen(false);
                              onNavigate?.();
                            }}
                            className="relative inline-block bg-piku-purple-dark text-white text-sm font-semibold px-7 py-3 rounded-xl transition-all duration-300 text-center shadow-sm overflow-hidden group hover:shadow-lg hover:scale-105"
                          >
                            {/* Ripple Effect Container (behind text) */}
                            <span className="absolute inset-0 z-0 rounded-xl overflow-hidden">
                              {ripples.map((ripple) => (
                                <span
                                  key={ripple.id}
                                  className="absolute rounded-full pointer-events-none animate-ripple"
                                  style={{
                                    left: ripple.x,
                                    top: ripple.y,
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: '#31D9EC',
                                    transform: 'translate(-50%, -50%) scale(0)',
                                  }}
                                />
                              ))}
                            </span>

                            {/* Subtle glow on hover (no color change) */}
                            <span className="absolute inset-0 z-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />

                            {/* Text on top */}
                            <span className="relative z-10">{highlight.buttonText}</span>
                          </Link>
                        </div>
                      </motion.div>
                    )}

                    {/* Columns with Staggered Animation */}
                    <div className={highlight ? 'col-span-7' : 'col-span-12'}>
                      <div className="grid grid-cols-3 gap-10">
                        {columns.map((column, columnIdx) => (
                          <div key={columnIdx} className="space-y-4">
                            <motion.h6
                              initial={{ opacity: 0, y: 40 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.35,
                                delay: columnIdx * 0.05,
                                ease: [0.4, 0, 0.2, 1],
                              }}
                              className="text-xs font-semibold text-gray-500 uppercase mb-5 tracking-wider border-b border-gray-100 pb-3"
                            >
                              {column.title}
                            </motion.h6>
                            <ul className="space-y-1">
                              {column.items.map((item, itemIdx) => {
                                const globalIndex = columnIdx * 10 + itemIdx;
                                return (
                                  <motion.li
                                    key={itemIdx}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      duration: 0.35,
                                      delay: globalIndex * 0.05 + 0.1,
                                      ease: [0.4, 0, 0.2, 1],
                                    }}
                                  >
                                    <Link
                                      href={item.href}
                                      target={item.external ? '_blank' : undefined}
                                      rel={item.external ? 'noopener noreferrer' : undefined}
                                      onClick={() => setIsOpen(false)}
                                      className="group flex items-start gap-4 py-3 px-4 rounded-xl text-sm font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                                    >
                                      {item.icon && (
                                        <div className="w-11 h-11 rounded-md bg-gradient-to-br from-piku-purple-light to-piku-cyan-accent flex items-center justify-center text-2xl flex-shrink-0">
                                          {item.icon}
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-gray-900">{item.label}</span>
                                          {item.badge && (
                                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                                              {item.badge}
                                            </span>
                                          )}
                                        </div>
                                        {item.description && (
                                          <p className="text-xs text-gray-500 leading-relaxed">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                      <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                                      </svg>
                                    </Link>
                                  </motion.li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="font-semibold text-[15px] text-gray-300 hover:text-piku-cyan-accent transition-all duration-300 relative flex items-center gap-2 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-piku-cyan-accent after:transition-all after:duration-300 hover:after:w-full"
      >
        {trigger}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Portal dropdown to body level */}
      {mounted && createPortal(dropdownPanel, document.body)}
    </>
  );
}
