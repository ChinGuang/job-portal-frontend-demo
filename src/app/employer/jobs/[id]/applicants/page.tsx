"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { EmployerPageShell } from "@/components/employer/employer-page-shell";
import { ApplicantCard } from "@/components/employer/applicant-card";
import { useJobApplicants } from "@/hooks/use-applicant-review";
import { useMyJobs } from "@/hooks/use-employer-jobs";
import {
  APPLICATION_STATUS_META,
  type ApplicationStatus,
} from "@/lib/applications";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const FILTERS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SUBMITTED", label: APPLICATION_STATUS_META.SUBMITTED.label },
  { value: "REVIEWED", label: APPLICATION_STATUS_META.REVIEWED.label },
  { value: "OFFERED", label: APPLICATION_STATUS_META.OFFERED.label },
  { value: "REJECTED", label: APPLICATION_STATUS_META.REJECTED.label },
];

function ApplicantsBody() {
  const params = useParams<{ id: string }>();
  const jobId = params.id;
  const [filter, setFilter] = useState<ApplicationStatus | "ALL">("ALL");

  const jobs = useMyJobs();
  const job = jobs.data?.items.find((item) => item.id === jobId) ?? null;

  const status = filter === "ALL" ? undefined : filter;
  const { data, isLoading, isError, error } = useJobApplicants(jobId, status);
  const applicants = data?.items ?? [];

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Applicants</h1>
        <p className="text-muted-foreground">
          {job ? job.title : "Review and advance applicants for this listing."}
        </p>
      </header>

      <div
        role="group"
        aria-label="Filter by status"
        className="mb-6 flex flex-wrap gap-2"
      >
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filter === option.value
                ? "border-foreground bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Couldn't load applicants."}
        </p>
      ) : applicants.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            {filter === "ALL"
              ? "No one has applied to this listing yet."
              : "No applicants with this status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {applicants.map((application) => (
            <ApplicantCard
              key={application.id}
              application={application}
              jobId={jobId}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function JobApplicantsPage() {
  return (
    <EmployerPageShell
      maxWidth="max-w-3xl"
      backHref="/employer/jobs"
      backLabel="Back to listings"
    >
      <ApplicantsBody />
    </EmployerPageShell>
  );
}
