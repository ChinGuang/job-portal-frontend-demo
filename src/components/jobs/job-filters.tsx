"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JOB_TYPES } from "@/lib/jobs";

export interface JobFilterValues {
  q: string;
  location: string;
  jobType: string;
}

interface JobFiltersProps {
  /** Current applied values (from the URL). */
  value: JobFilterValues;
  /** Called when the user applies text filters or changes the job type. */
  onApply: (next: JobFilterValues) => void;
  onClear: () => void;
}

/**
 * Filter bar. Inputs are uncontrolled and drafted locally; they apply on submit
 * (or Enter), and the job-type select applies immediately. The form is keyed by
 * the applied values so it resets cleanly on Clear or back/forward navigation.
 */
export function JobFilters({ value, onApply, onClear }: JobFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasAnyFilter = Boolean(value.q || value.location || value.jobType);

  const readAndApply = () => {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    onApply({
      q: String(data.get("q") ?? ""),
      location: String(data.get("location") ?? ""),
      jobType: String(data.get("jobType") ?? ""),
    });
  };

  return (
    <form
      ref={formRef}
      key={`${value.q}|${value.location}|${value.jobType}`}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={(event) => {
        event.preventDefault();
        readAndApply();
      }}
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="q"
          defaultValue={value.q}
          placeholder="Search title or description"
          aria-label="Search jobs"
          className="pl-8"
        />
      </div>

      <Input
        name="location"
        defaultValue={value.location}
        placeholder="Location"
        aria-label="Filter by location"
        className="sm:w-44"
      />

      <select
        name="jobType"
        defaultValue={value.jobType}
        onChange={readAndApply}
        aria-label="Filter by job type"
        className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-40"
      >
        <option value="">All types</option>
        {JOB_TYPES.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <Button type="submit">Search</Button>
        {hasAnyFilter ? (
          <Button type="button" variant="ghost" onClick={onClear}>
            <X className="size-4" aria-hidden />
            Clear
          </Button>
        ) : null}
      </div>
    </form>
  );
}
