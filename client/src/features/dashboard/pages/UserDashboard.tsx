import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Settings, Calendar as CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/organisms/Navbar";

// Sub-components
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import OrdersTab from "@/features/dashboard/components/OrdersTab";
import ConsultationsTab from "@/features/dashboard/components/ConsultationsTab";
import AccountTab from "@/features/dashboard/components/AccountTab";

export default function UserDashboard() {
  const { t, language } = useLanguage();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("userToken");
    return { "Authorization": `Bearer ${token}` };
  };

  // 1. Fetch Profile Data
  const { data: profileData, isLoading: profileLoading, isError: profileError } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { headers: getAuthHeaders() });
      if (!res.ok) {
        localStorage.removeItem("userToken");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }
      return res.json();
    },
    retry: false,
  });

  // 2. Fetch Booking Policies
  const { data: bookingPolicies = {} } = useQuery({
    queryKey: ["/api/booking-policies"],
    queryFn: async () => {
      const res = await fetch("/api/booking-policies");
      if (!res.ok) return {};
      return res.json();
    },
  });

  if (profileLoading) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading..." })}</div>;
  }

  if (profileError || !profileData?.user) {
    return null; 
  }

  const user = profileData.user;

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <DashboardHeader userName={user.name} />

        <Tabs defaultValue="orders" dir={language === "ar" ? "rtl" : "ltr"}>
          <TabsList className="mb-6 bg-card border border-card-border p-1 overflow-x-auto h-auto min-w-full sm:min-w-0">
            <TabsTrigger value="orders" className="data-[state=active]:bg-accent data-[state=active]:text-white">
              <ShoppingBag className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
              {t({ ar: "الطلبات", en: "Orders" })}
            </TabsTrigger>
            <TabsTrigger value="trials" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <CalendarIcon className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
              {t({ ar: "الاستشارات", en: "Consultations" })}
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-muted-foreground data-[state=active]:text-white">
              <Settings className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
              {t({ ar: "الحساب", en: "Account" })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab getAuthHeaders={getAuthHeaders} bookingPolicies={bookingPolicies} />
          </TabsContent>

          <TabsContent value="trials">
            <ConsultationsTab getAuthHeaders={getAuthHeaders} bookingPolicies={bookingPolicies} />
          </TabsContent>

          <TabsContent value="profile">
            <AccountTab user={user} getAuthHeaders={getAuthHeaders} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
