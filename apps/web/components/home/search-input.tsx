"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export function SearchInput({ value, onChange, onSearch, onClear }: SearchInputProps) {
  return (
    <div className="relative w-full text-foreground">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSearch();
        }}
        aria-label="Search properties"
        placeholder="Search by name, location, or keyword..."
        className="h-10 bg-background pr-9 pl-9 shadow-sm dark:bg-background"
      />
      {value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
