/**
 * ScrollReveal Component
 * Adds scroll-triggered animations to sections using Framer Motion
 */

'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'blur';
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number; // How much of the element needs to be visible (0-1)
  className?: string;
  exitOnLeave?: boolean; // Whether to animate out when leaving viewport
}

const variants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 75 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -75 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -75 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 75 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 75 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -75 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -75 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 75 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
  },
};

export function ScrollReveal({
  children,
  variant = 'fadeIn',
  delay = 0,
  duration = 0.6,
  once = false,
  amount = 0.3,
  className = '',
  exitOnLeave = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : (exitOnLeave ? 'exit' : 'hidden')}
      variants={variants[variant]}
      transition={{
        duration,
        delay: isInView ? delay : 0, // Only delay entrance, not exit
        ease: [0.25, 0.4, 0.25, 1], // Custom easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScrollStagger Component
 * Staggers animations for child elements
 */
interface ScrollStaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'blur';
  className?: string;
  once?: boolean;
}

export function ScrollStagger({
  children,
  staggerDelay = 0.1,
  variant = 'slideUp',
  className = '',
  once = false,
}: ScrollStaggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem Component
 * Individual item for use within ScrollStagger
 */
interface StaggerItemProps {
  children: ReactNode;
  variant?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'blur';
  className?: string;
}

export function StaggerItem({ children, variant = 'slideUp', className = '' }: StaggerItemProps) {
  return (
    <motion.div variants={variants[variant]} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * ParallaxSection Component
 * Adds subtle parallax effect on scroll
 */
interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number; // -1 to 1, negative for slower, positive for faster
  className?: string;
}

export function ParallaxSection({ children, speed = -0.5, className = '' }: ParallaxSectionProps) {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      style={{
        y: 0,
      }}
      whileInView={{
        y: speed * 50,
      }}
      transition={{ duration: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
