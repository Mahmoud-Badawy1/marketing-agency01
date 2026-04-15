import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";

export function useJoinTeamForm() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    city: "",
    education: "",
    specialization: "",
    experienceYears: "",
    hasAgencyExperience: "",
    portfolioDetails: "",
    marketingTools: "",
    availableHours: "",
    motivation: "",
  });
  
  const [cvFile, setCvFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/expert-applications", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: t({ ar: "تم إرسال طلبك بنجاح!", en: "Application submitted successfully!" }),
        description: t({ ar: "سنراجع طلبك ونتواصل معك قريباً إن شاء الله", en: "We will review your application and contact you soon." }),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t({ ar: "حدث خطأ", en: "An error occurred" }),
        description: error.message || t({ ar: "يرجى المحاولة مرة أخرى أو التواصل معنا", en: "Please try again or contact us." }),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formDataToSend.append(key, value);
      }
    });
    if (cvFile) formDataToSend.append("cv", cvFile);
    mutation.mutate(formDataToSend);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: t({ ar: "نوع الملف غير مدعوم", en: "Unsupported file type" }),
          description: t({ ar: "يرجى رفع ملف PDF فقط", en: "Please upload a PDF file only" }),
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t({ ar: "حجم الملف كبير", en: "File too large" }),
          description: t({ ar: "يجب أن يكون حجم الملف أقل من 5 ميغابايت", en: "File size must be under 5MB" }),
          variant: "destructive",
        });
        return;
      }
      setCvFile(file);
    }
  };

  return {
    t, language,
    formData, setFormData,
    cvFile, setCvFile,
    fileInputRef,
    submitted, setSubmitted,
    mutation,
    handleSubmit,
    handleChange,
    handleFileChange
  };
}
