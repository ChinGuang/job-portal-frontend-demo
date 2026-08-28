"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useJobs } from "@/hooks/use-jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCard } from "./job-card";
import { JobFilters, type JobFilterValues } from "./job-filters";
import { JobsPagination } from "./jobs-pagination";

function JobCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );
}

/**
 * Public job browsing. Filters and the current page live in the URL so results
 * are shareable and survive reloads; data is fetched client-side via React
 * Query, keeping the previous page visible while the next loads.
 */
export function JobsBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: JobFilterValues = {
    q: searchParams.get("q") ?? "",
    location: searchParams.get("location") ?? "",
    jobType: searchParams.get("jobType") ?? "",
  };
  const rawPage = Number(searchParams.get("page"));
  const page =
    Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

  const query = useJobs({ ...filters, page });

  const pushParams = useCallback(
    (next: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  const applyFilters = (next: JobFilterValues) => {
    // Any filter change resets to the first page.
    pushParams({ ...next, page: undefined });
  };

  const clearFilters = () => router.push(pathname);

  const goToPage = (nextPage: number) => pushParams({ page: nextPage });

  const jobs = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <JobFilters value={filters} onApply={applyFilters} onClear={clearFilters} />

      {query.isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-medium text-destructive">Couldn&apos;t load jobs</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query.error instanceof Error
              ? query.error.message
              : "Something went wrong."}
          </p>
        </div>
      ) : query.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="font-medium">No jobs found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {page > 1
              ? "This page is empty — there may be fewer results than expected."
              : "Try adjusting your search or filters."}
          </p>
          {page > 1 ? (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => goToPage(1)}
            >
              Back to first page
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy={query.isFetching}
          >
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <JobsPagination page={page} total={total} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
}
