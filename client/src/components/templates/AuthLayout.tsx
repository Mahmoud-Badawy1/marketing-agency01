import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export default function AuthLayout({ children, title, description, icon }: AuthLayoutProps) {
  const { language } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center space-y-2">
          {icon && <div className="flex justify-center mb-2">{icon}</div>}
          <CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
          {description && <CardDescription className="text-base">{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
