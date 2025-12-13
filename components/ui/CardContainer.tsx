import React, { ReactNode } from 'react';

export interface CardContainerProps {
  children: ReactNode;
  className?: string;
  layout?: 'flex' | 'grid' | 'custom';
  gap?: 'sm' | 'md' | 'lg';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const gapStyles = {
  sm: 'gap-3',
  md: 'gap-6',
  lg: 'gap-8',
};

const justifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className = '',
  layout = 'flex',
  gap = 'md',
  justifyContent = 'center',
}) => {
  const baseClasses = 'w-full';

  const layoutClasses = {
    flex: `flex flex-wrap ${justifyStyles[justifyContent]} ${gapStyles[gap]}`,
    grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gapStyles[gap]}`,
    custom: '',
  };

  return (
    <div className={`${baseClasses} ${layoutClasses[layout]} ${className}`}>
      {children}
    </div>
  );
};
