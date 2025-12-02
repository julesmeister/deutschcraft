import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface WeeklyProgressChartProps {
  weeklyData: number[];
  totalWords: number;
}

export function WeeklyProgressChart({ weeklyData, totalWords }: WeeklyProgressChartProps) {
  const { data: session } = useSession();

  // Generate a slightly varied secondary series for visual interest
  const secondarySeries = weeklyData.map(value => Math.floor(value * 0.6));

  // Get achievements link (same logic as in dashboard layout)
  const achievementsLink = session?.user?.email
    ? `/dashboard/teacher/students/${encodeURIComponent(session.user.email)}`
    : '/dashboard/achievements';

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
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
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
    <div className="bg-white border border-gray-200 relative overflow-hidden min-h-[240px] md:min-h-[280px]">
      {/* ApexCharts Area Background */}
      <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none">
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
          height="60%"
        />
      </div>

      {/* View Details Button - Top Right */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
        <Link
          href={achievementsLink}
          className="border border-gray-900 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold uppercase hover:bg-gray-900 hover:text-white transition inline-block"
        >
          View Details →
        </Link>
      </div>

      {/* Content Overlay */}
      <div className="relative p-4 md:p-6 w-full md:w-2/3">
        <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">
          {totalWords}{' '}
          <span className="text-sm md:text-base text-gray-600">WORDS</span>
        </p>
        <p className="text-xs md:text-sm font-bold uppercase text-gray-900 mb-2">WEEKLY PROGRESS</p>
        <p className="text-xs md:text-sm text-gray-500 mb-4 pr-24 md:pr-0">
          You've learned {totalWords} words this week. Keep up the excellent work!
        </p>
      </div>
    </div>
  );
}
