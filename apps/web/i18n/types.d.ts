import type { Locale, Messages } from "@indanga/translations";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
