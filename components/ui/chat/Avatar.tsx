import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
};

export function Avatar({ src, alt = 'Avatar', fallback, size = 'md' }: AvatarProps) {
  return (
    <span
      className={`inline-block relative rounded-full bg-neutral-400 text-neutral-100 leading-9 overflow-hidden ${sizeClasses[size]}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="rounded-full object-cover"
          sizes="36px"
        />
      ) : (
        <span className="flex items-center justify-center w-full h-full font-semibold">
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  );
}
