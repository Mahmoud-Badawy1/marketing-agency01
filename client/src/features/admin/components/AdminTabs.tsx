import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LeadsTab } from "./leads/LeadsTab";
import { OrdersTab } from "./orders/OrdersTab";
import { TrialsTab } from "./trials/TrialsTab";
import { TestimonialsTab } from "./testimonials/TestimonialsTab";
import { ExpertsTab } from "./experts/ExpertsTab";
import { CouponsTab } from "./coupons/CouponsTab";
import { SettingsTab } from "./settings/SettingsTab";
import { CalendarTab } from "./calendar/CalendarTab";
import { BookingPoliciesTab } from "./booking-policies/BookingPoliciesTab";
import { AdminTabsList } from "./AdminTabsList";

const PANELS = [
  { value: "leads", title: "الرسائل والاستفسارات", Component: LeadsTab },
  { value: "orders", title: "سجل المبيعات والطلبات", Component: OrdersTab },
  { value: "trials", title: "حجوزات الاستشارات والاجتماعات", Component: TrialsTab },
  { value: "experts", title: "طلبات الانضمام للفريق", Component: ExpertsTab },
  { value: "testimonials", title: "آراء العملاء", Component: TestimonialsTab },
  { value: "coupons", title: "كوبونات الخصم", Component: CouponsTab },
  { value: "calendar", title: "إدارة مواعيد العمل", Component: CalendarTab },
  { value: "policies", title: "سياسة الإلغاء والتعديل", Component: BookingPoliciesTab },
];

export function AdminTabs() {
  return (
    <Tabs defaultValue="leads" dir="rtl">
      <AdminTabsList />
      {PANELS.map(({ value, title, Component }) => (
        <TabsContent key={value} value={value}>
          <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent><Component /></CardContent></Card>
        </TabsContent>
      ))}
      <TabsContent value="settings"><SettingsTab /></TabsContent>
    </Tabs>
  );
}
