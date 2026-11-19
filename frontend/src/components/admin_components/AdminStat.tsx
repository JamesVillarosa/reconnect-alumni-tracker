import React from "react";

type SubStat = {
    label: React.ReactNode | string;
    value: string | number;
    statChange?: string;
    statChangeType?: "increase" | "decrease";
};

type StatGroup = {
    title: string;
    stats: SubStat[];
};

type StatsOverviewProps = {
    groups: StatGroup[];
};


  

const StatsOverview: React.FC<StatsOverviewProps> = ({ groups }) => {
    return (
            <div className="flex flex-row justify-center gap-2 w-full px-15 pt-5">
                {groups.map((group, index) => (
                <div
                    key={index}
                    className="flex flex-row justify-end w-full p-2"
                >
                    <div className="rounded-xl border border-MidBlue border-2 bg-white p-4 relative h-full w-4/5">
                        <div className="flex flex-row justify-between px-2">
                            <h3 className="text-xl font-semibold text-Primary">
                                {group.title}
                            </h3>

                            <div className="text-Primary text-xl leading-none m-0 cursor-pointer">
                                &hellip;
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center h-full gap-8 max-h-6/7">
                            {group.stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="flex items-center justify-center gap-1 text-Primary text-lg">
                                    {stat.label}
                                </div>
                                <div className="text-4xl font-bold text-Primary">
                                    {stat.value}
                                </div>
                                <div
                                    className={`text-sm mt-1 ${
                                        stat.statChangeType === "increase"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                >
                                    {stat.statChange}
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>
                ))}
                
            </div>
    );
};  

export default StatsOverview;
