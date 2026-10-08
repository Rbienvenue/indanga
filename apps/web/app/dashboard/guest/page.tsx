import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-client";
import { GuestDirectory } from "@/components/dashboard/guest-directory";

export default async function GuestPage() {
  const { data: session } = await getSession({ fetchOptions: { headers: await headers() } });
  if (session?.user.role !== "landlord") {
    redirect("/dashboard");
  }
  return <GuestDirectory />;
}
