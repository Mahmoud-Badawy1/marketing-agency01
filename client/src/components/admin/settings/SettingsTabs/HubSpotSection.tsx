import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Lock, Calculator, Eye, EyeOff } from "lucide-react";

interface HubSpotSectionProps {
  hubspotToken: string;
  setHubspotToken: (val: string) => void;
  showToken: boolean;
  setShowToken: (val: boolean) => void;
  syncPreview: { leads: number; trials: number; orders: number } | null;
  fetchPreview: () => void;
  isFetchingPreview: boolean;
  syncAll: () => void;
  isSyncing: boolean;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function HubSpotSection({ 
  hubspotToken, setHubspotToken, showToken, setShowToken, 
  syncPreview, fetchPreview, isFetchingPreview, 
  syncAll, isSyncing, handleSave, isSaving 
}: HubSpotSectionProps) {
  return (
    <AccordionItem value="item-13HubSpotSync" className="bg-card border shadow-sm rounded-lg overflow-hidden border-orange-200/50 mt-6">
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group text-orange-600">
        <div className="flex-1 text-start">
          <CardHeader className="flex flex-row items-center justify-between p-0">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5"/> إعدادات ومزامنة HubSpot CRM
            </CardTitle>
          </CardHeader>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <CardContent className="space-y-6 pt-6">
          {/* API Key Configuration */}
          <div className="space-y-4 border-b pb-6">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-2">
              <Lock className="h-4 w-4" /> إعدادات الوصول الآمن
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  type={showToken ? "text" : "password"} 
                  placeholder="HubSpot Access Token (pat-na1-...)" 
                  value={hubspotToken}
                  onChange={(e) => setHubspotToken(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                />
                <button 
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button 
                onClick={() => handleSave("HUBSPOT_ACCESS_TOKEN", hubspotToken)}
                disabled={isSaving}
              >
                {isSaving ? "جاري الحفظ..." : "حفظ المفتاح"}
              </Button>
            </div>
          </div>

          {/* Sync Tool */}
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
              onClick={() => {
                if (confirm("هل أنت متأكد من رغبتك في بدء المزامنة؟")) {
                   syncAll();
                }
              }}
              disabled={isSyncing || !syncPreview}
            >
              {isSyncing ? "جاري المزامنة..." : "بدء المزامنة الآن"}
            </Button>
          </div>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}
