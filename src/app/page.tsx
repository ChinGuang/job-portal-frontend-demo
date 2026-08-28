import Link from "next/link";
import { Briefcase, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    icon: Briefcase,
    title: "Browse openings",
    description:
      "Search published listings by keyword, job type, and location — no account required.",
  },
  {
    icon: FileText,
    title: "Apply & track",
    description:
      "Job seekers build a profile, upload a résumé, and follow every application's status.",
  },
  {
    icon: Users,
    title: "Hire & review",
    description:
      "Employers post listings, manage their lifecycle, and move applicants through the pipeline.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <section className="flex flex-col items-start gap-6 py-16">
        <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
          Demo · Next.js frontend
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Find your next role, or your next hire.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          A demonstration frontend for the Startup Job Portal API. Explore the
          full flow — from browsing public listings to managing applications as
          a job seeker or employer.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/" />}>Browse jobs</Button>
          <Button variant="outline" render={<Link href="/dashboard" />}>
            Go to dashboard
          </Button>
        </div>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <Icon className="size-6 text-muted-foreground" aria-hidden />
              <CardTitle className="mt-2">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </div>
  );
}
