import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, RefreshCw, Loader2 } from "lucide-react";
import PropTypes from "prop-types";

/**
 * @typedef {Object} SearchAndFiltersProps
 * @property {string} search - Search query
 * @property {(value: string) => void} onSearchChange - Function to handle search change
 * @property {string} sortBy - Current sort value
 * @property {(value: string) => void} onSortChange - Function to handle sort change
 * @property {string} statusFilter - Current status filter
 * @property {(value: string) => void} onStatusFilterChange - Function to handle status filter change
 * @property {() => void} onRefresh - Function to handle refresh
 * @property {boolean} loading - Whether data is loading
 * @property {number} filteredCount - Number of filtered articles
 * @property {number} totalCount - Total number of articles
 */

const sortOptions = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "views_desc", label: "Most Views" },
  { value: "views_asc", label: "Least Views" },
];

/**
 * Main component for search and filters
 * @param {SearchAndFiltersProps} props
 */
export default function SearchAndFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  loading,
  filteredCount,
  totalCount,
}) {
  return (
    <>
      {/* Filters Section */}
      <FiltersSection
        sortBy={sortBy}
        onSortChange={onSortChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        onRefresh={onRefresh}
        loading={loading}
      />

      {/* Search Bar */}
      <SearchBar
        search={search}
        onSearchChange={onSearchChange}
        filteredCount={filteredCount}
        totalCount={totalCount}
      />
    </>
  );
}

const FiltersSection = ({
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  loading,
}) => (
  <div className="flex items-center gap-2 flex-wrap">
    <SortDropdown sortBy={sortBy} onSortChange={onSortChange} />
    <StatusTabs
      statusFilter={statusFilter}
      onStatusFilterChange={onStatusFilterChange}
    />
    <RefreshButton onRefresh={onRefresh} loading={loading} />
  </div>
);

const SortDropdown = ({ sortBy, onSortChange }) => (
  <Select value={sortBy} onValueChange={onSortChange}>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Sort by" />
    </SelectTrigger>
    <SelectContent>
      {sortOptions.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const StatusTabs = ({ statusFilter, onStatusFilterChange }) => (
  <Tabs value={statusFilter} onValueChange={onStatusFilterChange}>
    <TabsList>
      <TabsTrigger value="all" className="text-xs">
        All
      </TabsTrigger>
      <TabsTrigger value="published" className="text-xs">
        Published
      </TabsTrigger>
      <TabsTrigger value="draft" className="text-xs">
        Drafts
      </TabsTrigger>
    </TabsList>
  </Tabs>
);

const RefreshButton = ({ onRefresh, loading }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onRefresh}
    disabled={loading}
    className="gap-2"
  >
    {loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <RefreshCw className="h-4 w-4" />
    )}
    Refresh
  </Button>
);

const SearchBar = ({ search, onSearchChange, filteredCount, totalCount }) => (
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div className="relative w-full md:max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search articles by title or author..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
    <SearchStats filteredCount={filteredCount} totalCount={totalCount} />
  </div>
);

const SearchStats = ({ filteredCount, totalCount }) => (
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <Filter className="h-4 w-4" />
    <span>
      {filteredCount} of {totalCount} articles
    </span>
  </div>
);

SearchAndFilters.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  filteredCount: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
};

// Export sub-components for flexible usage
SearchAndFilters.FiltersSection = FiltersSection;
SearchAndFilters.SearchBar = SearchBar;
