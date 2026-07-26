"use client";

import Link from "next/link";
import { Mail, User, Phone, ShieldCheck, Settings2 } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const session = useSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl rounded-3xl border bg-background/50 p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Loading your profile settings...</p>
      </div>
    );
  }

  const displayName = user.name ?? "Guest";
  const email = user.email ?? "Not available";
  const phoneNumber = user.phoneNumber ?? "Not available";
  const role = user.role ?? "Tenant";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Profile Settings</p>
            <h1 className="text-3xl font-semibold tracking-tight">Manage your account details</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Update your personal information, review account data, and manage how you sign in to Indanga.
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
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border bg-muted p-5">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <User className="h-5 w-5" />
                  <p className="text-sm font-medium">Full name</p>
                </div>
                <p className="mt-3 text-lg font-semibold">{displayName}</p>
              </div>
              <div className="rounded-3xl border bg-muted p-5">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5" />
                  <p className="text-sm font-medium">Email</p>
                </div>
                <p className="mt-3 break-all text-base font-semibold">{email}</p>
              </div>
              <div className="rounded-3xl border bg-muted p-5">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5" />
                  <p className="text-sm font-medium">Phone number</p>
                </div>
                <p className="mt-3 text-lg font-semibold">{phoneNumber}</p>
              </div>
              <div className="rounded-3xl border bg-muted p-5">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldCheck className="h-5 w-5" />
                  <p className="text-sm font-medium">Account role</p>
                </div>
                <p className="mt-3 text-lg font-semibold capitalize">{role.toLowerCase()}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              These values are pulled from your current session. If anything is incorrect, contact support.
            </p>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/bookings">View bookings</Link>
            </Button>
          </CardFooter>
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
                Keep your account safe by using a strong password and updating your details regularly. For email or password changes, please reach out to support.
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-3xl border bg-muted p-5">
                <p className="text-sm font-medium">Session</p>
                <p className="mt-2 text-sm text-muted-foreground">Signed in as {email}</p>
              </div>
              <Button asChild>
                <Link href="mailto:support@indanga.com">Request profile update</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
