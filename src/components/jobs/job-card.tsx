import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatJobType, formatSalary } from "@/lib/jobs";
import type { Job } from "@/types/job";

/** Compact listing card used in the browse grid. */
export function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job);

  return (
    <Link href={`/jobs/${job.id}`} className="group block">
      <Card className="h-full transition-colors group-hover:border-foreground/30">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold leading-tight group-hover:underline">
              {job.title}
            </h3>
            <Badge variant="secondary" className="shrink-0">
              {formatJobType(job.jobType)}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {job.employer?.companyName ? (
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3.5" aria-hidden />
                {job.employer.companyName}
              </span>
            ) : null}
            {job.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {job.location}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {job.description}
          </p>
          {salary ? <p className="text-sm font-medium">{salary}</p> : null}
        </CardContent>
      </Card>
    </Link>
  );
}
