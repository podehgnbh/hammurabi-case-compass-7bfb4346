import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/tools")({
  head: () => ({ meta: [{ title: "أدوات المحامي — حمورابي" }] }),
  component: () => (
    <div>
      <PageHeader title="أدوات المحامي" subtitle="هذا القسم قيد الإنشاء" />
    </div>
  ),
});
