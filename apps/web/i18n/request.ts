import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, localeCookie, locales, messages } from "@indanga/translations";

export default getRequestConfig(async () => {
  const value = (await cookies()).get(localeCookie)?.value;
  const locale = locales.find((locale) => locale === value) ?? defaultLocale;

  return {
    locale,
    messages: messages[locale],
    timeZone: "Africa/Kigali",
  };
});
