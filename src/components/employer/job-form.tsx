"use client";

import { useState } from "react";
import { useCreateJob, useUpdateJob } from "@/hooks/use-employer-jobs";
import {
  EMPLOYER_JOB_TYPES,
  type CreateJobInput,
  type EmployerJobType,
} from "@/lib/employer-jobs";
import {
  formatRequirements,
  parseRequirements,
} from "@/lib/job-status";
import { DEFAULT_CURRENCY } from "@/lib/jobs";
import type { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/profile/form-field";

export function JobForm({
  job,
  onSaved,
}: {
  job?: Job | null;
  onSaved?: (job: Job) => void;
}) {
  const exists = Boolean(job);
  const create = useCreateJob();
  const update = useUpdateJob(job?.id ?? "");
  const save = exists ? update : create;

  const [title, setTitle] = useState(job?.title ?? "");
  const [description, setDescription] = useState(job?.description ?? "");
  const [requirements, setRequirements] = useState(
    formatRequirements(job?.requirements),
  );
  const [location, setLocation] = useState(job?.location ?? "");
  const [jobType, setJobType] = useState<EmployerJobType>(
    (job?.jobType as EmployerJobType) ?? EMPLOYER_JOB_TYPES[0].value,
  );
  const [salaryMin, setSalaryMin] = useState(
    job?.salaryMin != null ? String(job.salaryMin) : "",
  );
  const [salaryMax, setSalaryMax] = useState(
    job?.salaryMax != null ? String(job.salaryMax) : "",
  );
  const [currency, setCurrency] = useState(job?.currency ?? DEFAULT_CURRENCY);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError(null);

    if (!title.trim() || !description.trim() || !location.trim()) {
      setFieldError("Title, description, and location are required.");
      return;
    }

    const min = salaryMin.trim() === "" ? undefined : Number(salaryMin);
    const max = salaryMax.trim() === "" ? undefined : Number(salaryMax);
    if (
      (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
      (max !== undefined && (!Number.isFinite(max) || max < 0))
    ) {
      setFieldError("Salary must be a non-negative number.");
      return;
    }
    if (min !== undefined && max !== undefined && min > max) {
      setFieldError("Minimum salary can't exceed the maximum.");
      return;
    }

    const payload: CreateJobInput = {
      title: title.trim(),
      description: description.trim(),
      requirements: parseRequirements(requirements),
      location: location.trim(),
      jobType,
    };
    if (min !== undefined) payload.salaryMin = min;
    if (max !== undefined) payload.salaryMax = max;
    if ((min !== undefined || max !== undefined) && currency.trim()) {
      payload.currency = currency.trim();
    }

    save.mutate(payload, { onSuccess: (data) => onSaved?.(data) });
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormField id="title" label="Title">
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </FormField>

      <FormField id="description" label="Description">
        <Textarea
          id="description"
          className="min-h-32"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormField>

      <FormField
        id="requirements"
        label="Requirements"
        hint="One per line."
      >
        <Textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
      </FormField>

      <FormField id="location" label="Location">
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </FormField>

      <FormField id="jobType" label="Job type">
        <Select
          id="jobType"
          value={jobType}
          onChange={(e) => setJobType(e.target.value as EmployerJobType)}
        >
          {EMPLOYER_JOB_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="salaryMin" label="Salary min">
          <Input
            id="salaryMin"
            type="number"
            min={0}
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
          />
        </FormField>
        <FormField id="salaryMax" label="Salary max">
          <Input
            id="salaryMax"
            type="number"
            min={0}
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
          />
        </FormField>
        <FormField id="currency" label="Currency">
          <Input
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </FormField>
      </div>

      {fieldError ? (
        <p className="text-sm text-destructive">{fieldError}</p>
      ) : null}
      {save.isError ? (
        <p className="text-sm text-destructive">
          {save.error instanceof Error ? save.error.message : "Couldn't save."}
        </p>
      ) : null}

      <Button type="submit" disabled={save.isPending}>
        {save.isPending
          ? "Saving…"
          : exists
            ? "Save changes"
            : "Create draft"}
      </Button>
    </form>
  );
}
