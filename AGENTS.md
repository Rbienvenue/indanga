# Project overview
This is indanga a platform to allow tentants to search,book houses.

# Folder structure

* apps/web: using nextjs,shadcn,tailwind,react query for data fetching.
* apps/api: using nestjs
* package/db: using prisma

# Coding Workflow Principles

### Keep consistency with existing implementation
  * your implementation should match existing implementation no new patterns should be introduced wihout clarfying you a user
  * Patterns to be used useQuery datafetching,useMutation all methods expect GET,shadcn and reacthookform,zod for forms.
  
### Plan Mode First
* Use plan mode for any non-trivial task
* Write detailed specs up front
* Reduce ambiguity before writing code
* Lightweight inline plan for smaller tasks


