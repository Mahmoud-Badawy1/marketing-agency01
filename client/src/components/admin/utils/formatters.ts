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

export function formatChildren(children: { name: string; age: number }[] | null | undefined) {
  if (!children || children.length === 0) return "-";
  return children.map((c) => `${c.name} (${c.age} سنة)`).join("، ");
}

export function formatSchoolType(type: string | null | undefined) {
  if (!type) return "-";
  const labels: Record<string, string> = { 
    government: "حكومي", 
    private: "خاص", 
    languages: "لغات" 
  };
  return labels[type] || type;
}
