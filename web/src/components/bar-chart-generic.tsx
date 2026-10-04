'use client';

import { chartColors } from '@/config/chart-colors';

import { ApexOptions } from 'apexcharts';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface BarChartCompareProps {
  max: number;
  categories: string[];
  series: Scores[];
}

type Scores = {
  name: string;
  data: number[];
};

export const BarChartCompare = ({
  max,
  series,
  categories
}: BarChartCompareProps) => {
  const { theme } = useTheme();
  const apexChartTheme = theme === 'dark' ? 'dark' : 'light';
  const options: ApexOptions = {
    colors: chartColors,
    theme: {
      mode: apexChartTheme
    },
    legend: {
      show: true
    },
    chart: {
      toolbar: {
        show: false
      },
      fontFamily: 'var(--font-sans), sans-serif',
      background: 'transparent'
    },
    yaxis: {
      max
    },
    xaxis: {
      categories,
      labels: {
        style: {
          fontFamily: 'var(--font-sans), sans-serif'
        }
      }
    },
    plotOptions: {
      bar: {
        distributed: false
      }
    }
  };

  return (
    <>
      <ApexChart
        type='bar'
        options={options}
        series={series}
        height={350}
        width='100%'
      />
    </>
  );
};
