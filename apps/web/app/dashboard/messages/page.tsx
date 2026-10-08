import { Suspense } from "react";
import { MessagesInbox } from "@/components/messages/messages-inbox";

export default function MessagesPage() {
  return (
    <Suspense fallback={<p>Loading inbox…</p>}>
      <MessagesInbox />
    </Suspense>
  );
}
