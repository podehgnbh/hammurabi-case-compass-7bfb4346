import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/clients/$clientId")({
  head: () => ({ meta: [{ title: "ملف الموكل — حمورابي" }] }),
  component: () => (
    <div>
      <PageHeader title="ملف الموكل" subtitle="هذا القسم قيد الإنشاء" />
    </div>
  ),
});
