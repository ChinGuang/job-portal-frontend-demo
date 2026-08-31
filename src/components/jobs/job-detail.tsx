"use client";

import Link from "next/link";
import { Building2, Check, Globe, MapPin } from "lucide-react";
import { useJob } from "@/hooks/use-jobs";
import { ApiError } from "@/lib/api-error";
import { formatJobType, formatSalary, toExternalUrl } from "@/lib/jobs";
import { ApplyPanel } from "@/components/jobs/apply-panel";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobDetail({ id }: { id: string }) {
  const { data: job, isLoading, isError, error } = useJob(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !job) {
    const notFound = error instanceof ApiError && error.status === 404;
    const backToJobs = (
      <Button variant="outline" render={<Link href="/" />}>
        Back to jobs
      </Button>
    );
    return notFound ? (
      <EmptyState
        title="Job not found"
        description="This listing may have been closed or removed."
        action={backToJobs}
      />
    ) : (
      <ErrorState
        title="Couldn't load this job"
        message={error instanceof Error ? error.message : undefined}
        action={backToJobs}
      />
    );
  }

  const salary = formatSalary(job);
  const isClosed = job.status === "CLOSED";
  const employer = job.employer;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{formatJobType(job.jobType)}</Badge>
            {isClosed ? <Badge variant="outline">Closed</Badge> : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {employer?.companyName ? (
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-4" aria-hidden />
                {employer.companyName}
              </span>
            ) : null}
            {job.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-4" aria-hidden />
                {job.location}
              </span>
            ) : null}
            {salary ? <span className="font-medium text-foreground">{salary}</span> : null}
          </div>
        </div>

        {isClosed ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
            This role is no longer accepting applications.
          </div>
        ) : null}

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </p>
        </section>

        {job.requirements.length > 0 ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Requirements</h2>
            <ul className="space-y-1.5">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                  <span>{requirement}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <aside className="space-y-4">
        <ApplyPanel job={job} />

        {employer ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About the company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{employer.companyName}</p>
              {employer.industry ? (
                <p className="text-muted-foreground">{employer.industry}</p>
              ) : null}
              {employer.companySize ? (
                <p className="text-muted-foreground">{employer.companySize}</p>
              ) : null}
              {employer.description ? (
                <p className="text-muted-foreground">{employer.description}</p>
              ) : null}
              {employer.websiteUrl ? (
                <a
                  href={toExternalUrl(employer.websiteUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
                >
                  <Globe className="size-3.5" aria-hidden />
                  Visit website
                </a>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </aside>
    </div>
  );
}
