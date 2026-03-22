import { User } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface DashboardHeaderProps {
  userName: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
        <User className="w-6 h-6 text-accent" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t({ ar: "لوحة التحكم", en: "Dashboard" })}</h1>
        <p className="text-muted-foreground">{t({ ar: `مرحباً بك، ${userName}`, en: `Welcome, ${userName}` })}</p>
      </div>
    </div>
  );
}
