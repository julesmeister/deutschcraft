import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface WeeklyProgressChartProps {
  weeklyData: number[];
  totalWords: number;
}

export function WeeklyProgressChart({ weeklyData, totalWords }: WeeklyProgressChartProps) {
  // Generate a slightly varied secondary series for visual interest
  const secondarySeries = weeklyData.map(value => Math.floor(value * 0.6));

  // Exact Bitcoin Earnings config from Slim Dashboard 01
  const chartConfig = {
    options: {
      colors: ['#17A3F1', '#E219D7', '#1560BD'], // Slim cuaternary, tertiary, primary
      chart: {
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        parentHeightOffset: 0,
      },
      stroke: {
        width: 2,
      },
      markers: {
        size: 5,
      },
      grid: {
        show: false,
      },
      xaxis: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      yaxis: {
        show: false,
      },
    },
    series: [
      {
        name: 'Words Studied',
        data: weeklyData,
      },
      {
        name: 'Words Reviewed',
        data: secondarySeries,
      },
    ],
  };

  return (
    <div className="bg-white border border-gray-200 relative overflow-hidden" style={{ minHeight: '280px' }}>
      {/* ApexCharts Area Background */}
      <div className="absolute top-0 bottom-0 left-0 right-0">
        <Chart
          options={chartConfig.options}
          series={chartConfig.series}
          type="area"
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '-10px',
            right: '-10px',
          }}
          width="100%"
          height="70%"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative p-6 w-full md:w-2/3">
        <p className="text-5xl font-bold text-gray-900 mb-1">
          {totalWords}{' '}
          <span className="text-base text-gray-600">WORDS</span>
        </p>
        <p className="text-sm font-bold uppercase text-gray-900 mb-2">WEEKLY PROGRESS</p>
        <p className="text-sm text-gray-500 mb-4">
          You've learned {totalWords} words this week. Keep up the excellent work!
        </p>
        <button className="border border-gray-900 px-4 py-2 text-sm font-bold uppercase hover:bg-gray-900 hover:text-white transition">
          View Details →
        </button>
      </div>
    </div>
  );
}
