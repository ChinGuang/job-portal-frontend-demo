"use client";

import Link from "next/link";
import { SeekerPageShell } from "@/components/seeker/seeker-page-shell";
import { EmptyState, ErrorState } from "@/components/common/states";
import { useMyApplications } from "@/hooks/use-applications";
import { useJob } from "@/hooks/use-jobs";
import {
  APPLICATION_STATUS_META,
  formatAppliedDate,
  type Application,
} from "@/lib/applications";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ApplicationRow({ application }: { application: Application }) {
  // The list DTO has no job, so enrich from the (cached) public job query.
  const { data: job } = useJob(application.jobId);
  const meta = APPLICATION_STATUS_META[application.status];
  const date = formatAppliedDate(application.createdAt);

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">
              {job?.title ?? "Job listing"}
            </h3>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {job?.employer?.companyName ? `${job.employer.companyName} · ` : ""}
            {date ? `Applied ${date}` : ""}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/seeker/applications/${application.id}`} />}
        >
          View
        </Button>
      </CardContent>
    </Card>
  );
}

function ApplicationsContent() {
  const { data, isLoading, isError, error } = useMyApplications();
  const applications = data?.items ?? [];

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your applications</h1>
        <p className="text-muted-foreground">
          Track the status of every job you&apos;ve applied to.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Couldn't load your applications"
          message={error instanceof Error ? error.message : undefined}
        />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="When you apply to a job, it'll show up here."
          action={
            <Button render={<Link href="/" />}>Browse jobs</Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <ApplicationRow key={application.id} application={application} />
          ))}
        </div>
      )}
    </>
  );
}

export default function SeekerApplicationsPage() {
  return (
    <SeekerPageShell>
      <ApplicationsContent />
    </SeekerPageShell>
  );
}
