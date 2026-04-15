import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ExpertApplicationType } from "@shared/schema";

interface ExpertApplicationDetailsProps {
  app: ExpertApplicationType;
}

export function ExpertApplicationDetails({ app }: ExpertApplicationDetailsProps) {
  return (
    <>
      <DialogHeader><DialogTitle>تفاصيل طلب {app.fullName}</DialogTitle></DialogHeader>
      <div className="space-y-3 text-sm py-4">
        <div><strong>المؤهل:</strong> {app.education} - {app.specialization}</div>
        <div><strong>سنوات الخبرة:</strong> {app.experienceYears} سنة</div>
        <div><strong>الأوقات المتاحة:</strong> {app.availableHours}</div>
        {app.marketingTools && <div><strong>المنصات:</strong> {app.marketingTools}</div>}
        <div><strong>خبرة وكالات:</strong> {app.hasAgencyExperience ? "نعم" : "لا"}</div>
        {app.hasAgencyExperience && app.portfolioDetails && (
          <div><strong>أبرز الإنجازات:</strong><p className="mt-1 bg-muted p-2 rounded">{app.portfolioDetails}</p></div>
        )}
        {app.motivation && (
          <div><strong>الدافع للانضمام:</strong><p className="mt-1 bg-muted p-2 rounded">{app.motivation}</p></div>
        )}
      </div>
    </>
  );
}
