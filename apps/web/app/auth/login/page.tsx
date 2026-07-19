"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginValues, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    form.clearErrors("root");
    const { error } = await signIn.email(values);

    if (error) {
      form.setError("root", { message: error.message || "Unable to sign in. Try again." });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const isPending = form.formState.isSubmitting;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#090a2d] sm:text-4xl">
          Sign in to continue
        </h1>
        <p className="mt-3 max-w-sm leading-6 text-muted-foreground">
          Access your saved homes, bookings, and conversations.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11 bg-white px-3"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Button asChild variant={"link"}>
                    <Link href="/auth/forgot-password">Forgot password?</Link>
                  </Button>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-11 bg-white px-3"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root?.message ? (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full font-semibold"
            disabled={isPending}
          >
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        New to INDANGA?{" "}
        <Link href="/auth/signup" className="font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
