import React from 'react';
import { ServiceCard, ServiceCardProps } from './ServiceCard';

export interface ServiceGridItem extends ServiceCardProps {
  id: string;
}

export interface ServiceGridProps {
  items: ServiceGridItem[];
  className?: string;
  animationDelay?: boolean;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  items,
  className = '',
  animationDelay = false,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
}) => {
  const getGridCols = () => {
    const cols = [];
    if (columns.sm) cols.push(`grid-cols-${columns.sm}`);
    if (columns.md) cols.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) cols.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) cols.push(`xl:grid-cols-${columns.xl}`);
    return cols.join(' ');
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`grid ${getGridCols()} gap-6`}>
        {items.map((item, index) => (
          <div
            key={item.id}
            className="w-full"
            style={
              animationDelay
                ? {
                    animationDelay: `${index * 100}ms`,
                  }
                : undefined
            }
          >
            <ServiceCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
};
