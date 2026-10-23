import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "المساعد الذكي — حمورابي" }] }),
  component: () => (
    <div>
      <PageHeader title="المساعد الذكي" subtitle="هذا القسم قيد الإنشاء" />
    </div>
  ),
});
