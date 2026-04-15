import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Mail, Server } from "lucide-react";

interface SMTPGeneralSettingsProps {
  smtpHost: string; setSmtpHost: (v: string) => void;
  smtpPort: string; setSmtpPort: (v: string) => void;
  smtpUser: string; setSmtpUser: (v: string) => void;
  senderEmail: string; setSenderEmail: (v: string) => void;
  handleSave: (k: string, v: any) => void;
  isSaving: boolean;
}

export function SMTPGeneralSettings(p: SMTPGeneralSettingsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2"><Server className="h-4 w-4" /> خادم SMTP (Host)</label>
        <div className="flex gap-2"><Input placeholder="smtp-relay.brevo.com" value={p.smtpHost} onChange={e => p.setSmtpHost(e.target.value)} dir="ltr" /><Button variant="outline" size="sm" onClick={() => p.handleSave("SMTP_HOST", p.smtpHost)} disabled={p.isSaving}>حفظ</Button></div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2"><Server className="h-4 w-4" /> المنفذ (Port)</label>
        <div className="flex gap-2"><Input placeholder="587" value={p.smtpPort} onChange={e => p.setSmtpPort(e.target.value)} dir="ltr" /><Button variant="outline" size="sm" onClick={() => p.handleSave("SMTP_PORT", p.smtpPort)} disabled={p.isSaving}>حفظ</Button></div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> البريد الإلكتروني للمرسل</label>
        <div className="flex gap-2"><Input placeholder="name@domain.com" value={p.senderEmail} onChange={e => p.setSenderEmail(e.target.value)} dir="ltr" /><Button variant="outline" size="sm" onClick={() => p.handleSave("SENDER_EMAIL", p.senderEmail)} disabled={p.isSaving}>حفظ</Button></div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> اسم المستخدم</label>
        <div className="flex gap-2"><Input placeholder="user@smtp.com" value={p.smtpUser} onChange={e => p.setSmtpUser(e.target.value)} dir="ltr" /><Button variant="outline" size="sm" onClick={() => p.handleSave("SMTP_USER", p.smtpUser)} disabled={p.isSaving}>حفظ</Button></div>
      </div>
    </>
  );
}
