import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  itemsOnCurrentPage: number;
  onPageChange: (page: number) => void;
  itemName?: string;
  loading?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  itemsOnCurrentPage,
  onPageChange,
  itemName = "products",
  loading = false,
  className = ""
}: PaginationProps) {
  // Don't show pagination if no items or only one page
  if (totalItems === 0 || totalPages <= 1) {
    return totalItems === 0 ? (
      <p className="text-sm text-muted-foreground">
        No {itemName} found
      </p>
    ) : null;
  }

  const canGoPrevious = currentPage > 1 && !loading;
  const canGoNext = currentPage < totalPages && !loading;
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsOnCurrentPage - 1, totalItems);

  return (
    <div className={`flex justify-between items-center ${className}`}>
      {/* Info section */}
      <p className="text-sm text-muted-foreground">
        Showing {startItem}-{endItem} of {totalItems} {itemName}
        {currentPage > 1 && ` (Page ${currentPage})`}
      </p>
      
      {/* Navigation controls */}
      <div className="flex gap-2 items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <span className="text-sm px-3 py-1 bg-muted rounded-md">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}