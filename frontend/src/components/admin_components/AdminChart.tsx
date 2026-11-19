import { Line } from 'react-chartjs-2';
import { ChartData } from "chart.js";

import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js';

type ChartOverviewProps = {
    chartData: ChartData<"line">;
};

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
        },
    },
    scales: {
        x: {
            grid: {
            display: true,
            },
            ticks: {
            color: '#6B7280',
            },
        },
        y: {
            grid: {
            color: '#E5E7EB',
            },
            ticks: {
            color: 'color-Primary',
            beginAtZero: true,
            precision: 0,
            },
        },
    },
};

const ChartsOverview: React.FC<ChartOverviewProps> = ({ chartData }) => {
    return (
        <div className="flex flex-row justify-start h-full w-full p-2">
            <div className="rounded-2xl border border-MidBlue border-2 bg-white p-4 relative h-full min-h-[300px] min-w-[500px] w-fit">
                <h2 className="text-xl text-Primary font-semibold mb-4">
                    Event Creation Trend
                </h2>
                <div className="flex flex-col justify-center items-center max-h-[200px] max-w-full">
                    <Line data={chartData} options={chartOptions}/>
                </div>
            </div>
        </div>
    )
}

export default ChartsOverview;