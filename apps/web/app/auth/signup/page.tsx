"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { RolePicker } from "@/components/auth/role-picker";
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
import { signUp } from "@/lib/auth-client";
import { combineFullName, signupSchema, type SignupValues } from "@/lib/validations/auth";

export default function SignupPage() {
  const router = useRouter();
  const form = useForm<SignupValues, unknown, SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "tenant",
      phoneNumber: "",
      nationalId: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = async ({
    confirmPassword: _,
    nationalId,
    role,
    termsAccepted,
    firstName,
    lastName,
    ...values
  }: SignupValues) => {
    form.clearErrors("root");
    if (!termsAccepted) return;

    const payload = {
      ...values,
      name: combineFullName(firstName, lastName),
      termsAccepted,
      accountType: role,
      nationalId: nationalId?.trim() ? nationalId.trim() : undefined,
    };
    const { error } = await signUp.email(payload);

    if (error) {
      form.setError("root", {
        message: error.message || "Unable to create your account. Try again.",
      });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const isPending = form.formState.isSubmitting;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight  sm:text-4xl">Create your account</h1>
        <p className="mt-3 max-w-sm leading-6 text-muted-foreground">
          Save favorites, contact hosts, and keep every booking in one place.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Are you?</FormLabel>
                <FormControl>
                  <RolePicker
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="given-name"
                      placeholder="First name"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Second name</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="family-name"
                      placeholder="Second name"
                      className="h-11 bg-white px-3"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+250 7xx xxx xxx"
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
          </div>

          {selectedRole === "landlord" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>National ID</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="National ID"
                        className="h-11 bg-white px-3"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      className="h-11 bg-white px-3"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <FormControl>
                    <input
                      id="terms-accepted"
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      disabled={isPending}
                      className="mt-1 size-4 shrink-0 accent-primary"
                    />
                  </FormControl>
                  <FormLabel htmlFor="terms-accepted" className="font-normal leading-6">
                    I have read and agree to the{" "}
                    <Link
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      Terms &amp; Conditions
                    </Link>
                    .
                  </FormLabel>
                </div>
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
            className="h-11 w-full font-semibold cursor-pointer"
            disabled={isPending}
          >
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
