"use client";

import { useState } from "react";
import { useSaveEmployerProfile } from "@/hooks/use-profiles";
import {
  EMPLOYER_SIZES,
  type EmployerProfile,
} from "@/lib/profiles";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "./form-field";
import { ProfileFormFooter } from "./profile-form-footer";

export function EmployerForm({
  profile,
  onSaved,
}: {
  profile: EmployerProfile | null;
  onSaved?: () => void;
}) {
  const exists = profile !== null;
  const save = useSaveEmployerProfile(exists);

  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [industry, setIndustry] = useState(profile?.industry ?? "");
  const [size, setSize] = useState(profile?.size ?? EMPLOYER_SIZES[0]);
  const [description, setDescription] = useState(profile?.description ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFieldError(null);

    if (!companyName.trim()) {
      setFieldError("Company name is required.");
      return;
    }

    save.mutate(
      {
        companyName: companyName.trim(),
        website: website.trim(),
        industry: industry.trim(),
        size,
        description: description.trim(),
        address: address.trim(),
      },
      { onSuccess: () => onSaved?.() },
    );
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <FormField id="companyName" label="Company name">
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
      </FormField>

      <FormField id="website" label="Website" hint="e.g. https://acme.com">
        <Input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </FormField>

      <FormField id="industry" label="Industry">
        <Input
          id="industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
      </FormField>

      <FormField id="size" label="Company size">
        <Select
          id="size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
        >
          {EMPLOYER_SIZES.map((option) => (
            <option key={option} value={option}>
              {option} employees
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id="description" label="Description">
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormField>

      <FormField id="address" label="Address">
        <Textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </FormField>

      <ProfileFormFooter
        fieldError={fieldError}
        saveError={save.error}
        isError={save.isError}
        isSuccess={save.isSuccess}
        isPending={save.isPending}
        exists={exists}
      />
    </form>
  );
}
