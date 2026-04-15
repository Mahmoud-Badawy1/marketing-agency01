import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface HubSpotConfigProps {
  hubspotToken: string;
  setHubspotToken: (val: string) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function HubSpotConfig({ hubspotToken, setHubspotToken, handleSave, isSaving }: HubSpotConfigProps) {
  const [showToken, setShowToken] = useState(false);
  return (
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
  );
}
