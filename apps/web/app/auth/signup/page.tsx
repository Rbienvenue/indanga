"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { RolePicker } from "@/components/auth/role-picker";
import { PasswordInput } from "@/components/auth/password-input";
import { TermsDialog } from "@/components/legal/terms-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signUp } from "@/lib/auth-client";
import { combineFullName, signupSchema, type SignupValues } from "@/lib/validations/auth";

export default function SignupPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const form = useForm<SignupValues, unknown, SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "tenant",
      providerType: "HOTEL",
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
    providerType,
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
      providerType: role === "landlord" ? providerType : "HOTEL",
      nationalId: nationalId?.trim() ? nationalId.trim() : undefined,
    };
    const { error } = await signUp.email(payload);

    if (error) {
      form.setError("root", {
        message:
          error.code === "USER_ALREADY_EXISTS" ||
          error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
            ? "accountExists"
            : "signupError",
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
        <h1 className="text-3xl font-semibold tracking-tight  sm:text-4xl">{t("signupTitle")}</h1>
        <p className="mt-3 max-w-sm leading-6 text-muted-foreground">{t("signupDescription")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("areYou")}</FormLabel>
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

          {selectedRole === "landlord" ? (
            <FormField
              control={form.control}
              name="providerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("provide")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder={t("providerType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="HOUSE">{t("house")}</SelectItem>
                      <SelectItem value="HOTEL">{t("hotel")}</SelectItem>
                      <SelectItem value="CAR">{t("car")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("firstName")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="given-name"
                      placeholder={t("firstName")}
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
                  <FormLabel>{t("lastName")}</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="family-name"
                      placeholder={t("lastName")}
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
                  <FormLabel>{t("phone")}</FormLabel>
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
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder={t("emailPlaceholder")}
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
                    <FormLabel>{t("nationalId")}</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder={t("nationalId")}
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
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder={t("passwordMinimum")}
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
                  <FormLabel>{t("confirmPassword")}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      placeholder={t("repeatPassword")}
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
                    {t.rich("acceptTerms", { terms: () => <TermsDialog /> })}
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
              {t(
                form.formState.errors.root.message === "accountExists"
                  ? "accountExists"
                  : "signupError",
              )}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="h-11 w-full font-semibold cursor-pointer"
            disabled={isPending}
          >
            {isPending ? t("creatingAccount") : t("createAccount")}
          </Button>
        </form>
      </Form>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/auth/login" className="font-semibold hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </>
  );
}
