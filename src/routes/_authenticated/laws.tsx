import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/laws")({
  head: () => ({ meta: [{ title: "المكتبة القانونية — حمورابي" }] }),
  component: () => (
    <div>
      <PageHeader title="المكتبة القانونية" subtitle="هذا القسم قيد الإنشاء" />
    </div>
  ),
});
