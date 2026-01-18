import React from 'react';
// Icons are inline SVGs now as per user request, so we don't strictly need react-icons imports for chevron
// But we keep the logic clean.

const Pagination = ({
    currentPage,
    totalPage,
    onPageChange,
    loading,
    totalElements,
    pageSize
}) => {
    // Hide if single page AND no explicit totalElements to show 
    // (Or user might want to always show it? Standard is to hide if page <= 1)
    // But user's template shows "Showing 1 to 10 of 97".
    // If totalPage <= 1, usually we still show the "Showing..." part but disable buttons.
    // Let's hide only if there's no data.
    if (!totalElements && totalPage <= 1) return null;
    if (totalElements === 0) return null;

    // Logic to generate page numbers to show
    const getPageNumbers = () => {
        const delta = 2; // Number of adjacent pages to show
        const range = [];
        const rangeWithDots = [];

        range.push(1);
        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
            if (i > 1 && i < totalPage) {
                range.push(i);
            }
        }
        if (totalPage > 1) {
            range.push(totalPage);
        }

        let l;
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();

    // Calculate showing text logic
    const startItem = (currentPage - 1) * pageSize + 1;
    let endItem = currentPage * pageSize;
    if (totalElements && endItem > totalElements) {
        endItem = totalElements;
    }

    // Safety check if totalElements is missing but needed for text
    const displayTotal = totalElements || 0;
    const displayEnd = endItem || 0;
    const displayStart = startItem || 0;

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 w-full">
            {/* Mobile View */}
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                    className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage === 1 || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(Math.min(totalPage, currentPage + 1))}
                    disabled={currentPage === totalPage || loading}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage === totalPage || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Next
                </button>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{displayStart}</span> to <span className="font-medium">{displayEnd}</span> of{' '}
                        <span className="font-medium">{displayTotal}</span> results
                    </p>
                </div>
                <div>
                    <nav aria-label="Pagination" className="isolate inline-flex -space-x-px rounded-md shadow-xs">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || loading}
                            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="sr-only">Previous</span>
                            <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5">
                                <path d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" fillRule="evenodd" />
                            </svg>
                        </button>

                        {pageNumbers.map((num, index) => {
                            if (num === '...') {
                                return (
                                    <span key={`dots-${index}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 inset-ring inset-ring-gray-300 focus:outline-offset-0">
                                        ...
                                    </span>
                                );
                            }

                            const isActive = currentPage === num;
                            return (
                                <button
                                    key={num}
                                    onClick={() => onPageChange(num)}
                                    disabled={loading}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${isActive
                                            ? 'bg-indigo-600 text-white focus-visible:outline-indigo-600'
                                            : 'text-gray-900 inset-ring inset-ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                        }`}
                                >
                                    {num}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange(Math.min(totalPage, currentPage + 1))}
                            disabled={currentPage === totalPage || loading}
                            className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPage || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="sr-only">Next</span>
                            <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="size-5">
                                <path d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" fillRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
