"use client";

import { useUpdateApplicantStatus } from "@/hooks/use-applicant-review";
import {
  applicantStatusActions,
  type ReviewApplication,
} from "@/lib/applicant-review";
import { APPLICATION_STATUS_META, formatAppliedDate } from "@/lib/applications";
import { describeStatusChangeError } from "@/lib/api-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResumeButton } from "./resume-button";

export function ApplicantCard({
  application,
  jobId,
}: {
  application: ReviewApplication;
  jobId: string;
}) {
  const changeStatus = useUpdateApplicantStatus(jobId);
  const profile = application.jobSeekerProfile;
  const meta = APPLICATION_STATUS_META[application.status];
  const actions = applicantStatusActions(application.status);
  const date = formatAppliedDate(application.createdAt);

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{profile.name}</h3>
              <Badge variant={meta.variant}>{meta.label}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {profile.headline ? `${profile.headline} · ` : ""}
              {profile.yearsOfExperience != null
                ? `${profile.yearsOfExperience} yrs · `
                : ""}
              {date ? `Applied ${date}` : ""}
            </p>
          </div>
          <ResumeButton applicationId={application.id} />
        </div>

        {profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill, index) => (
              <Badge
                key={`${skill}-${index}`}
                variant="outline"
                className="font-normal"
              >
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}

        {profile.bio ? (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        ) : null}

        <div>
          <p className="text-sm font-medium">Cover letter</p>
          {application.coverLetter ? (
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {application.coverLetter}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              No cover letter included.
            </p>
          )}
        </div>

        {actions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-t pt-3">
            {actions.map((action) => (
              <Button
                key={action.to}
                size="sm"
                variant={action.to === "REJECTED" ? "outline" : "default"}
                disabled={changeStatus.isPending}
                onClick={() =>
                  changeStatus.mutate({ id: application.id, status: action.to })
                }
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}

        {changeStatus.isError ? (
          <p className="text-sm text-destructive">
            {describeStatusChangeError(changeStatus.error)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
