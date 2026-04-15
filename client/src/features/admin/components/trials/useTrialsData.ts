import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import type { TrialBookingType } from "@shared/schema";
import { useSmartSearch } from "@/hooks/use-smart-search";

export function useTrialsData() {
  const { toast } = useToast();
  const [editingBooking, setEditingBooking] = useState<TrialBookingType | null>(null);
  const [cancelingBooking, setCancelingBooking] = useState<TrialBookingType | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [deletingBooking, setDeletingBooking] = useState<TrialBookingType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [editForm, setEditForm] = useState({
    status: "",
    meetingLink: "",
    adminNotes: "",
    scheduledTime: "",
    cancelReason: "",
  });

  const { data: bookings = [], isLoading } = useQuery<TrialBookingType[]>({
    queryKey: ["/api/admin/trial-bookings"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/trial-bookings");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await adminFetch(`/api/admin/trial-bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trial-bookings"] });
      setEditingBooking(null);
      toast({ title: "تم التحديث بنجاح" });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await adminFetch(`/api/admin/trial-bookings/${id}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trial-bookings"] });
      setCancelingBooking(null);
      setCancelReason("");
      toast({ title: "تم الإلغاء بنجاح" });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/trial-bookings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trial-bookings"] });
      setDeletingBooking(null);
      toast({ title: "تم الحذف بنجاح" });
    },
  });

  const filteredBookings = useSmartSearch(bookings, ['clientName', 'email', 'phone', 'companyName'], searchQuery);

  return {
    bookings, isLoading, filteredBookings, searchQuery, setSearchQuery,
    editingBooking, setEditingBooking,
    editForm, setEditForm,
    cancelingBooking, setCancelingBooking,
    cancelReason, setCancelReason,
    deletingBooking, setDeletingBooking,
    updateBookingMutation, cancelBookingMutation, deleteBookingMutation,
    toast
  };
}
