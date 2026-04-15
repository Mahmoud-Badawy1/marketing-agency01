import { ReactNode } from "react";
import { useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/organisms/Navbar";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
}

export default function DashboardLayout({ children, userName }: DashboardLayoutProps) {
  const { language } = useLanguage();
  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <DashboardHeader userName={userName} />
        {children}
      </main>
    </div>
  );
}
