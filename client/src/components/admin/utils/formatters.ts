// Helper functions for formatting data in admin dashboard

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatServices(services: { name: string; description?: string }[] | null | undefined) {
  if (!services || services.length === 0) return "-";
  return services.map((s) => `${s.name}${s.description ? ` (${s.description})` : ""}`).join("، ");
}

export function formatServiceInterest(type: string | null | undefined) {
  if (!type) return "-";
  const labels: Record<string, string> = { 
    consultation: "استشارة", 
    branding: "هوية بصرية", 
    ads: "إيرادات وإعلانات",
    strategy: "خطة استراتيجية",
    social_media: "سوشيال ميديا",
    seo: "تحسين محركات البحث",
    other: "أخرى"
  };
  return labels[type] || type;
}
