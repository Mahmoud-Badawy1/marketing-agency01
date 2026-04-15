import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { SMTPGeneralSettings } from "./SMTPGeneralSettings";
import { SMTPPasswordSettings } from "./SMTPPasswordSettings";

interface CommunicationSectionProps {
  smtpHost: string; setSmtpHost: (v: string) => void;
  smtpPort: string; setSmtpPort: (v: string) => void;
  smtpUser: string; setSmtpUser: (v: string) => void;
  smtpPass: string; setSmtpPass: (v: string) => void;
  senderEmail: string; setSenderEmail: (v: string) => void;
  handleSave: (k: string, v: any) => void;
  isSaving: boolean;
}

export function CommunicationSection(p: CommunicationSectionProps) {
  return (
    <AccordionItem value="item-14Communication" className="bg-card border shadow-sm rounded-lg overflow-hidden border-blue-200/50 mt-6">
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group text-blue-600">
        <div className="flex-1 text-start">
          <CardHeader className="flex flex-row items-center justify-between p-0">
            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5"/> إعدادات البريد الإلكتروني (SMTP / Brevo)</CardTitle>
          </CardHeader>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">تستخدم هذه الإعدادات لإرسال رموز التحقق (OTP) والرسائل الإدارية. يوصى باستخدام Brevo SMTP.</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SMTPGeneralSettings {...p} />
            <SMTPPasswordSettings smtpPass={p.smtpPass} setSmtpPass={p.setSmtpPass} handleSave={p.handleSave} isSaving={p.isSaving} />
          </div>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}
