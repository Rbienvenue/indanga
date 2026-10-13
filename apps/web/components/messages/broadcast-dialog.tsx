"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Megaphone, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { ApiResponse, PaginationResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

const audienceOptions = [
  { value: "all", label: "All users" },
  { value: "clients", label: "Clients" },
  { value: "agents", label: "All agents" },
  { value: "HOTEL", label: "Hotel agents" },
  { value: "HOUSE", label: "House agents" },
  { value: "CAR", label: "Car agents" },
  { value: "user", label: "Specific user" },
] as const;

type Audience = (typeof audienceOptions)[number]["value"];

const broadcastSchema = z
  .object({
    audience: z.enum(["all", "clients", "agents", "HOTEL", "HOUSE", "CAR", "user"]),
    userId: z.string().optional(),
    text: z.string().trim().min(1, "Enter a message").max(4000, "Keep it under 4000 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.audience === "user" && !data.userId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["userId"],
        message: "Search and select a user",
      });
    }
  });

type BroadcastValues = z.infer<typeof broadcastSchema>;

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

function toPayload(values: BroadcastValues) {
  if (values.audience === "user") return { scope: "user", userId: values.userId, text: values.text };
  if (values.audience === "HOTEL" || values.audience === "HOUSE" || values.audience === "CAR") {
    return { scope: "provider", providerType: values.audience, text: values.text };
  }
  return { scope: values.audience, text: values.text };
}

export function BroadcastDialog() {
  const [open, setOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userLabel, setUserLabel] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<BroadcastValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { audience: "all", userId: undefined, text: "" },
  });

  const audience = form.watch("audience");
  const text = form.watch("text");

  const usersQuery = useQuery({
    queryKey: ["admin-users", "broadcast-search", userSearch],
    queryFn: () =>
      fetcher<PaginationResponse<AdminUser>>(
        `/admin/users?search=${encodeURIComponent(userSearch)}&limit=6`,
      ),
    enabled: open && audience === "user" && userSearch.trim().length >= 2,
    staleTime: 30 * 1000,
  });
  const results = usersQuery.data?.data ?? [];

  const mutation = useMutation({
    mutationFn: (values: BroadcastValues) =>
      fetcher<ApiResponse<{ recipients: number }>>("/messages/conversations/broadcast", {
        method: "POST",
        body: JSON.stringify(toPayload(values)),
      }),
    onSuccess: ({ data }) => {
      toast.success(
        `Message sent to ${data.recipients} recipient${data.recipients === 1 ? "" : "s"}`,
        { position: "top-center" },
      );
      void queryClient.invalidateQueries({ queryKey: ["messages"] });
      form.reset({ audience: "all", userId: undefined, text: "" });
      setUserSearch("");
      setUserLabel("");
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Could not send broadcast", {
        description: error instanceof Error ? error.message : "Please try again.",
        position: "top-center",
      });
    },
  });

  function close(nextOpen: boolean) {
    if (mutation.isPending) return;
    if (!nextOpen) {
      form.reset({ audience: "all", userId: undefined, text: "" });
      setUserSearch("");
      setUserLabel("");
    }
    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild>
        <Button>
          <Megaphone className="size-4" />
          Broadcast
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Broadcast message</DialogTitle>
          <DialogDescription>
            Sent as INDANGA Support into each recipient&apos;s support thread. Replies come back
            to this inbox.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipients</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value: Audience) => {
                      field.onChange(value);
                      form.setValue("userId", undefined);
                      setUserSearch("");
                      setUserLabel("");
                    }}
                    disabled={mutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {audienceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {audience === "user" ? (
              <FormField
                control={form.control}
                name="userId"
                render={() => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or email (min 2 letters)"
                          className="pl-9"
                          value={userLabel || userSearch}
                          disabled={mutation.isPending}
                          onChange={(event) => {
                            setUserSearch(event.target.value);
                            setUserLabel("");
                            form.setValue("userId", undefined);
                          }}
                        />
                      </div>
                    </FormControl>
                    {userSearch.trim().length >= 2 && !userLabel ? (
                      <div className="overflow-hidden rounded-lg border">
                        {usersQuery.isLoading ? (
                          <p className="px-3 py-2 text-sm text-muted-foreground">Searching…</p>
                        ) : results.length === 0 ? (
                          <p className="px-3 py-2 text-sm text-muted-foreground">No users found.</p>
                        ) : (
                          results.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                form.setValue("userId", user.id, { shouldValidate: true });
                                setUserLabel(`${user.name} · ${user.email}`);
                                setUserSearch("");
                              }}
                              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                            >
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{user.name}</span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {user.email} · {user.role}
                                </span>
                              </span>
                              {form.watch("userId") === user.id ? (
                                <Check className="size-4 shrink-0 text-primary" />
                              ) : null}
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-baseline justify-between">
                    <FormLabel>Message</FormLabel>
                    <span
                      className={cn(
                        "text-xs text-muted-foreground",
                        (text?.length ?? 0) > 4000 && "text-destructive",
                      )}
                    >
                      {text?.length ?? 0}/4000
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Write the announcement…"
                      className="min-h-28"
                      disabled={mutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => close(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Sending…" : "Send broadcast"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
