import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from 'prop-types';

/**
 * @typedef {Object} PaginationData
 * @property {number} current - Current page number
 * @property {number} count - Total number of items
 * @property {number} pageSize - Items per page
 * @property {string|null} next - Next page URL
 * @property {string|null} previous - Previous page URL
 */

/**
 * @typedef {Object} EnhancedPaginationProps
 * @property {PaginationData} pagination - Pagination data
 * @property {(page: number) => void} onPageChange - Function to handle page change
 * @property {boolean} loading - Whether data is loading
 * @property {boolean} [show] - Whether to show the pagination
 */

/**
 * Enhanced pagination component with page numbers
 * @param {EnhancedPaginationProps} props
 */
export default function EnhancedPagination({ 
  pagination, 
  onPageChange, 
  loading, 
  show = true 
}) {
  const totalPages = Math.ceil(pagination.count / pagination.pageSize);

  if (!show || totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, pagination.current - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
      <PaginationInfo pagination={pagination} />
      <PaginationControls
        pagination={pagination}
        totalPages={totalPages}
        onPageChange={onPageChange}
        loading={loading}
        generatePageNumbers={generatePageNumbers}
      />
    </div>
  );
}

const PaginationInfo = ({ pagination }) => (
  <div className="text-sm text-gray-600">
    Showing{" "}
    <span className="font-semibold text-gray-900">
      {(pagination.current - 1) * pagination.pageSize + 1}-
      {Math.min(pagination.current * pagination.pageSize, pagination.count)}
    </span>{" "}
    of{" "}
    <span className="font-semibold text-gray-900">{pagination.count}</span>{" "}
    articles
  </div>
);

const PaginationControls = ({ 
  pagination, 
  totalPages, 
  onPageChange, 
  loading, 
  generatePageNumbers 
}) => (
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(pagination.current - 1)}
      disabled={!pagination.previous || loading}
      className="gap-2 h-9 w-9 p-0 sm:w-auto sm:px-3"
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Previous</span>
    </Button>

    <PageNumbers 
      pages={generatePageNumbers()} 
      currentPage={pagination.current} 
      onPageChange={onPageChange} 
      loading={loading} 
    />

    <Button
      variant="outline"
      size="sm"
      onClick={() => onPageChange(pagination.current + 1)}
      disabled={!pagination.next || loading}
      className="gap-2 h-9 w-9 p-0 sm:w-auto sm:px-3"
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
);

const PageNumbers = ({ pages, currentPage, onPageChange, loading }) => (
  <div className="flex items-center gap-1">
    {pages.map((pageNum) => (
      <Button
        key={pageNum}
        variant={currentPage === pageNum ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(pageNum)}
        disabled={loading}
        className="h-9 w-9 p-0 font-medium"
      >
        {pageNum}
      </Button>
    ))}
  </div>
);

EnhancedPagination.propTypes = {
  pagination: PropTypes.shape({
    current: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    next: PropTypes.string,
    previous: PropTypes.string,
  }).isRequired,
  onPageChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  show: PropTypes.bool,
};

EnhancedPagination.defaultProps = {
  show: true,
};