import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  padding?: boolean;
}

export function Container({
  children,
  className = '',
  maxWidth = 'xl',
  padding = true,
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '4xl': 'max-w-7xl',
    '6xl': 'max-w-[1400px]',
    full: 'max-w-full',
  };

  const classes = [
    'mx-auto',
    maxWidthClasses[maxWidth],
    padding ? 'px-6' : '',
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: 'white' | 'gray' | 'dark' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Section({
  children,
  className = '',
  id,
  background = 'white',
  padding = 'lg',
}: SectionProps) {
  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-[#171417]',
    gradient: 'bg-gradient-to-r from-piku-purple-dark via-piku-cyan to-piku-blue',
  };

  const paddingClasses = {
    none: '',
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  };

  const classes = [
    backgroundClasses[background],
    paddingClasses[padding],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section id={id} className={classes}>
      {children}
    </section>
  );
}
