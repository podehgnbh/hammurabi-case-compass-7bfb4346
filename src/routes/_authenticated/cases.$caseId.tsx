import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/cases/$caseId")({
  head: () => ({ meta: [{ title: "القضية — حمورابي" }] }),
  component: () => (
    <div>
      <PageHeader title="القضية" subtitle="هذا القسم قيد الإنشاء" />
    </div>
  ),
});
