import { Card, CardContent, CardTitle } from '@/components/ui/Card';

export function PricingInfoCards() {
  return (
    <div className="mt-8 grid md:grid-cols-2 gap-6">
      <Card className="border-2 border-piku-purple/20" padding="lg">
        <CardTitle size="md" className="mb-4 flex items-center gap-2">
          <span className="text-3xl">⏱️</span>
          <span>How Duration Works</span>
        </CardTitle>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-piku-purple/10 flex items-center justify-center text-piku-purple font-bold">
                1
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1">Base Duration</div>
                <div className="text-sm text-gray-600">
                  Set in "Syllabus Weeks" - this is for 1 hour/day study pace
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-piku-cyan-accent/20 flex items-center justify-center text-gray-900 font-bold">
                2
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1">Intensity Multipliers</div>
                <div className="text-sm text-gray-600">
                  Students choosing 2-4 hrs/day will complete faster, but pay the same price
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pastel-blossom/20 flex items-center justify-center text-gray-900 font-bold">
                3
              </div>
              <div>
                <div className="font-bold text-gray-900 mb-1">Non-linear Scaling</div>
                <div className="text-sm text-gray-600">
                  4 hrs/day ≠ 4x speed (retention factors applied for realistic learning)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-piku-cyan-accent/20" padding="lg">
        <CardTitle size="md" className="mb-4 flex items-center gap-2">
          <span className="text-3xl">💰</span>
          <span>Pricing Model</span>
        </CardTitle>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-piku-purple/10 to-piku-cyan-accent/10 rounded-xl">
              <div className="font-bold text-gray-900 mb-2">One-Time Payment</div>
              <div className="text-sm text-gray-600">
                Students pay once per CEFR level, regardless of study intensity
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-gray-600">
                  <strong>Fair pricing:</strong> Same cost whether they study 1 or 4 hrs/day
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-gray-600">
                  <strong>Flexible learning:</strong> Students control their pace
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-gray-600">
                  <strong>No pressure:</strong> No monthly fees or recurring charges
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
