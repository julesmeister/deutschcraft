/**
 * CatLoader Component
 * Reusable loading indicator with cute cat animation
 */

interface CatLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function CatLoader({
  message = "Loading...",
  size = "md",
  fullScreen = false,
}: CatLoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const content = (
    <div className="text-center">
      <img
        src="/images/Loadercat.gif"
        alt="Loading..."
        className={`${sizeClasses[size]} mx-auto mb-4 object-contain`}
      />
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
}
