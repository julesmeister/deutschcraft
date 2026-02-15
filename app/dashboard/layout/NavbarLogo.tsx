import Link from 'next/link';

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center group relative">
      <div className="relative flex items-center px-3 mt-1">
        {/* Shapes framing the brand */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rotate-45 bg-piku-yellow-light transition-all duration-300 group-hover:rotate-[60deg]" />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-piku-cyan/90 transition-all duration-300 group-hover:scale-125" />
        <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-1.5 h-1.5 rotate-45 bg-piku-purple-light/80 transition-all duration-300 group-hover:rotate-90" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 sm:w-10 h-[2px] bg-piku-mint/90 transition-all duration-300 group-hover:w-12 sm:group-hover:w-14" />
        {/* Text */}
        <span className="relative z-10 font-special-elite text-lg sm:text-xl lg:text-2xl text-white">
          DeutschCraft
        </span>
      </div>
    </Link>
  );
}
