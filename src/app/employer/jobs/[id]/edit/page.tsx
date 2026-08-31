"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { EmployerPageShell } from "@/components/employer/employer-page-shell";
import { JobForm } from "@/components/employer/job-form";
import { JobStatusControls } from "@/components/employer/job-status-controls";
import { useMyJobs } from "@/hooks/use-employer-jobs";
import { STATUS_LABELS } from "@/lib/job-status";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function EditJobBody() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useMyJobs();
  const job = data?.items.find((item) => item.id === params.id) ?? null;

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError)
    return <p className="text-sm text-destructive">Couldn&apos;t load this listing.</p>;
  if (!job) return <p className="text-sm text-muted-foreground">Listing not found.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit listing</CardTitle>
          <CardDescription>Status: {STATUS_LABELS[job.status]}</CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm job={job} onSaved={() => router.push("/employer/jobs")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status &amp; visibility</CardTitle>
          <CardDescription>
            Publish, close, reopen, or archive this listing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <JobStatusControls job={job} />
          <Button
            variant="outline"
            render={<Link href={`/employer/jobs/${job.id}/applicants`} />}
          >
            View applicants
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EditJobPage() {
  return (
    <EmployerPageShell
      maxWidth="max-w-2xl"
      backHref="/employer/jobs"
      backLabel="Back to listings"
    >
      <EditJobBody />
    </EmployerPageShell>
  );
}
