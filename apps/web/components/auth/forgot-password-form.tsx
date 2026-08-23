"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle, MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "@/lib/validations/auth";

type Step = "request" | "otp" | "reset";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const requestForm = useForm<ForgotPasswordValues, unknown, ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordValues, unknown, ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onRequestSubmit = async (values: ForgotPasswordValues) => {
    requestForm.clearErrors("root");
    setEmail(values.email);

    const { error } = await authClient.emailOtp.requestPasswordReset({
      email: values.email,
    });

    if (error) {
      requestForm.setError("root", {
        message: error.message || "Unable to send reset code. Try again.",
      });
      return;
    }

    setStep("otp");
  };

  const verifyOtp = async (code: string) => {
    if (isVerifyingOtp) return;
    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const { error } = await authClient.emailOtp.checkVerificationOtp({
        email,
        otp: code,
        type: "forget-password",
      });

      if (error) {
        setOtp("");
        setOtpError(error.message || "Invalid or expired code");
        return;
      }

      setStep("reset");
    } catch {
      setOtp("");
      setOtpError("Something went wrong. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const onResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setOtpError("");

    try {
      const { error } = await authClient.emailOtp.requestPasswordReset({ email });
      if (error) {
        setOtpError(error.message || "Failed to resend reset code");
        return;
      }
      setOtp("");
      toast.success("A new code has been sent to your email");
    } catch {
      setOtpError("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const onResetSubmit = async (values: ResetPasswordValues) => {
    resetForm.clearErrors("root");

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password: values.password,
    });

    if (error) {
      resetForm.setError("root", {
        message: error.message || "Invalid or expired code",
      });
      return;
    }

    toast.success("Password reset successfully");
    router.push("/auth/login");
  };

  if (step === "request") {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Forgot password?</h1>
          <p className="mt-3 max-w-sm leading-6 text-muted-foreground">
            Enter your email and we&apos;ll send you a six-digit code to reset your password.
          </p>
        </div>

        <Form {...requestForm}>
          <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-5" noValidate>
            <FormField
              control={requestForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="h-11 px-3"
                      disabled={requestForm.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requestForm.formState.errors.root?.message ? (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {requestForm.formState.errors.root.message}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full cursor-pointer font-semibold"
              disabled={requestForm.formState.isSubmitting}
            >
              {requestForm.formState.isSubmitting ? "Sending…" : "Send reset code"}
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="size-4" />
                Back to sign in
              </Link>
            </Button>
          </form>
        </Form>
      </>
    );
  }

  if (step === "otp") {
    return (
      <>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <MailIcon className="size-6 text-primary" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Check your email
          </h1>
          <p className="mt-3 max-w-sm leading-6 text-muted-foreground">
            We sent a six-digit code to <span className="font-medium">{maskEmail(email)}</span>.
            Enter it below to continue.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (otpError) setOtpError("");
              if (value.length === 6) void verifyOtp(value);
            }}
            disabled={isVerifyingOtp}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }, (_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  aria-invalid={Boolean(otpError)}
                  className="size-12 text-lg"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {isVerifyingOtp ? (
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          ) : null}

          {otpError ? (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {otpError}
            </p>
          ) : null}

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Didn&apos;t receive the code?
            <Button variant="link" className="px-1" onClick={onResend} disabled={isResending}>
              {isResending ? "Sending…" : "Resend"}
            </Button>
          </div>

          <Button asChild variant="ghost" className="w-full">
            <Link href="/auth/login">
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Reset your password</h1>
        <p className="mt-3 max-w-sm leading-6 text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <Form {...resetForm}>
        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5" noValidate>
          <FormField
            control={resetForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className="h-11 bg-white px-3"
                    disabled={resetForm.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={resetForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    className="h-11 bg-white px-3"
                    disabled={resetForm.formState.isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {resetForm.formState.errors.root?.message ? (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
            >
              {resetForm.formState.errors.root.message}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full cursor-pointer font-semibold"
            disabled={resetForm.formState.isSubmitting}
          >
            {resetForm.formState.isSubmitting ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      </Form>
    </>
  );
}
