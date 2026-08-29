"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { RequireEmployer } from "@/components/employer/require-employer";
import { JobForm } from "@/components/employer/job-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function NewJobContent() {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link
        href="/employer/jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to listings
      </Link>

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
    </div>
  );
}

export default function NewJobPage() {
  return (
    <RequireAuth>
      <RequireEmployer>
        <NewJobContent />
      </RequireEmployer>
    </RequireAuth>
  );
}
