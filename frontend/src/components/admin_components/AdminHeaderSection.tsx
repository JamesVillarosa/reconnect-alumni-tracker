import { useEffect, useRef, useState } from 'react';
import { Search, Funnel, Download } from 'lucide-react';
import { handleExport } from './Exports';

interface ListHeaderProps<T> {
    title: string;
    totalCount?: number;
    data: T[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onApplyFilters?: (filters: any) => void;
    createType?: string;
    onCreate?: () => void;
    FilterModalComponent?: React.ComponentType<{ id: string; data: T[]; onApplyFilters: (filters: any) => void }>;
    disabled?: boolean;
}

const ListHeader = <T extends { _id: string; status?: string }> ({
    title,
    totalCount,
    data,
    searchQuery,
    onSearchChange,
    onApplyFilters,
    createType = "Event",
    onCreate,
    FilterModalComponent,
    disabled = false
}: ListHeaderProps<T>) => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleExportClick = (type: 'csv' | 'json' | 'txt') => {
        handleExport(data, type);
        setTimeout(() => setIsDropdownVisible(false), 100);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownVisible(false);
        }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col sm:flex-row items-center sm:justify-between w-full sm:h-10 gap-2 sm:gap-0">
            <div className="flex gap-5 items-center">
            <h1 className="text-Primary text-3xl font-bold">{title}</h1>
            {typeof totalCount === 'number' && (
                <h1 className="text-[#78A9E4] text-sm font-medium">{totalCount}</h1>
            )}
            </div>

            <div className="flex flex-row justify-center sm:justify-end gap-2 sm:gap-4 w-1/2 items-center">
            <label className="input rounded-xl border border-[#82A9D0] text-[#82A9D0]">
                <Search />
                <input
                type="search"
                className="min-w-[100px] placeholder-[#82A9D0]"
                placeholder="Search Keyword"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                disabled={disabled}
                />
            </label>

            <button
                className="btn btn-ghost text-Primary bg-MidBlue hover:bg-primary hover:text-Tertiary p-1 rounded-lg min-h-[35px] aspect-square"
                onClick={() => (document.getElementById('filter-modal') as HTMLDialogElement)?.showModal()}
                disabled={disabled}
            >
                <Funnel size={18} />
            </button>

            {FilterModalComponent && onApplyFilters && (
                <FilterModalComponent
                    id="filter-modal"
                    data={data}
                    onApplyFilters={onApplyFilters}
                />
            )}

            <div ref={dropdownRef} className="relative text-center text-Primary">
                <button
                className="btn btn-ghost text-Primary bg-MidBlue hover:bg-primary hover:text-Tertiary p-1 rounded-lg min-h-[35px] aspect-square"
                onClick={() => setIsDropdownVisible((prev) => !prev)}
                disabled={disabled}
                >
                <Download size={18} />
                </button>

                {isDropdownVisible && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 flex bg-white shadow-lg rounded-lg border m-1 z-50">
                    {['csv', 'json', 'txt'].map((format) => (
                    <button
                        key={format}
                        onClick={() => handleExportClick(format as 'csv' | 'json' | 'txt')}
                        className="px-4 py-1 text-sm hover:bg-primary hover:text-Tertiary hover:rounded-sm"
                    >
                        {format.toUpperCase()}
                    </button>
                    ))}
                </div>
                )}
            </div>

            {onCreate && (
                <button
                onClick={onCreate}
                className="btn btn-ghost bg-Primary text-white min-w-[120px] p-1 rounded-xl hover:bg-Tertiary hover:text-Primary min-h-[35px]"
                >
                + Create {createType}
                </button>
            )}
            </div>
        </div>
        );
};

export default ListHeader;
