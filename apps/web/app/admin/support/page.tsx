import { Suspense } from "react";
import { MessagesInbox } from "@/components/messages/messages-inbox";

export default function SupportInboxPage() {
  return (
    <Suspense fallback={<p>Loading inbox…</p>}>
      <MessagesInbox />
    </Suspense>
  );
}
