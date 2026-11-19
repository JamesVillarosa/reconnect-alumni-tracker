type Tab = {
    id: string;
    label: string;
};

type SwitchTabsProps = {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
};

const SwitchTabs = ({ tabs, activeTab, onTabChange }: SwitchTabsProps) => {
    return (
        <div className="flex flex-row justify-center border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    type="button"
                    key={tab.id}
                    className={`px-4 py-2 font-medium text-sm focus:outline-none m-2 ${
                        activeTab === tab.id
                            ? "text-white bg-Primary rounded-2xl"
                            : "text-Primary hover:bg-Tertiary rounded-2xl"
                    }`}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default SwitchTabs;