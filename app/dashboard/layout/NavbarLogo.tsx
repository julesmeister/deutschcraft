import Link from 'next/link';

export function NavbarLogo() {
  return (
    <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 group">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <span className="font-black text-lg sm:text-xl text-gray-900">T</span>
      </div>
      <span className="font-black text-base sm:text-lg lg:text-xl text-white">DeutschCraft</span>
    </Link>
  );
}
