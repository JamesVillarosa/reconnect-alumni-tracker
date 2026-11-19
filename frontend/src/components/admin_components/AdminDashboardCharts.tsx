import { Doughnut, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
  
// ALUMNI DISTRIBUTION DOUGHNUT CHART
ChartJS.register(ArcElement, Tooltip, Legend);
export const AlumniDistributionDoughnutChart: React.FC<{ distributionData: any }> = ({ distributionData }) => {

    const dataKeys = distributionData ? Object.keys(distributionData) : null;
    const locations = dataKeys ? dataKeys.map(key => key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()) : null; // turn to sentence case
    const alumniPerLocation = distributionData ? Object.values(distributionData) : null;
    const total = alumniPerLocation ? alumniPerLocation.reduce((sum: number, val: any) => sum + val, 0) : 0;

    // color generation
    const generateBlueShade = (): string => {
        const useLightShade = Math.random() > 0.5; // 50% chance

        const hue = 210; // blue hue
        const saturation = useLightShade
            ? Math.floor(Math.random() * 20) + 60   // 60–80%
            : Math.floor(Math.random() * 20) + 80;  // 80–100%
        const lightness = useLightShade
            ? Math.floor(Math.random() * 15) + 65   // 65–80%
            : Math.floor(Math.random() * 20) + 40;  // 40–60%

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };
    const dataColors = dataKeys ? dataKeys.map(() => generateBlueShade()) : null;

    const data = {
        labels: locations ?? [],
        datasets: [{
          label: "",
          data: alumniPerLocation ?? [],
          backgroundColor: dataColors ?? [],
          hoverOffset: 4
        }]
    };

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const value = context.raw;
                        const percent = ((value / total) * 100).toFixed(0);
                        return `${value} (${percent}%)`;
                    }
                },
                backgroundColor: '#003f88',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#ccc',
                borderWidth: 1,
                cornerRadius: 4,
                padding: 10
            },
            legend: {
                display: false // we'll create a custom one
            }
        }
    };
      
    return (
        <div className="flex w-full justify-center items-center gap-4">
            { !distributionData || Object.keys(distributionData).length === 0 ? 
                <h1>No data found.</h1>
                :
                <>
                    <div className="w-1/2 aspect-square">
                        <Doughnut data={data} options={options} />
                    </div>
                    <div className="w-1/2 aspect-square overflow-y-auto flex flex-col gap-2 text-sm">
                        {locations?.map((label, i) => (
                            <div key={label} className="flex items-center gap-2 text-Primary">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: data.datasets[0].backgroundColor[i] }}
                                />
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </>
            }
        </div>
    );
}

// ALUMNI JOB STATISTICS CHART
ChartJS.register(ArcElement, Tooltip, Legend);
export const AlumniJobStatisticsPieChart: React.FC<{ jobsData: any }> = ({ jobsData }) => {

    const isEmptyObject = (obj: any) => {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    };

    const jobs = !isEmptyObject(jobsData) ? Object.keys(jobsData) : null;
    // const locations = dataKeys.map(key => key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()); // turn to sentence case
    const alumniPerJob = !isEmptyObject(jobsData) ? Object.values(jobsData) : null;
    const total = alumniPerJob ? alumniPerJob.reduce((sum: number, val: any) => sum + val, 0) : 0;

    // color generation
    const generateBlueShade = (): string => {
        const useLightShade = Math.random() > 0.5; // 50% chance

        const hue = 210; // blue hue
        const saturation = useLightShade
            ? Math.floor(Math.random() * 20) + 60   // 60–80%
            : Math.floor(Math.random() * 20) + 80;  // 80–100%
        const lightness = useLightShade
            ? Math.floor(Math.random() * 15) + 65   // 65–80%
            : Math.floor(Math.random() * 20) + 40;  // 40–60%

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };
    const dataColors = jobs ? jobs.map(() => generateBlueShade()) : null;

    const data = {
        labels: jobs ?? [],
        datasets: [{
          label: "",
          data: alumniPerJob ?? [],
          backgroundColor: dataColors ?? [],
          hoverOffset: 4
        }]
    };

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const value = context.raw;
                        const percent = ((value / total) * 100).toFixed(0);
                        return `${value} (${percent}%)`;
                    }
                },
                backgroundColor: '#003f88',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#ccc',
                borderWidth: 0,
                cornerRadius: 4,
                padding: 10
            },
            legend: {
                display: false // we'll create a custom one
            }
        }
    };
      
    return (
        <div className="flex w-full justify-center items-center gap-4">
            { !jobsData || Object.keys(jobsData).length === 0 ? 
                <h1>No data found.</h1>
                :
                <>
                    <div className="w-1/2 aspect-square">
                        <Pie data={data} options={options} />
                    </div>
                    <div className="w-1/2 aspect-square overflow-y-auto flex flex-col gap-2 text-sm">
                        {jobs?.map((label, i) => (
                            <div key={label} className="flex items-center gap-2 text-Primary">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: data.datasets[0].backgroundColor[i] }}
                                />
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </>
            }
        </div>
    );
}