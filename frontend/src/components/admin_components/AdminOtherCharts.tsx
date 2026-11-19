import { Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { useState } from "react";

function getMonthFromIndex( val: number ) {
    if (val === 1) return "Jan";
    if (val === 2) return "Feb";
    if (val === 3) return "Mar";
    if (val === 4) return "Apr";
    if (val === 5) return "May";
    if (val === 6) return "Jun";
    if (val === 7) return "Jul";
    if (val === 8) return "Aug";
    if (val === 9) return "Sep";
    if (val === 10) return "Oct";
    if (val === 11) return "Nov";
    if (val === 12) return "Dec";
    return "";
}

// ALUMNI JOBS TREND LINE CHART
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
export const JobTrendLineChart: React.FC<{ jobTrendData: any }> = ({ jobTrendData }) => {
    const [monthsShown, setMonthsShown] = useState<number>(5);

    const isArray = Array.isArray(jobTrendData);
    const monthsToShowData = isArray ? jobTrendData.slice((monthsShown > jobTrendData.length) ? 0 : (jobTrendData.length - monthsShown), jobTrendData.length) : [];

    const monthIndexes = isArray ? monthsToShowData.map((data:any) => data.month) : [];
    const monthLabels = monthIndexes ? monthIndexes.map((index: number) => getMonthFromIndex(index)) : null;
    const jobsPerMonth = jobTrendData ? monthsToShowData.map((data:any) => data.total_posts) : null;

    const maxJobs = Math.max(...jobsPerMonth ?? []);
    const monthOptions = Array.from({ length: jobTrendData.length }, (_, i) => i + 1);

    const data = {
        labels: monthLabels ?? [],
        datasets: [{
            label: "No. of Job Posts",
            data: jobsPerMonth ?? [],
            borderColor: '#094fa1',
            backgroundColor: '#094fa1',
            tension: 0.4,
            fill: false,
            pointBackgroundColor: '#094fa1',
            pointBorderColor: '#fff',
            pointHoverRadius: 6,
            pointRadius: 5,
            pointBorderWidth: 2,
        }]
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.raw}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: (Math.floor(maxJobs / 10) * 10) + 10,
                ticks: { stepSize: 20, color: '#094fa0', font: { family: 'Inter' } },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#094fa0', font: { family: 'Inter' } },
            }
        },
        elements: {
            line: { borderWidth: 3 },
            point: { hoverBorderColor: '#094fa1' }
        }
    };
      
    return (
        <div className="flex w-full justify-center items-center gap-4">
            { !jobTrendData || Object.keys(jobTrendData).length === 0 ? 
                <h1>No data found.</h1>
                :
                <div className="w-full flex flex-col gap-2">
                    <div className="text-xs flex gap-2 items-center justify-end text-Primary">
                        <div className="flex gap-1 items-center border-2 border-Primary rounded px-5 mr-5">
                            <h3>Show data from the last</h3>
                            <select
                                id="months-select"
                                value={monthsShown}
                                onChange={(e) => {setMonthsShown(Number(e.target.value))}}
                                className="p-2 focus:outline-none"
                            >
                                {monthOptions.map((value) => (
                                    <option key={value} value={value}>
                                        { value <= 1 ? `${value} month` : `${value} months`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <hr className="w-5 border-2 rounded-full"/><h3 className="text-[#87A2D9]">No. of Job Posts</h3>
                    </div>
                    <div className="w-full" style={{ height: '150px' }}>
                        <Line data={data} options={options} />
                    </div>
                </div>
            }
        </div>
    );
}

// ALUMNI INITIATIVES TREND LINE CHART
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
export const InitiativesTrendLineChart: React.FC<{ initiativeTrendData: any }> = ({ initiativeTrendData }) => {
    const [monthsShown, setMonthsShown] = useState<number>(5);

    const trendData = Object.entries(initiativeTrendData).map(([key, total]) => {
        const [yearStr, monthStr] = key.split("-");
        return {
            year: parseInt(yearStr, 10),
            month: parseInt(monthStr, 10),
            total
        };
    });

    const isEmpty = Object.keys(initiativeTrendData).length === 0;
    
    const monthsToShowData = !isEmpty ? trendData.slice((monthsShown > trendData.length) ? 0 : (trendData.length - monthsShown), trendData.length) : [];
    const monthIndexes = !isEmpty ? monthsToShowData.map((data:any) => data.month) : [];
    const monthLabels = monthIndexes ? monthIndexes.map((index: number) => getMonthFromIndex(index)) : [];
    const initiativesPerMonth = !isEmpty ? monthsToShowData.map((data:any) => data.total) : [];

    const maxInitiatives = Math.max(...initiativesPerMonth ?? []);
    const monthOptions = Array.from({ length: trendData.length }, (_, i) => i + 1);

    const data = {
        labels: monthLabels ?? [],
        datasets: [{
            label: "No. of Job Posts",
            data: initiativesPerMonth ?? [],
            borderColor: '#094fa1',
            backgroundColor: '#094fa1',
            tension: 0.4,
            fill: false,
            pointBackgroundColor: '#094fa1',
            pointBorderColor: '#fff',
            pointHoverRadius: 6,
            pointRadius: 5,
            pointBorderWidth: 2,
        }]
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.raw}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: (Math.floor(maxInitiatives / 10) * 10) + 10,
                ticks: { stepSize: 20, color: '#094fa0', font: { family: 'Inter' } },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#094fa0', font: { family: 'Inter' } },
            }
        },
        elements: {
            line: { borderWidth: 3 },
            point: { hoverBorderColor: '#094fa1' }
        }
    };
      
    return (
        <div className="flex w-full justify-center items-center gap-4">
            { !trendData || Object.keys(trendData).length === 0 ? 
                <h1>No data found.</h1>
                :
                <div className="w-full flex flex-col gap-2">
                    <div className="text-xs flex gap-2 items-center justify-end text-Primary">
                        <div className="flex gap-1 items-center border-2 border-Primary rounded px-5 mr-5">
                            <h3>Show data from the last</h3>
                            <select
                                id="months-select"
                                value={monthsShown}
                                onChange={(e) => {setMonthsShown(Number(e.target.value))}}
                                className="p-2 focus:outline-none"
                            >
                                {monthOptions.map((value) => (
                                    <option key={value} value={value}>
                                        { value <= 1 ? `${value} month` : `${value} months`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <hr className="w-5 border-2 rounded-full"/><h3 className="text-[#87A2D9]">No. of Initiatives Started</h3>
                    </div>
                    <div className="w-full" style={{ height: '200px' }}>
                        <Line data={data} options={options} />
                    </div>
                </div>
            }
        </div>
    );
}


// ALUMNI EVENTS TREND LINE CHART
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);
export const EventsTrendLineChart: React.FC<{ eventsTrendData: any }> = ({ eventsTrendData }) => {
    const [monthsShown, setMonthsShown] = useState<number>(5);
    console.log("length: ", eventsTrendData.length);

    const isArray = Array.isArray(eventsTrendData);
    const monthsToShowData = isArray ? eventsTrendData.slice((monthsShown > eventsTrendData.length) ? 0 : (eventsTrendData.length - monthsShown), eventsTrendData.length) : [];

    const monthIndexes = isArray ? monthsToShowData.map((data:any) => data.month) : [];
    const monthLabels = monthIndexes ? monthIndexes.map((index: number) => getMonthFromIndex(index)) : null;
    const eventsPerMonth = eventsTrendData ? monthsToShowData.map((data:any) => data.total_posts) : null;

    const maxEvents = Math.max(...eventsPerMonth ?? []);
    const monthOptions = Array.from({ length: eventsTrendData.length }, (_, i) => i + 1);

    const data = {
        labels: monthLabels ?? [],
        datasets: [{
            label: "No. of Job Posts",
            data: eventsPerMonth ?? [],
            borderColor: '#094fa1',
            backgroundColor: '#094fa1',
            tension: 0.4,
            fill: false,
            pointBackgroundColor: '#094fa1',
            pointBorderColor: '#fff',
            pointHoverRadius: 6,
            pointRadius: 5,
            pointBorderWidth: 2,
        }]
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.raw}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: (Math.floor(maxEvents / 10) * 10) + 10,
                ticks: { stepSize: 20, color: '#094fa0', font: { family: 'Inter' } },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#094fa0', font: { family: 'Inter' } },
            }
        },
        elements: {
            line: { borderWidth: 3 },
            point: { hoverBorderColor: '#094fa1' }
        }
    };
      
    return (
        <div className="flex w-full justify-center items-center gap-4">
            { !eventsTrendData || Object.keys(eventsTrendData).length === 0 ? 
                <h1>No data found.</h1>
                :
                <div className="w-full flex flex-col gap-2">
                    <div className="text-xs flex gap-2 items-center justify-end text-Primary">
                        <div className="flex gap-1 items-center border-2 border-Primary rounded px-5 mr-5">
                            <h3>Show data from the last</h3>
                            <select
                                id="months-select"
                                value={monthsShown}
                                onChange={(e) => {setMonthsShown(Number(e.target.value))}}
                                className="p-2 focus:outline-none"
                            >
                                {monthOptions.map((value) => (
                                    <option key={value} value={value}>
                                        { value <= 1 ? `${value} month` : `${value} months`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <hr className="w-5 border-2 rounded-full"/><h3 className="text-[#87A2D9]">No. of Events Created</h3>
                    </div>
                    <div className="w-full" style={{ height: '150px' }}>
                        <Line data={data} options={options} />
                    </div>
                </div>
            }
        </div>
    );
}