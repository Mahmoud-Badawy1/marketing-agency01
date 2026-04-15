import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ExpertApplicationType } from "@shared/schema";

export function useExpertsData() {
  const { toast } = useToast();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  const { data: applications = [], isLoading } = useQuery<ExpertApplicationType[]>({
    queryKey: ["/api/admin/expert-applications"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/expert-applications");
      if (!res.ok) throw new Error("Failed to fetch expert applications");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await adminFetch(`/api/admin/expert-applications/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] }); toast({ title: "تم تحديث الحالة بنجاح" }); },
    onError: () => toast({ title: "خطأ", description: "فشل في تحديث حالة الطلب", variant: "destructive" }),
  });

  const updateNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const res = await adminFetch(`/api/admin/expert-applications/${id}/notes`, { method: "PUT", body: JSON.stringify({ adminNotes: notes }) });
      if (!res.ok) throw new Error("Failed to update notes");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] }); setEditingNotes(null); setNotesText(""); toast({ title: "تم تحديث الملاحظات بنجاح" }); },
    onError: () => toast({ title: "خطأ", description: "فشل في تحديث الملاحظات", variant: "destructive" }),
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/expert-applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete application");
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] }); toast({ title: "تم حذف الطلب بنجاح" }); },
    onError: () => toast({ title: "خطأ", description: "فشل في حذف الطلب", variant: "destructive" }),
  });

  const handleEditNotes = (id: string, currentNotes: string | null) => { setEditingNotes(id); setNotesText(currentNotes || ""); };
  const handleSaveNotes = (id: string) => updateNotes.mutate({ id, notes: notesText });
  const handleCancelEdit = () => { setEditingNotes(null); setNotesText(""); };

  return { applications, isLoading, updateStatus, updateNotes, deleteApplication, editingNotes, notesText, setNotesText, handleEditNotes, handleSaveNotes, handleCancelEdit };
}
