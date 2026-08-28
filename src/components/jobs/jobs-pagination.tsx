"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOBS_PAGE_SIZE, totalPages } from "@/lib/jobs";

interface JobsPaginationProps {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}

/** Prev/next pager showing the current range against the total result count. */
export function JobsPagination({ page, total, onPageChange }: JobsPaginationProps) {
  const pages = totalPages(total);
  const first = total === 0 ? 0 : (page - 1) * JOBS_PAGE_SIZE + 1;
  const last = Math.min(page * JOBS_PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "No results"
          : `Showing ${first}–${last} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
