interface PlaceholderViewProps {
  icon: string;
  title: string;
  description: string;
}

export function PlaceholderView({ icon, title, description }: PlaceholderViewProps) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
}
