interface StatsCardProps {
  icon: string;
  iconBgColor: string;
  label: string;
  value: string | number;
}

export function StatsCard({ icon, iconBgColor, label, value }: StatsCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-4 hover:bg-gray-50/50 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );
}
