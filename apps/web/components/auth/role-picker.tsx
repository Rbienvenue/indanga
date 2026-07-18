"use client";

import * as React from "react";
import { Building2, CheckCircle2, Home, type LucideIcon } from "lucide-react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type RoleOption = {
  value: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const defaultRoles: RoleOption[] = [
  {
    value: "tenant",
    title: "Tenant",
    description: "Looking for a house to rent",
    icon: Home,
  },
  {
    value: "landlord",
    title: "Landlord",
    description: "Want to list and manage properties",
    icon: Building2,
  },
];

type RolePickerProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options?: RoleOption[];
  className?: string;
  disabled?: boolean;
};

export function RolePicker({
  value,
  defaultValue = "tenant",
  onValueChange,
  options = defaultRoles,
  className,
  disabled = false,
}: RolePickerProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const selectedValue = value ?? internalValue;

  const handleChange = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={handleChange}
      className={cn("grid gap-3", className)}
      disabled={disabled}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = selectedValue === option.value;

        return (
          <div
            key={option.value}
            className={cn(
              "group relative rounded-2xl border p-4 transition-all duration-200",
              isActive
                ? "border-primary bg-primary/10 shadow-[0_0_0_2px_hsl(var(--primary)/0.16)]"
                : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
            )}
          >
            <label htmlFor={option.value} className="flex cursor-pointer items-start gap-3">
              <RadioGroupItem
                id={option.value}
                value={option.value}
                className="sr-only"
                aria-label={option.title}
              />

              <div
                className={cn(
                  "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{option.title}</span>
                  {isActive ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                </div>

                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
