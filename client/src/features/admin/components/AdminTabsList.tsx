import { MessageSquare, ShoppingCart, CalendarCheck, Settings, Users2, MessageCircle, Ticket, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB_CONFIG = [
  { value: "leads", icon: MessageSquare, label: "الرسائل" },
  { value: "orders", icon: ShoppingCart, label: "المبيعات" },
  { value: "trials", icon: CalendarCheck, label: "استشارات" },
  { value: "experts", icon: Users2, label: "الخبراء" },
  { value: "testimonials", icon: MessageCircle, label: "الآراء" },
  { value: "coupons", icon: Ticket, label: "الكوبونات" },
  { value: "calendar", icon: CalendarIcon, label: "التقويم" },
  { value: "policies", icon: Clock, label: "السياسات" },
  { value: "settings", icon: Settings, label: "الإعدادات" },
];

export function AdminTabsList() {
  return (
    <TabsList className="mb-4 flex-wrap gap-1">
      {TAB_CONFIG.map(({ value, icon: Icon, label }) => (
        <TabsTrigger key={value} value={value} className="gap-1">
          <Icon className="h-4 w-4" />{label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
