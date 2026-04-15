import { Button } from "@/components/atoms/Button";
import { Calculator } from "lucide-react";

interface HubSpotSyncToolProps {
  syncPreview: { leads: number; trials: number; orders: number } | null;
  fetchPreview: () => void;
  isFetchingPreview: boolean;
  syncAll: () => void;
  isSyncing: boolean;
}

export function HubSpotSyncTool({ 
  syncPreview, fetchPreview, isFetchingPreview, syncAll, isSyncing 
}: HubSpotSyncToolProps) {
  return (
    <div className="space-y-4 pt-2">
      <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg text-sm text-orange-800 space-y-2">
        <p className="font-bold flex items-center gap-2">
          <Calculator className="h-4 w-4" /> أداة المزامنة الشاملة:
        </p>
        <p>تقوم هذه الأداة بإرسال كافة البيانات الحالية إلى HubSpot يدوياً.</p>
      </div>

      {syncPreview ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="border rounded-md p-3 text-center bg-white shadow-sm">
            <div className="text-xl font-bold text-orange-600">{syncPreview.leads}</div>
            <div className="text-[10px] text-muted-foreground">عملاء</div>
          </div>
          <div className="border rounded-md p-3 text-center bg-white shadow-sm">
            <div className="text-xl font-bold text-orange-600">{syncPreview.trials}</div>
            <div className="text-[10px] text-muted-foreground">استشارات</div>
          </div>
          <div className="border rounded-md p-3 text-center bg-white shadow-sm">
            <div className="text-xl font-bold text-orange-600">{syncPreview.orders}</div>
            <div className="text-[10px] text-muted-foreground">طلبات</div>
          </div>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 gap-2"
          onClick={() => fetchPreview()}
          disabled={isFetchingPreview}
        >
          {isFetchingPreview ? "جاري التحميل..." : "معاينة البيانات للمزامنة"}
        </Button>
      )}

      <Button 
        className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2"
        onClick={() => { if (confirm("هل أنت متأكد من رغبتك في بدء المزامنة؟")) syncAll(); }}
        disabled={isSyncing || !syncPreview}
      >
        {isSyncing ? "جاري المزامنة..." : "بدء المزامنة الآن"}
      </Button>
    </div>
  );
}
