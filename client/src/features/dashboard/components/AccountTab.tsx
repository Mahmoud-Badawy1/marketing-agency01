import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";

interface AccountTabProps {
  user: any;
  getAuthHeaders: () => { Authorization: string };
}

export default function AccountTab({ user, getAuthHeaders }: AccountTabProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [editName, setEditName] = useState(user.name || "");
  const [editPhone, setEditPhone] = useState(user.phone || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setEditName(user.name || "");
    setEditPhone(user.phone || "");
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user/profile", { method: "PUT", headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ name: editName, phone: editPhone }) });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] }); toast({ title: t({ ar: "تم بنجاح", en: "Success" }), description: data.message }); },
    onError: () => toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "فشل تحديث البيانات", en: "Failed to update profile" }), variant: "destructive" }),
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast({ title: t({ ar: "خطأ", en: "Error" }), description: t({ ar: "يجب أن تكون كلمة المرور 6 أحرف على الأقل", en: "Password must be at least 6 characters" }), variant: "destructive" }); return; }
    setIsChangingPassword(true);
    try {
      await apiRequest("POST", "/api/auth/change-password", { oldPassword, newPassword });
      toast({ title: t({ ar: "نجاح", en: "Success" }), description: t({ ar: "تم تغيير كلمة المرور بنجاح", en: "Password changed successfully" }) });
      setOldPassword(""); setNewPassword("");
    } catch (err: any) {
      const msg = err.message || "";
      const desc = msg.includes("401") || msg.includes("غير صحيحة") ? t({ ar: "كلمة المرور الحالية غير صحيحة", en: "Current password is incorrect" }) : (err.message || t({ ar: "حدث خطأ", en: "Error occurred" }));
      toast({ title: t({ ar: "خطأ", en: "Error" }), description: desc, variant: "destructive" });
    } finally { setIsChangingPassword(false); }
  };

  const handleLogout = async () => {
    try { await apiRequest("POST", "/api/auth/logout"); } catch {}
    localStorage.removeItem("userToken"); queryClient.clear(); setLocation("/login");
  };

  return (
    <Card>
      <CardHeader><CardTitle>{t({ ar: "معلومات الحساب", en: "Account Information" })}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate(); }} className="space-y-4 max-w-md">
          <div className="space-y-2"><Label>{t({ ar: "البريد الإلكتروني", en: "Email Address" })}</Label><Input value={user.email} disabled className="bg-muted cursor-not-allowed" dir="ltr" /></div>
          <div className="space-y-2"><Label htmlFor="name">{t({ ar: "الاسم بالكامل", en: "Full Name" })}</Label><Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="phone">{t({ ar: "رقم الهاتف", en: "Phone Number" })}</Label><Input id="phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} dir="ltr" /></div>
          <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending}>{updateProfileMutation.isPending ? t({ ar: "جاري الحفظ...", en: "Saving..." }) : t({ ar: "حفظ التعديلات", en: "Save Changes" })}</Button>
        </form>
        <div className="mt-8 pt-6 border-t border-card-border">
          <h3 className="text-lg font-medium mb-4">{t({ ar: "تغيير كلمة المرور", en: "Change Password" })}</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2"><Label htmlFor="old-password">{t({ ar: "كلمة المرور الحالية", en: "Current Password" })}</Label><Input id="old-password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required dir="ltr" /></div>
            <div className="space-y-2"><Label htmlFor="new-password">{t({ ar: "كلمة المرور الجديدة", en: "New Password" })}</Label><Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} required dir="ltr" /></div>
            <Button type="submit" variant="outline" className="w-full" disabled={isChangingPassword || !oldPassword || newPassword.length < 6}>{isChangingPassword ? t({ ar: "جاري التغيير...", en: "Changing..." }) : t({ ar: "تغيير كلمة المرور", en: "Change Password" })}</Button>
            <p className="text-xs text-muted-foreground text-center">{t({ ar: 'نسيت كلمة المرور الحالية؟ سجل خروج ثم استخدم "نسيت كلمة المرور" من صفحة الدخول.', en: 'Forgot your current password? Log out and use "Forgot Password" from the login page.' })}</p>
          </form>
        </div>
        <div className="mt-8 pt-6 border-t border-card-border"><Button variant="destructive" className="w-full max-w-md" onClick={handleLogout}>{t({ ar: "تسجيل الخروج", en: "Logout" })}</Button></div>
      </CardContent>
    </Card>
  );
}
