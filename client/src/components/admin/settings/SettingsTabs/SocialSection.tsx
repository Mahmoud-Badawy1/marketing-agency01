import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, Plus, Trash2 } from "lucide-react";
import { SOCIAL_FIELDS, type SocialData } from "../constants";

interface SocialSectionProps {
  social: SocialData;
  setSocial: (val: SocialData | ((prev: SocialData) => SocialData)) => void;
  whatsapp: string;
  setWhatsapp: (val: string) => void;
  instapay: string;
  setInstapay: (val: string) => void;
  handleSave: (key: string, value: any) => void;
  isSaving: boolean;
}

export function SocialSection({ social, setSocial, whatsapp, setWhatsapp, instapay, setInstapay, handleSave, isSaving }: SocialSectionProps) {
  return (
    <AccordionItem value="item-5Social" className="bg-card border shadow-sm rounded-lg overflow-hidden mb-6 border-none">
      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors border-none group">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary group-data-[state=open]:text-foreground transition-colors" />
          <span className="font-semibold">روابط التواصل (Social & Contact)</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-0">
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>رقم الواتساب (WhatsApp)</Label>
              <Input placeholder="+20123456789" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>حساب انستاباي (InstaPay)</Label>
              <Input placeholder="username@instapay" value={instapay} onChange={e => setInstapay(e.target.value)} dir="ltr" />
            </div>
            {SOCIAL_FIELDS.map((field: any) => (
              <div key={field.id} className="space-y-2">
                <Label className="flex items-center gap-2">
                  <field.icon className="h-4 w-4" /> {field.label}
                </Label>
                <Input placeholder="https://..." value={social[field.id as keyof SocialData] || ""} onChange={e => setSocial((p: any) => ({...p, [field.id]: e.target.value}))} dir="ltr" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => handleSave("contact", { whatsapp, instapay })} disabled={isSaving}>حفظ الواتساب</Button>
            <Button className="flex-1" variant="outline" onClick={() => handleSave("social", social)} disabled={isSaving}>حفظ الروابط</Button>
          </div>
        </CardContent>
      </AccordionContent>
    </AccordionItem>
  );
}
