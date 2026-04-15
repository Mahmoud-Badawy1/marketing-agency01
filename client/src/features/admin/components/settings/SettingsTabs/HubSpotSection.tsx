import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { HubSpotConfig } from "./HubSpotConfig";
import { HubSpotSyncTool } from "./HubSpotSyncTool";

interface HubSpotSectionProps {
  hubspotToken: string;
  setHubspotToken: (val: string) => void;
  syncPreview: { leads: number; trials: number; orders: number } | null;
  fetchPreview: () => void;
  isFetchingPreview: boolean;
  syncAll: () => void;
  isSyncing: boolean;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function HubSpotSection({ 
  hubspotToken, setHubspotToken, syncPreview, fetchPreview, 
  isFetchingPreview, syncAll, isSyncing, handleSave, isSaving 
}: HubSpotSectionProps) {
  return (
    <AccordionItem value="item-13HubSpotSync" className="bg-card border shadow-sm rounded-lg overflow-hidden border-orange-200/50 mt-6">
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group text-orange-600">
        <div className="flex-1 text-start">
          <CardHeader className="flex flex-row items-center justify-between p-0">
            <CardTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5"/> إعدادات ومزامنة HubSpot CRM</CardTitle>
          </CardHeader>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <CardContent className="space-y-6 pt-6">
          <HubSpotConfig hubspotToken={hubspotToken} setHubspotToken={setHubspotToken} handleSave={handleSave} isSaving={isSaving} />
          <HubSpotSyncTool syncPreview={syncPreview} fetchPreview={fetchPreview} isFetchingPreview={isFetchingPreview} syncAll={syncAll} isSyncing={isSyncing} />
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}
