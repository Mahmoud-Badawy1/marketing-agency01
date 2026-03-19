import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t, language } = useLanguage();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t({ ar: "الصفحة غير موجودة", en: "Page Not Found" })} - 404
          </h1>
          <p className="mt-2 text-sm text-gray-600 mb-6">
            {t({
              ar: "عذراً، هذه الصفحة غير موجودة أو تم نقلها.",
              en: "Sorry, this page does not exist or has been moved."
            })}
          </p>
          <Link href="/">
            <Button variant="default">
              {language === "en" ? <ArrowLeft className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              {t({ ar: "العودة للرئيسية", en: "Back to Home" })}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
