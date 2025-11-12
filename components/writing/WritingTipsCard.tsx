import { Card, CardContent, CardTitle } from '@/components/ui/Card';

export function WritingTipsCard() {
  const tips = [
    {
      number: 1,
      title: 'Start Simple',
      description: 'Begin with shorter sentences and basic vocabulary',
      color: 'blue',
    },
    {
      number: 2,
      title: 'Practice Daily',
      description: 'Even 10 minutes a day makes a difference',
      color: 'emerald',
    },
    {
      number: 3,
      title: 'Review Feedback',
      description: 'Learn from corrections to improve faster',
      color: 'amber',
    },
    {
      number: 4,
      title: 'Use New Vocabulary',
      description: "Try incorporating words you've learned in flashcards",
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <Card className="border-2 border-piku-purple/20" padding="lg">
      <CardTitle size="md" className="mb-4 flex items-center gap-2">
        <span className="text-3xl">💡</span>
        <span>Writing Tips</span>
      </CardTitle>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {tips.map((tip) => {
            const colors = getColorClasses(tip.color);
            return (
              <div key={tip.number} className="flex gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center ${colors.text} font-bold`}
                >
                  {tip.number}
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">{tip.title}</div>
                  <div className="text-sm text-gray-600">{tip.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
