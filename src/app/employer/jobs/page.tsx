"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { EmployerPageShell } from "@/components/employer/employer-page-shell";
import { JobStatusControls } from "@/components/employer/job-status-controls";
import { useMyJobs } from "@/hooks/use-employer-jobs";
import { STATUS_LABELS } from "@/lib/job-status";
import { formatJobType, formatSalary } from "@/lib/jobs";
import type { Job, JobStatus } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_VARIANT: Record<
  JobStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  DRAFT: "outline",
  PUBLISHED: "default",
  CLOSED: "secondary",
  ARCHIVED: "outline",
};

function JobRow({ job }: { job: Job }) {
  const salary = formatSalary(job);
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{job.title}</h3>
            <Badge variant={STATUS_VARIANT[job.status]}>
              {STATUS_LABELS[job.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatJobType(job.jobType)} · {job.location}
            {salary ? ` · ${salary}` : ""}
          </p>
          <div className="mt-3">
            <JobStatusControls job={job} />
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/employer/jobs/${job.id}/edit`} />}
        >
          Edit
        </Button>
      </CardContent>
    </Card>
  );
}

function EmployerJobsContent() {
  const { data, isLoading, isError, error } = useMyJobs();
  const jobs = data?.items ?? [];

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your listings</h1>
          <p className="text-muted-foreground">
            Create, publish, and manage your job listings.
          </p>
        </div>
        <Button render={<Link href="/employer/jobs/new" />}>
          <Plus className="size-4" aria-hidden />
          New listing
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Couldn't load your listings."}
        </p>
      ) : jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t created any listings yet.
          </p>
          <Button className="mt-4" render={<Link href="/employer/jobs/new" />}>
            Create your first listing
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </>
  );
}

export default function EmployerJobsPage() {
  return (
    <EmployerPageShell>
      <EmployerJobsContent />
    </EmployerPageShell>
  );
}
