export function money(n: number) {
  return new Intl.NumberFormat("ar-IQ").format(Math.round(n)) + " د.ع";
}
export function formatDate(d?: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" });
}
export function formatDateTime(d?: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleString("ar-IQ", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function fileSize(n?: number | null) {
  if (!n) return "";
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
  return (n / 1024 / 1024).toFixed(1) + " MB";
}
