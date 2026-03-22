import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, Server } from "lucide-react";

interface CommunicationSectionProps {
  smtpHost: string;
  setSmtpHost: (val: string) => void;
  smtpPort: string;
  setSmtpPort: (val: string) => void;
  smtpUser: string;
  setSmtpUser: (val: string) => void;
  smtpPass: string;
  setSmtpPass: (val: string) => void;
  senderEmail: string;
  setSenderEmail: (val: string) => void;
  showPass: boolean;
  setShowPass: (val: boolean) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function CommunicationSection({ 
  smtpHost, setSmtpHost, smtpPort, setSmtpPort,
  smtpUser, setSmtpUser, smtpPass, setSmtpPass,
  senderEmail, setSenderEmail, 
  showPass, setShowPass, handleSave, isSaving 
}: CommunicationSectionProps) {
  return (
    <AccordionItem value="item-14Communication" className="bg-card border shadow-sm rounded-lg overflow-hidden border-blue-200/50 mt-6">
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group text-blue-600">
        <div className="flex-1 text-start">
          <CardHeader className="flex flex-row items-center justify-between p-0">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5"/> إعدادات البريد الإلكتروني (SMTP / Brevo)
            </CardTitle>
          </CardHeader>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
            تستخدم هذه الإعدادات لإرسال رموز التحقق (OTP) والرسائل الإدارية. يوصى باستخدام Brevo SMTP.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4" /> خادم SMTP (Host)
              </label>
              <div className="flex gap-2">
                <Input 
                  placeholder="smtp-relay.brevo.com" 
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  dir="ltr"
                />
                <Button variant="outline" size="sm" onClick={() => handleSave("SMTP_HOST", smtpHost)} disabled={isSaving}>حفظ</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Server className="h-4 w-4" /> المنفذ (Port)
              </label>
              <div className="flex gap-2">
                <Input 
                  placeholder="587" 
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  dir="ltr"
                />
                <Button variant="outline" size="sm" onClick={() => handleSave("SMTP_PORT", smtpPort)} disabled={isSaving}>حفظ</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" /> البريد الإلكتروني للمرسل
              </label>
              <div className="flex gap-2">
                <Input 
                  placeholder="name@domain.com" 
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  dir="ltr"
                />
                <Button variant="outline" size="sm" onClick={() => handleSave("SENDER_EMAIL", senderEmail)} disabled={isSaving}>حفظ</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" /> اسم المستخدم (SMTP User)
              </label>
              <div className="flex gap-2">
                <Input 
                  placeholder="user@smtp-brevo.com" 
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  dir="ltr"
                />
                <Button variant="outline" size="sm" onClick={() => handleSave("SMTP_USER", smtpUser)} disabled={isSaving}>حفظ</Button>
              </div>
            </div>

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
                <Button 
                  onClick={() => handleSave("SMTP_PASS", smtpPass)}
                  disabled={isSaving}
                >
                  حفظ كلمة المرور
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}
