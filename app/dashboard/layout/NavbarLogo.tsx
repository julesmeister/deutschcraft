import Link from 'next/link';
import { brandConfig } from '@/lib/brand-config';

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center group relative">
      <div className="relative flex items-center">
        {/* German flag diagonal stripes */}
        <div className="absolute inset-0 overflow-hidden rounded-md">
          <div className="absolute -left-2 -top-2 -bottom-2 w-[38%] bg-black -skew-x-12" />
          <div className="absolute left-[34%] -top-2 -bottom-2 w-[38%] bg-red-600 -skew-x-12" />
          <div className="absolute -right-2 -top-2 -bottom-2 w-[38%] bg-yellow-500 -skew-x-12" />
        </div>
        {/* Text */}
        <span className={`relative z-10 ${brandConfig.fontClass} text-lg sm:text-xl lg:text-2xl text-white px-4 py-1.5`}>
          {brandConfig.name}
        </span>
      </div>
    </Link>
  );
}
