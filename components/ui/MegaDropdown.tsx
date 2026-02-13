'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownItem {
  label: string;
  href: string;
  badge?: string;
  external?: boolean;
}

interface DropdownColumn {
  title: string;
  items: DropdownItem[];
}

interface MegaDropdownProps {
  trigger: string;
  columns: DropdownColumn[];
  onNavigate?: () => void;
}

export function MegaDropdown({ trigger, columns, onNavigate }: MegaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const navbar = buttonRef.current.closest('[data-navbar]') as HTMLElement | null;
    if (!navbar) return;
    const navRect = navbar.getBoundingClientRect();
    setPanelStyle({
      position: 'fixed',
      left: navRect.left,
      width: navRect.width,
      top: navRect.bottom + 10,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colCount = columns.length;

  const panel = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="z-[9999]"
          style={panelStyle}
        >
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/60 shadow-2xl p-5 sm:p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div
              className="grid gap-6 sm:gap-8"
              style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}
            >
              {columns.map((column, colIdx) => (
                <div key={colIdx}>
                  <h6 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5 pb-1.5 border-b border-gray-700/50">
                    {column.title}
                  </h6>
                  <ul className="space-y-0.5">
                    {column.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link
                          href={item.href}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                          onClick={() => {
                            setIsOpen(false);
                            onNavigate?.();
                          }}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-150"
                        >
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-medium bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
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

      {mounted && createPortal(panel, document.body)}
    </>
  );
}
