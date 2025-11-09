interface TopPerformersProps {
  students: Array<{
    id: string;
    name: string;
    sold: number;
  }>;
}

export function TopPerformers({ students }: TopPerformersProps) {
  const topStudents = students
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3);

  return (
    <div className="bg-white border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wide">
          Top Performers 🌟
        </h5>
      </div>
      <div className="p-4 space-y-3">
        {topStudents.map((student, index) => (
          <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                index === 0
                  ? 'bg-piku-gold'
                  : index === 1
                  ? 'bg-gray-300'
                  : 'bg-piku-orange'
              }`}
            >
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{student.name}</p>
              <p className="text-xs text-gray-600">{student.sold} words learned</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
