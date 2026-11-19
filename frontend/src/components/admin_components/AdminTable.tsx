import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Pencil, Eye } from "lucide-react";
import Checkbox from '../Checkbox';
import { usePagination } from '../../context/PaginationContext';

type TableColumn = {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
};

type AdminTableProps<T> = {
    tableHead: TableColumn[];
    data: T[];
    type?: string;
    canEdit?: boolean;
    onEdit: (item: T) => void;
    canDelete?: boolean;
    onDelete: (item: T) => void;
    canView?: boolean;
    onView: (item: T) => void;
    itemsPerPage?: number;
    renderRow: (item: T) => React.ReactNode;
    selectedItems: string[];
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>;
    defaultSortColumn?: string;
};

const AdminTable = <T extends { _id: string; status?: string }>({
    tableHead,
    data,
    type = '',
    canEdit = true,
    onEdit,
    canDelete = true,
    onDelete,
    canView = true,
    onView,
    itemsPerPage = 7,
    renderRow,
    selectedItems,
    setSelectedItems,
    defaultSortColumn = '',
}: AdminTableProps<T>) => {
    // pagination state between certain pages in admin (ex. jobs page, job details page, job form)
    const { adminPageNumber, setAdminPageNumber } = usePagination();

    // pagination state
    const [currentPage, setCurrentPage] = useState(adminPageNumber);
    const [customPage, setCustomPage] = useState<string>('');
    const [showCustomPageInput, setShowCustomPageInput] = useState(false);

    // sorting state
    const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // filter state
    const [filters] = useState<Record<string, any>>({});

    // sorting handler
    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // data handler
    const processedData = useMemo(() => {
        return [...data]
            .filter(item => {
                return Object.entries(filters).every(([key, value]) => {
                    if (!value) return true;
                    return String(item[key as keyof T]).toLowerCase().includes(String(value).toLowerCase());
                });
            })
            .sort((a, b) => {
                if (!sortColumn) return 0;
                
                const key = sortColumn as keyof T;
                let valueA: any = a[key];
                let valueB: any = b[key];

                // handles date sorting
                if (key === "date_posted" || key === "created_at" || key === "updated_at") {
                    const dateA = valueA ? new Date(valueA) : new Date(0);
                    const dateB = valueB ? new Date(valueB) : new Date(0);
                    valueA = dateA.getTime();
                    valueB = dateB.getTime();
                }

                // handles string sensitivity
                if (typeof valueA === "string") valueA = valueA.toLowerCase();
                if (typeof valueB === "string") valueB = valueB.toLowerCase();

                // handle null/undefined values
                if (valueA == null) valueA = "";
                if (valueB == null) valueB = "";

                // performs actual comparison
                if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
                if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
                return 0;
            });
        }, [data, filters, sortColumn, sortDirection]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);

    // pagination handlers
    const handleCustomPageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value === '') {
            setCustomPage('');
            return;
        }
        const numValue = Math.max(1, Math.min(parseInt(value, 10), totalPages));
        setCustomPage(numValue.toString());
    };

    const goToCustomPage = () => {
        const pageNumber = parseInt(customPage, 10);
        if (!isNaN(pageNumber)) {
            handlePageChange(pageNumber);
        }
        setCustomPage('');
        setShowCustomPageInput(false);
    };

        const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setAdminPageNumber(page);
        }
    };

    const getPaginationNumbers = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [];
        if (currentPage <= 3) {
            pages.push(1, 2, 3, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        
        return pages;
    };

    const paginatedData = processedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // job selection / checkbox toggle
    const toggleItemSelection = (id: string) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id) 
            ? prevSelected.filter((itemId) => itemId !== id)
            : [...prevSelected, id]
        );
    };

    const selectAllRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectAllRef.current) {
            selectAllRef.current.indeterminate = selectedItems.length > 0 && selectedItems.length <= data.length;
        }
    }, [selectedItems, data]);

    // console.log(selectedItems);
    // console.log(currentPage, totalPages);

    return (
        <div className="flex flex-col justify-between h-full min-h-[525px] mt-5 w-full text-Primary bg-white rounded-xl border-1 border-MidBlue overflow-hidden">
            <div className='flex flex-col overflow-x-auto overflow-y-hidden'>
                <table className="table">
                    <thead>
                        <tr className='bg-MidBlue text-base'>
                            <th className='min-w-[40px] w-[3%]'>
                                <input
                                    type='checkbox'
                                    ref={selectAllRef}
                                    checked={selectedItems.length === data.length && data.length > 0}
                                    onChange={() => setSelectedItems(selectedItems.length === data.length ? [] : data.map(item => item._id))}
                                    className='w-4 h-4 border-2 rounded-2xl border-Primary accent-Primary cursor-pointer'
                                />
                            </th>
                            {tableHead.map(({ key, label, sortable = true, width }) => (
                                <th key={key} className={`text-left px-4 py-2 text-sm ${width ? `w-${width}` : ''}`}>
                                    <div className="flex items-center gap-1">
                                        <span className={`${sortColumn === key ? 'font-extrabold' :'font-semibold'}`}>{label.toUpperCase()}</span>
                                        {sortable && (
                                            <button 
                                                onClick={() => handleSort(key)} 
                                                className='focus:outline-none cursor-pointer'
                                            >
                                                {sortColumn === key ? (
                                                    sortDirection === "asc" ? (
                                                        <ChevronUp size={14} strokeWidth={5} />
                                                    ) : (
                                                        <ChevronDown size={14} strokeWidth={5}/>
                                                    )
                                                ) : (
                                                    <ChevronDown size={14} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}
                            <th className="w-32 text-sm font-semibold">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map(item => (
                                <tr key={item._id} onClick={() => onView(item)} className="bg-white border-b-1 min-h-[10px] h-15 border-[#A8C8E8] text-base">
                                    <td>
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                label=""
                                                checked={selectedItems.includes(item._id)  && data.length > 0}
                                                onChange={() => toggleItemSelection(item._id)}
                                            />
                                        </div>
                                    </td>
                                    {renderRow(item)}
                                    <td className="flex items-center gap-2">
                                        { canEdit && 
                                            <Pencil 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // so it overrides the onClick of the whole row
                                                    onEdit(item);
                                                }}
                                                className="text-AdminIconColor cursor-pointer hover:bg-primary hover:text-Tertiary p-1 rounded-lg"
                                                size={30}
                                            />
                                        }
                                        { canDelete && 
                                            <Trash2
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(item);
                                                }}
                                                className="text-AdminIconColor cursor-pointer hover:bg-red-700 hover:text-Tertiary p-1 rounded-lg"
                                                size={30}
                                            />
                                        }
                                        { canView && 
                                            <Eye 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onView(item);
                                                }}
                                                className="text-AdminIconColor cursor-pointer hover:bg-blue-500 hover:text-Tertiary p-1 rounded-lg"
                                                size={30}
                                            />
                                        }
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={tableHead.length + 2} className="text-center py-4">
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Display Count */}
            <div className='flex flex-col gap-4 md:flex-row sm:justify-between bg-white items-center px-5 py-2 text-xs text-DarkBlue'>
                <div className='flex flex-row gap-4'>
                    <div>
                    Showing {Math.min((currentPage - 1) * 7 + 1, processedData.length)} - {Math.min(currentPage*7, processedData.length)} {type} out of {processedData.length}
                    </div>
                    <div className='flex flex-row gap-1 text-Primary opacity-75 font-semibold'>
                        {selectedItems.length} out of {processedData.length} selected.
                        {selectedItems.length > 0 && (
                            <button 
                                className='text-red-700 underline cursor-pointer'
                                onClick={async () => {
                                    for (const id of selectedItems) {
                                        // await onDelete(id);
                                    }
                                    setSelectedItems([]);
                                }}
                            >
                                Delete all?
                            </button>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                <div className='flex flex-col gap-4 md:flex-row join text-Primary gap-1 text-sm'>
                    {showCustomPageInput && (
                        <div className="flex justify-center items-center gap-2">
                            <input 
                                type="number"
                                className='input input-bordered text-center w-20 h-10 text-sm font-medium rounded-2xl border-2 border-Primary no-spinner'
                                value={customPage}
                                onChange={handleCustomPageInput}
                                onKeyDown={(e) => {
                                    if (["e", "E", "-", "+"].includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                placeholder='Page'
                                min="1"
                                max={totalPages}
                            />
                            <button 
                                className='btn btn-ghost border-Primary text-Primary rounded-2xl hover:bg-Primary hover:text-Tertiary' 
                                onClick={goToCustomPage}
                            >
                                Go
                            </button>
                        </div>
                    )}
                    <button 
                        className='join-item btn btn-ghost rounded-xl bg-LightBlue font-semibold hover:bg-Primary hover:text-Tertiary'
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    <div className='flex flex-row gap-1'>
                        {getPaginationNumbers().map((page, index) => (
                            page === "..." ? (
                                <button 
                                    key={index} 
                                    className='join-item btn btn-ghost rounded-xl bg-LightBlue font-semibold hover:bg-Primary hover:text-Tertiary' 
                                    onClick={() => setShowCustomPageInput(true)}
                                >
                                    ...
                                </button>
                            ) : (
                                <button 
                                    key={index} 
                                    className={`join-item btn btn-ghost rounded-xl hover:bg-Tertiary hover:text-Primary ${
                                        page === currentPage ? "bg-Primary text-Tertiary" : "text-DarkBlue font-medium"
                                    }`} 
                                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            )
                        ))}
                    </div>
                    <button 
                        className='join-item btn btn-ghost rounded-xl bg-LightBlue font-semibold hover:bg-Primary hover:text-Tertiary'
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTable;