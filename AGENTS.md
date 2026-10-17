# Project overview

This is indanga a platform to allow tentants to search,book houses.

# Folder structure

- apps/web: using nextjs,shadcn,tailwind,react query for data fetching.
- apps/api: using nestjs
- package/db: using prisma

# Coding Workflow Principles

### Keep consistency with existing implementation

- your implementation should match existing implementation no new patterns should be introduced wihout clarfying you a user
- Patterns to be used useQuery data fetching,useMutation all methods expect GET,shadcn and reacthookform,zod for ui and forms.

### Plan Mode First

- Use plan mode for any non-trivial task
- Write detailed specs up front
- Reduce ambiguity before writing code
- Lightweight inline plan for smaller tasks

### Translations

- All new user-facing text must use the shared `@indanga/translations` catalogs, including text added to existing files. Do not hardcode labels, messages, validation errors, toasts, placeholders, accessibility text, or metadata.
- Add matching keys and translated messages for English (`en`), French (`fr`), and Kinyarwanda (`rw`) in the same change. Use `next-intl` in the web app and keep translation keys typed.
- Use named interpolation and plural messages instead of concatenating translated sentences. Format displayed dates and numbers using the selected locale; keep currency values and stored identifiers unchanged.
- User-authored content, proper names, internal logs, and machine-readable identifiers do not need translation. Existing untranslated screens can be migrated incrementally; do not expand unrelated changes just to translate them.
- Run `pnpm --filter @indanga/translations check:messages` after changing catalogs.
