import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobDetail } from "@/components/jobs/job-detail";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to jobs
      </Link>
      <div className="mt-6">
        <JobDetail id={id} />
      </div>
    </div>
  );
}
