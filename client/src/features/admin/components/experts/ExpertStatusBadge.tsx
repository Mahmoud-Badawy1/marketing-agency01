import { Badge } from "@/components/atoms/Badge";

export function ExpertStatusBadge({ status }: { status: string | null | undefined }) {
  const configs: Record<string, { label: string; color: string }> = {
    new: { label: "جديد", color: "bg-blue-500" },
    reviewed: { label: "تم المراجعة", color: "bg-yellow-500" },
    interview: { label: "مقابلة", color: "bg-indigo-500" },
    accepted: { label: "مقبول", color: "bg-green-500" },
    rejected: { label: "مرفوض", color: "bg-red-500" },
  };
  const key = status || "new";
  const config = configs[key];
  if (!config) return <Badge>{status}</Badge>;
  return <Badge className={`${config.color} text-white no-default-hover-elevate no-default-active-elevate`}>{config.label}</Badge>;
}
