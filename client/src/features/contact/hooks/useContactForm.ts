import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import type { AvailabilitySlotType } from "@shared/schema";

export function useContactForm() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("consultation");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    service: "",
    message: "",
    scheduledDate: undefined as Date | undefined,
    scheduledSlotId: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const { data: slots = [], isLoading: isLoadingSlots } = useQuery<AvailabilitySlotType[]>({
    queryKey: ["/api/availability/active", formData.scheduledDate ? format(formData.scheduledDate, "yyyy-MM-dd") : null],
    queryFn: async () => {
      if (!formData.scheduledDate) return [];
      const res = await fetch(`/api/availability/active?date=${format(formData.scheduledDate, "yyyy-MM-dd")}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!formData.scheduledDate,
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const isTrial = !!data.scheduledSlotId;
      const endpoint = isTrial ? "/api/trial-bookings" : "/api/leads";
      const payload = isTrial 
        ? {
            clientName: data.name, phone: data.phone, email: data.email,
            companyName: data.company || "", serviceInterest: data.service || "consultation",
            message: data.message || "", scheduledSlotId: data.scheduledSlotId,
          }
        : {
            clientName: data.name, phone: data.phone, email: data.email,
            companyName: data.company || "", serviceInterest: data.service || "inquiry",
            message: data.message || "",
          };
      return apiRequest("POST", endpoint, payload);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: t({ ar: "تم الإرسال بنجاح!", en: "Sent Successfully!" }),
        description: t({ 
          ar: formData.scheduledSlotId ? "تم حجز موعد الاستشارة، سنتواصل معك قريباً" : "شكراً لتواصلك معنا، سنرد على استفسارك قريباً", 
          en: formData.scheduledSlotId ? "Consultation booked, we will contact you shortly" : "Thank you for contacting us"
        }),
      });
    },
    onError: () => {
      toast({
        title: t({ ar: "حدث خطأ", en: "An Error Occurred" }),
        description: t({ ar: "يرجى المحاولة مرة أخرى أو التواصل عبر واتساب", en: "Please try again or contact via WhatsApp" }),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      toast({ title: t({ ar: "بيانات ناقصة", en: "Missing Data" }), variant: "destructive" });
      return;
    }
    mutation.mutate(formData);
  };

  return {
    t, language,
    activeTab, setActiveTab,
    formData, setFormData,
    submitted, setSubmitted,
    slots, isLoadingSlots,
    mutation, handleSubmit
  };
}
