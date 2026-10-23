import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated/contracts")({
  head: () => ({ meta: [{ title: "العقود الجاهزة — حمورابي" }] }),
  component: () => (
    <div>
      <PageHeader title="العقود الجاهزة" subtitle="هذا القسم قيد الإنشاء" />
    </div>
  ),
});
