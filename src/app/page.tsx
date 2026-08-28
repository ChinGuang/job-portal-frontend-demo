import { Suspense } from "react";
import { JobsBrowser } from "@/components/jobs/jobs-browser";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Browse jobs</h1>
        <p className="text-muted-foreground">
          Explore published openings. Search by keyword and filter by type and
          location — no account required.
        </p>
      </header>

      <Suspense fallback={null}>
        <JobsBrowser />
      </Suspense>
    </div>
  );
}
