import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import type { OrderType } from "@shared/schema";
import { useSmartSearch } from "@/hooks/use-smart-search";

export function useOrdersData() {
  const { toast } = useToast();
  const [cancelOrderObj, setCancelOrderObj] = useState<OrderType | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [editPlanOrder, setEditPlanOrder] = useState<OrderType | null>(null);
  const [newPlan, setNewPlan] = useState("");
  const [newAmount, setNewAmount] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: orders = [], isLoading } = useQuery<OrderType[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await adminFetch(`/api/admin/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "تم التحديث" });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminFetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "تم الحذف بنجاح" });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await adminFetch(`/api/admin/orders/${id}/cancel`, { method: "PUT", body: JSON.stringify({ reason }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setCancelOrderObj(null); setCancelReason("");
      toast({ title: "تم الإلغاء" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, plan, amount }: { id: string; plan: string; amount: number }) => {
      await adminFetch(`/api/admin/orders/${id}/plan`, { method: "PUT", body: JSON.stringify({ plan, amount }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setEditPlanOrder(null);
      toast({ title: "تم التعديل" });
    },
  });

  const filteredOrders = useSmartSearch(orders, ['clientName', 'email', 'phone', 'plan', 'couponCode'], searchQuery);

  return {
    orders, isLoading, filteredOrders, searchQuery, setSearchQuery,
    cancelOrderObj, setCancelOrderObj, cancelReason, setCancelReason,
    editPlanOrder, setEditPlanOrder, newPlan, setNewPlan, newAmount, setNewAmount,
    updateStatus, cancelOrderMutation, updatePlanMutation, deleteOrderMutation
  };
}
