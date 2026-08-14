"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, User, Phone, ShieldCheck, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/components/providers/session-provider";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const session = useSession();
  const user = session?.user;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await authClient.updateUser({
        name: data.name,
        phoneNumber: data.phoneNumber,
      });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update profile");
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateUserMutation.mutate(data);
  };

  if (!user) {
    return null;
  }

  const role = user.role === "tenant" ? "Client" : (user.role ?? "Client");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Profile Settings</p>
            <h1 className="text-3xl font-semibold tracking-tight">Manage your account details</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Update your personal information, review account data, and manage how you sign in to
              Indanga.
            </p>
          </div>
          <Button asChild>
            <Link href="mailto:support@indanga.com">Contact support</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input type="email" value={user.email ?? ""} disabled className="h-10" />
                  </div>
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone number
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Enter your phone number"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Account role
                    </Label>
                    <Input value={role.toLowerCase()} disabled className="h-10 capitalize" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-3">
                <div className="flex w-full gap-3 sm:w-auto">
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border bg-muted p-5">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Settings2 className="h-5 w-5" />
                <p className="text-sm font-medium">Account security</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Keep your account safe by using a strong password and updating your details
                regularly. For email or password changes, please reach out to support.
              </p>
            </div>
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="mailto:support@indanga.com">Request update</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
