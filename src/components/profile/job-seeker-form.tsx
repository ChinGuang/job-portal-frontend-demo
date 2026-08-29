"use client";

import { useState } from "react";
import { useSaveJobSeekerProfile } from "@/hooks/use-profiles";
import {
  formatSkills,
  parseSkills,
  type JobSeekerProfile,
} from "@/lib/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./form-field";

export function JobSeekerForm({
  profile,
  onSaved,
}: {
  profile: JobSeekerProfile | null;
  onSaved?: () => void;
}) {
  const exists = profile !== null;
  const save = useSaveJobSeekerProfile(exists);

  const [name, setName] = useState(profile?.name ?? "");
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [skillsText, setSkillsText] = useState(formatSkills(profile?.skills));
  const [years, setYears] = useState(
    profile ? String(profile.yearsOfExperience) : "",
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError(null);

    if (!name.trim()) {
      setFieldError("Name is required.");
      return;
    }
    const yearsValue = years.trim() === "" ? 0 : Number(years);
    if (!Number.isFinite(yearsValue) || yearsValue < 0) {
      setFieldError("Years of experience must be a non-negative number.");
      return;
    }

    save.mutate(
      {
        name: name.trim(),
        headline: headline.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        skills: parseSkills(skillsText),
        yearsOfExperience: yearsValue,
      },
      { onSuccess: () => onSaved?.() },
    );
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormField id="name" label="Full name">
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </FormField>

      <FormField id="headline" label="Headline" hint="e.g. Senior Frontend Engineer">
        <Input
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </FormField>

      <FormField id="bio" label="Bio">
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      </FormField>

      <FormField id="phone" label="Phone">
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </FormField>

      <FormField
        id="skills"
        label="Skills"
        hint="Comma-separated, e.g. React, TypeScript, Node"
      >
        <Textarea
          id="skills"
          value={skillsText}
          onChange={(e) => setSkillsText(e.target.value)}
        />
      </FormField>

      <FormField id="years" label="Years of experience">
        <Input
          id="years"
          type="number"
          min={0}
          value={years}
          onChange={(e) => setYears(e.target.value)}
        />
      </FormField>

      {fieldError ? (
        <p className="text-sm text-destructive">{fieldError}</p>
      ) : null}
      {save.isError ? (
        <p className="text-sm text-destructive">
          {save.error instanceof Error ? save.error.message : "Couldn't save."}
        </p>
      ) : null}
      {save.isSuccess ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Profile saved.
        </p>
      ) : null}

      <Button type="submit" disabled={save.isPending}>
        {save.isPending
          ? "Saving…"
          : exists
            ? "Save changes"
            : "Create profile"}
      </Button>
    </form>
  );
}
