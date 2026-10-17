"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PasswordInput } from "@/components/auth/password-input";
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
  const t = useTranslations("auth");
  const router = useRouter();
  const form = useForm<LoginValues, unknown, LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    form.clearErrors("root");
    const { error, data } = await signIn.email(values);

    if (error) {
      form.setError("root", {
        message: error.code === "INVALID_EMAIL_OR_PASSWORD" ? "invalidCredentials" : "signInError",
      });
      return;
    }

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
    const user = data.user;
    const destination =
      callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
        ? callbackUrl
        : user.role === "admin"
          ? "/admin"
          : "/dashboard";

    router.push(destination);
    router.refresh();
  };

  const isPending = form.formState.isSubmitting;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight  sm:text-4xl">{t("loginTitle")}</h1>
        <p className="mt-3 max-w-sm leading-6 text-muted-foreground">{t("loginDescription")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    className="h-11 px-3"
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
                  <FormLabel>{t("password")}</FormLabel>
                  <Button asChild variant={"link"}>
                    <Link href="/auth/forgot-password">{t("forgotPassword")}</Link>
                  </Button>
                </div>
                <FormControl>
                  <PasswordInput
                    autoComplete="current-password"
                    placeholder={t("enterPassword")}
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
              {t(
                form.formState.errors.root.message === "invalidCredentials"
                  ? "invalidCredentials"
                  : "signInError",
              )}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full font-semibold cursor-pointer"
            disabled={isPending}
          >
            {isPending ? t("signingIn") : t("signIn")}
          </Button>
        </form>
      </Form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        {t("newHere")}{" "}
        <Link href="/auth/signup" className="font-semibold hover:underline">
          {t("createAnAccount")}
        </Link>
      </p>
    </>
  );
}
