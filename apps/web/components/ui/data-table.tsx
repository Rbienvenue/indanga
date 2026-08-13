"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<TData> = ColumnDef<TData>;

type FilterOption = {
  label: string;
  value: string;
};

type SearchConfig = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

type FilterConfig = {
  id: string;
  options: FilterOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

type PaginationConfig = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  search?: SearchConfig;
  filterBy?: FilterConfig[];
  actions?: ReactNode;
  zebra?: boolean;
  loading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;
  pagination?: PaginationConfig;
}

export function DataTable<TData>({
  columns,
  data,
  search,
  filterBy = [],
  actions,
  zebra = true,
  loading = false,
  loadingRows = 5,
  emptyState,
  pagination,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState(search?.value ?? "");
  const hasToolbar = Boolean(actions || search || filterBy.length);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getRowId: (row, index) => {
      const keyed = row as { id?: string | number };
      return String(keyed.id ?? index);
    },
  });

  const searchOnChangeRef = useRef(search?.onChange);
  searchOnChangeRef.current = search?.onChange;

  useEffect(() => {
    setSearchInput(search?.value ?? "");
  }, [search?.value]);

  useEffect(() => {
    if (!searchOnChangeRef.current) return;
    const timeout = setTimeout(() => {
      if (searchInput !== (search?.value ?? "")) {
        searchOnChangeRef.current?.(searchInput);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput, search?.value]);

  const isFilterActive = (filter: FilterConfig) => Boolean(filter.value) && filter.value !== "all";
  const activeFilterCount = filterBy.filter(isFilterActive).length;
  const canReset = activeFilterCount > 0 || Boolean(searchInput);

  const handleClearSearch = () => {
    setSearchInput("");
    search?.onChange("");
  };

  const handleResetAll = () => {
    if (search) handleClearSearch();
    for (const filter of filterBy) {
      if (isFilterActive(filter)) filter.onChange("all");
    }
  };

  const visibleColumnCount = table.getVisibleLeafColumns().length;

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-xl border bg-card">
      {hasToolbar && (
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {search && (
            <div className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 sm:w-72 lg:w-80">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") handleClearSearch();
                }}
                placeholder={search.placeholder ?? "Search"}
                aria-label={search.placeholder ?? "Search"}
                className="h-full min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {filterBy.map((filter) => (
              <Select key={filter.id} value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder={filter.placeholder ?? "Filter"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{filter.placeholder ?? "All"}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {canReset && (search || filterBy.length) ? (
              <Button variant="ghost" size="sm" onClick={handleResetAll}>
                Reset
                {activeFilterCount ? (
                  <span className="rounded-full bg-primary/10 px-1.5 text-xs font-semibold text-primary">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            ) : null}

            {actions}
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-t hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={
                    header.column.columnDef.size
                      ? { width: header.column.columnDef.size }
                      : undefined
                  }
                  className={cn(
                    "px-4 py-3 text-sm font-medium text-muted-foreground",
                    header.column.getCanSort() &&
                      "cursor-pointer select-none hover:text-foreground",
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <span className="inline-flex items-center gap-1">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="text-muted-foreground/60">
                        {header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5 opacity-30" />
                        )}
                      </span>
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, index) => (
              <TableRow key={index} className={cn(zebra && index % 2 === 0 && "bg-muted/30")}>
                {Array.from({ length: visibleColumnCount }).map((_, columnIndex) => (
                  <TableCell key={columnIndex} className="px-4 py-4">
                    <Skeleton className="h-3 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, idx) => (
              <TableRow key={row.id} className={cn(zebra && idx % 2 === 0 && "bg-muted/30")}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="px-4 py-3"
                    style={
                      cell.column.columnDef.size ? { width: cell.column.columnDef.size } : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={visibleColumnCount} className="px-4 py-12 text-center">
                {emptyState ?? <p className="text-sm text-muted-foreground">No results found</p>}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeft />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
