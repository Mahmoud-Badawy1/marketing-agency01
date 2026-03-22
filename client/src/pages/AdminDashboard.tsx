import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { isAdminLoggedIn, adminLogout, getAdminToken } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, MessageSquare, ShoppingCart, CalendarCheck, Settings, Users2, MessageCircle, Ticket, Calendar as CalendarIcon, Clock } from "lucide-react";
import { LeadsTab } from "@/components/admin/tabs/LeadsTab";
import { OrdersTab } from "@/components/admin/tabs/OrdersTab";
import { TrialsTab } from "@/components/admin/tabs/TrialsTab";
import { TestimonialsTab } from "@/components/admin/tabs/TestimonialsTab";
import { ExpertApplicationsTab } from "@/components/admin/tabs/ExpertApplicationsTab";
import { CouponsTab } from "@/components/admin/tabs/CouponsTab";
import { SettingsTab } from "@/components/admin/tabs/SettingsTab";
import { CalendarTab } from "@/components/admin/tabs/CalendarTab";
import { BookingPoliciesTab } from "@/components/admin/tabs/BookingPoliciesTab";

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Verify every 5 min
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // Auto-logout after 30 min idle

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

  const doLogout = useCallback(async () => {
    await adminLogout();
    setLocation("/admin/login");
  }, [setLocation]);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      setLocation("/admin/login");
      return;
    }

    // Periodically verify session with backend
    const verifyInterval = setInterval(async () => {
      const token = getAdminToken();
      if (!token) {
        doLogout();
        return;
      }
      try {
        const res = await fetch("/api/admin/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) doLogout();
      } catch {
        // Network error — don't logout, just skip
      }
    }, SESSION_CHECK_INTERVAL);

    // Inactivity auto-logout
    let lastActivity = Date.now();
    const resetActivity = () => { lastActivity = Date.now(); };

    window.addEventListener("mousemove", resetActivity);
    window.addEventListener("keydown", resetActivity);
    window.addEventListener("click", resetActivity);

    const idleCheck = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        doLogout();
      }
    }, 60_000);

    return () => {
      clearInterval(verifyInterval);
      clearInterval(idleCheck);
      window.removeEventListener("mousemove", resetActivity);
      window.removeEventListener("keydown", resetActivity);
      window.removeEventListener("click", resetActivity);
    };
  }, [setLocation, doLogout]);

  if (!isAdminLoggedIn()) {
    return null;
  }

  async function handleLogout() {
    await doLogout();
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
          <h1 className="text-xl font-bold" data-testid="text-dashboard-title">لوحة التحكم - ماركتير برو</h1>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="leads" dir="rtl">
          <TabsList className="mb-4 flex-wrap gap-1">
            <TabsTrigger value="leads" data-testid="tab-leads" className="gap-1">
              <MessageSquare className="h-4 w-4" />
              الرسائل
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders" className="gap-1">
              <ShoppingCart className="h-4 w-4" />
              المبيعات والطلبات
            </TabsTrigger>
            <TabsTrigger value="trials" data-testid="tab-trials" className="gap-1">
              <CalendarCheck className="h-4 w-4" />
              استشارات واجتماعات
            </TabsTrigger>
            <TabsTrigger value="experts" data-testid="tab-experts" className="gap-1">
              <Users2 className="h-4 w-4" />
              فريق العمل / الخبراء
            </TabsTrigger>
            <TabsTrigger value="testimonials" data-testid="tab-testimonials" className="gap-1">
              <MessageCircle className="h-4 w-4" />
              آراء العملاء
            </TabsTrigger>
            <TabsTrigger value="coupons" data-testid="tab-coupons" className="gap-1">
              <Ticket className="h-4 w-4" />
              كوبونات الخصم
            </TabsTrigger>
            <TabsTrigger value="calendar" data-testid="tab-calendar" className="gap-1">
              <CalendarIcon className="h-4 w-4" />
              التقويم والمواعيد
            </TabsTrigger>
            <TabsTrigger value="policies" data-testid="tab-policies" className="gap-1">
              <Clock className="h-4 w-4" />
              سياسات الحجوزات
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings" className="gap-1">
              <Settings className="h-4 w-4" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-leads-title">الرسائل والاستفسارات</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-orders-title">سجل المبيعات والطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                <OrdersTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trials">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-trials-title">حجوزات الاستشارات والاجتماعات</CardTitle>
              </CardHeader>
              <CardContent>
                <TrialsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experts">
            <Card>
              <CardHeader>
                <CardTitle>طلبات الانضمام للفريق</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpertApplicationsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials">
            <Card>
              <CardHeader>
                <CardTitle>آراء العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <TestimonialsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <CardTitle>كوبونات الخصم</CardTitle>
              </CardHeader>
              <CardContent>
                <CouponsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>إدارة مواعيد العمل والتقويم</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle>سياسة الإلغاء والتعديل</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingPoliciesTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
