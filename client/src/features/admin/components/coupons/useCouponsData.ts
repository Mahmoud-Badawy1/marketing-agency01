import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import type { CouponType } from "@shared/schema";
import { useSmartSearch } from "@/hooks/use-smart-search";

export interface CouponFormData {
  code: string;
  description: { ar: string, en: string };
  discountType: "percentage" | "fixed";
  discountValue: number;
  applicablePlans: string[];
  startDate: string;
  endDate: string;
  maxTotalUses: number;
  maxUsesPerCustomer: number;
  maxSeats: number;
  isActive: boolean;
}

export const EMPTY_FORM: CouponFormData = {
  code: "",
  description: { ar: "", en: "" },
  discountType: "percentage",
  discountValue: 10,
  applicablePlans: [],
  startDate: "",
  endDate: "",
  maxTotalUses: 0,
  maxUsesPerCustomer: 0,
  maxSeats: 0,
  isActive: true,
};

export function generateCouponCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export function useCouponsData() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponType | null>(null);
  const [form, setForm] = useState<CouponFormData>(EMPTY_FORM);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: coupons = [], isLoading } = useQuery<CouponType[]>({
    queryKey: ["/api/admin/coupons"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: settings } = useQuery<Record<string, any>>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/settings");
      if (!res.ok) return [];
      const arr = await res.json();
      return arr.reduce((acc: any, s: any) => { acc[s.key] = s.value; return acc; }, {});
    },
  });

  const availablePlans: { id: string; name: string }[] = settings?.plans?.map((p: any) => ({
    id: p.id,
    name: p.name,
  })) || [
    { id: "monthly", name: "الباقة الشهرية" },
    { id: "genius", name: "باقة النخبة (إدارة متكاملة)" },
  ];

  const createMutation = useMutation({
    mutationFn: async (data: CouponFormData) => {
      const res = await adminFetch("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          discountValue: Number(data.discountValue),
          maxTotalUses: Number(data.maxTotalUses),
          maxUsesPerCustomer: Number(data.maxUsesPerCustomer),
          maxSeats: Number(data.maxSeats),
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          applicablePlans: data.applicablePlans.length > 0 ? data.applicablePlans : [],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "خطأ في إنشاء الكوبون");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "تم إنشاء الكوبون بنجاح" });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: (err: Error) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CouponFormData> }) => {
      const res = await adminFetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          discountValue: data.discountValue !== undefined ? Number(data.discountValue) : undefined,
          maxTotalUses: data.maxTotalUses !== undefined ? Number(data.maxTotalUses) : undefined,
          maxUsesPerCustomer: data.maxUsesPerCustomer !== undefined ? Number(data.maxUsesPerCustomer) : undefined,
          maxSeats: data.maxSeats !== undefined ? Number(data.maxSeats) : undefined,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "خطأ في تحديث الكوبون");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "تم تحديث الكوبون بنجاح" });
      setDialogOpen(false);
      setEditingCoupon(null);
      setForm(EMPTY_FORM);
    },
    onError: (err: Error) => {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("خطأ في حذف الكوبون");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "تم حذف الكوبون" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل حذف الكوبون", variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await adminFetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
    },
  });

  const filteredCoupons = useSmartSearch(coupons, ['code', 'description'], searchQuery);

  return {
    coupons, isLoading, filteredCoupons, searchQuery, setSearchQuery,
    dialogOpen, setDialogOpen,
    editingCoupon, setEditingCoupon,
    form, setForm,
    expandedId, setExpandedId,
    availablePlans,
    createMutation, updateMutation, deleteMutation, toggleActiveMutation,
    toast
  };
}
