import { Button } from "@/components/atoms/Button";
import { LogOut } from "lucide-react";
import { useAdminSession } from "@/features/admin/hooks/useAdminSession";
import { AdminTabs } from "@/features/admin/components/AdminTabs";

export default function AdminDashboard() {
  const { doLogout, isAdmin } = useAdminSession();

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">لوحة التحكم - ماركتير برو</h1>
          <Button variant="outline" onClick={doLogout}>
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <AdminTabs />
      </main>
    </div>
  );
}
