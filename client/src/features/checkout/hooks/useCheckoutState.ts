import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { usePublicSettings } from "@/hooks/use-public-settings";

export type Step = "form" | "payment" | "upload" | "success";
export interface ProjectEntry { name: string; budget: string; }

export function useCheckoutState() {
  const { t, language } = useLanguage();
  const [, params] = useRoute("/checkout/:plan");
  const { data: publicSettings } = usePublicSettings();
  const planKey = params?.plan || "monthly";
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("form");
  const [orderId, setOrderId] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [serviceInterest, setServiceInterest] = useState("");
  const [projects, setProjects] = useState<ProjectEntry[]>([{ name: "", budget: "" }]);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      if (!clientName) setClientName(user.name || "");
      if (!phone) setPhone(user.phone || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

  const createOrderMutation = useMutation({
    mutationFn: async (totalAmount: number) => {
      const servicesData = projects.map(p => ({ name: p.name, description: `Budget: ${p.budget}` }));
      const res = await apiRequest("POST", "/api/orders", {
        clientName, phone, email,
        projectName: projects[0].name,
        monthlyBudget: parseInt(projects[0].budget) || 0,
        companyName, serviceInterest,
        plan: planKey,
        amount: totalAmount,
        services: servicesData,
        couponCode: couponApplied?.code,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setOrderId(data._id || data.id);
      setStep("payment");
    },
    onError: () => {
      toast({ title: t({ ar: "خطأ", en: "Error" }), variant: "destructive" });
    },
  });

  const handleApplyCoupon = async (planKey: string) => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), planId: planKey, phone: phone || undefined, childrenCount: projects.length }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setCouponApplied(data);
        setCouponError("");
      } else {
        setCouponError(data.message || t({ ar: "كود غير صالح", en: "Invalid code" }));
        setCouponApplied(null);
      }
    } catch {
      setCouponError(t({ ar: "خطأ في التحقق", en: "Error validating" }));
    } finally { setCouponLoading(false); }
  };

  return {
    t, language, planKey, publicSettings,
    step, setStep, orderId, setOrderId,
    imagePreview, setImagePreview, imageFile, setImageFile, uploading, setUploading,
    clientName, setClientName, phone, setPhone, email, setEmail,
    companyName, setCompanyName, serviceInterest, setServiceInterest,
    projects, setProjects,
    couponCode, setCouponCode, couponApplied, setCouponApplied, couponError, setCouponError, couponLoading, setCouponLoading,
    copied, setCopied,
    fileInputRef, createOrderMutation, handleApplyCoupon
  };
}
