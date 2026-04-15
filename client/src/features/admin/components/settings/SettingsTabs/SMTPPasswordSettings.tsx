import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface SMTPPasswordSettingsProps {
  smtpPass: string;
  setSmtpPass: (val: string) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function SMTPPasswordSettings({ smtpPass, setSmtpPass, handleSave, isSaving }: SMTPPasswordSettingsProps) {
  const [showPass, setShowPass] = useState(false);
  return (
    <div className="space-y-2 md:col-span-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Lock className="h-4 w-4" /> كلمة المرور (SMTP Password)
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input 
            type={showPass ? "text" : "password"} 
            placeholder="SMTP Password" 
            value={smtpPass}
            onChange={(e) => setSmtpPass(e.target.value)}
            className="pr-10"
            dir="ltr"
          />
          <button 
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button onClick={() => handleSave("SMTP_PASS", smtpPass)} disabled={isSaving}>
          {isSaving ? "جاري الحفظ..." : "حفظ كلمة المرور"}
        </Button>
      </div>
    </div>
  );
}
