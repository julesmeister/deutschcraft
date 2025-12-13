import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export type ServiceCardVariant = 'mint' | 'beige' | 'green' | 'purple';

export interface ServiceCardProps {
  icon: string;
  title: string;
  description: string;
  href: string;
  variant?: ServiceCardVariant;
  className?: string;
  showLearnMore?: boolean;
  iconClassName?: string;
}

const variantStyles: Record<ServiceCardVariant, string> = {
  mint: 'bg-[#e2f2f0c4]',
  beige: 'bg-[#f2f2e5]',
  green: 'bg-[#c3e1cd80]',
  purple: 'bg-[#ece2efc4]',
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  href,
  variant = 'mint',
  className = '',
  showLearnMore = true,
  iconClassName = '',
}) => {
  return (
    <div
      className={`
        rounded-[10px] p-6 md:p-[30px_25px]
        transition-all duration-500 hover:shadow-lg
        ${variantStyles[variant]}
        ${className}
      `}
    >
      <div className={`mb-12 md:mb-[70px] ${iconClassName}`}>
        <Image
          src={icon}
          alt={title}
          width={64}
          height={64}
          className="w-auto h-auto max-w-full"
        />
      </div>

      <h3 className="mb-3 text-lg md:text-xl font-bold leading-[1.3]">
        <Link
          href={href}
          className="text-[#11316e] hover:text-[#559adc] transition-colors duration-600"
        >
          {title}
        </Link>
      </h3>

      <p className="mb-5 text-sm md:text-base text-[#4e5e7c] leading-[1.6]">
        {description}
      </p>

      {showLearnMore && (
        <Link
          href={href}
          className="inline-flex items-center text-[#11316e] hover:text-[#559adc] font-medium transition-colors duration-600"
        >
          Learn More
          <span className="ml-1 relative top-[4px] text-xl">→</span>
        </Link>
      )}
    </div>
  );
};
