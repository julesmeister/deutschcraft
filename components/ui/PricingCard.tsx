/**
 * PricingCard Component
 * Inspired by Intercom's pricing card design
 * Reusable card with header, description, and footer sections
 */

import { ReactNode } from 'react';

interface PricingCardProps {
  title: string;
  description: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function PricingCard({
  title,
  description,
  footer,
  onClick,
  className = ''
}: PricingCardProps) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`
        bg-white rounded-lg p-6 flex flex-col gap-8
        ${onClick ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]' : ''}
        ${className}
      `}
    >
      {/* Header Section */}
      <div>
        <div>
          <h3 className="text-lg md:text-[22px] font-semibold tracking-tight leading-[115%] text-neutral-900 pb-4">
            {title}
          </h3>
        </div>
        <div className="text-base font-normal leading-[1.25] text-neutral-700">
          {description}
        </div>
      </div>

      {/* Footer Section (if provided) */}
      {footer && (
        <div className="border-t border-neutral-300/50 pt-3 flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-baseline lg:gap-0 lg:pt-4">
          {footer}
        </div>
      )}
    </Component>
  );
}

/**
 * PricingCardFooter Component
 * For consistent footer layout with price and metadata
 */
interface PricingCardFooterProps {
  price?: ReactNode;
  metadata?: ReactNode;
  action?: ReactNode;
}

export function PricingCardFooter({ price, metadata, action }: PricingCardFooterProps) {
  return (
    <>
      <div className="flex flex-col gap-1 pb-1 lg:flex-row lg:items-end lg:gap-3 lg:pb-0">
        {price && (
          <div className="flex items-end gap-0.5">
            {price}
          </div>
        )}
        {metadata && (
          <div className="flex items-end gap-3">
            {metadata}
          </div>
        )}
      </div>
      {action && action}
    </>
  );
}

/**
 * Helper components for common footer elements
 */
export function PriceValue({ children }: { children: ReactNode }) {
  return (
    <p className="text-xl md:text-[32px] lg:text-xl font-semibold md:font-light lg:font-semibold tracking-tight md:tracking-[-1.6px] lg:tracking-[-0.2px] leading-[120%] md:leading-[100%] lg:leading-[120%] text-neutral-900">
      {children}
    </p>
  );
}

export function PriceLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-base font-normal leading-[1.25] pb-0 pl-0 md:pb-0.5 md:pl-0.5 lg:pb-px lg:pl-0 text-neutral-700">
      {children}
    </p>
  );
}

export function MetadataItem({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-end gap-3">
      {icon && (
        <div className="self-center">
          <div className="w-[14px] h-[14px] lg:w-1 lg:h-1">{icon}</div>
        </div>
      )}
      <p className="text-base font-normal leading-[1.25] text-neutral-700">
        {children}
      </p>
    </div>
  );
}

export function CardAction({ href, children }: { href?: string; children: ReactNode }) {
  const Component = href ? 'a' : 'div';
  const props = href ? {
    href,
    target: '_blank',
    rel: 'noopener noreferrer'
  } : {};

  return (
    <Component
      {...props}
      className="text-sm font-semibold whitespace-nowrap underline decoration-1 underline-offset-2 hover:decoration-2 transition-all w-fit"
    >
      {children}
    </Component>
  );
}
