"use client";

import { useRouter } from "next/navigation";
import { EmployerPageShell } from "@/components/employer/employer-page-shell";
import { JobForm } from "@/components/employer/job-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewJobPage() {
  const router = useRouter();
  return (
    <EmployerPageShell
      maxWidth="max-w-2xl"
      backHref="/employer/jobs"
      backLabel="Back to listings"
    >
      <Card>
        <CardHeader>
          <CardTitle>New listing</CardTitle>
          <CardDescription>
            Saved as a draft — publish it when you&apos;re ready.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm onSaved={() => router.push("/employer/jobs")} />
        </CardContent>
      </Card>
    </EmployerPageShell>
  );
}
