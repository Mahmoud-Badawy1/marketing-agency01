import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import type { ExpertApplicationType } from "@shared/schema";
import { useSmartSearch } from "@/hooks/use-smart-search";

export function useExpertApplications() {
  const { toast } = useToast();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: applications = [], isLoading } = useQuery<ExpertApplicationType[]>({
    queryKey: ["/api/admin/expert-applications"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/expert-applications");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await adminFetch(`/api/admin/expert-applications/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] });
      toast({ title: "تم تحديث الحالة" });
    },
  });

  const updateNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      await adminFetch(`/api/admin/expert-applications/${id}/notes`, { method: "PUT", body: JSON.stringify({ adminNotes: notes }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] });
      setEditingNotes(null);
      toast({ title: "تم تحديث الملاحظات" });
    },
  });

  const deleteApplication = useMutation({
    mutationFn: async (id: string) => {
      await adminFetch(`/api/admin/expert-applications/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/expert-applications"] });
      toast({ title: "تم الحذف بنجاح" });
    },
  });

  const filteredApplications = useSmartSearch(applications, ['fullName', 'email', 'phone', 'specialization'], searchQuery);

  return {
    applications, isLoading, filteredApplications, searchQuery, setSearchQuery,
    editingNotes, setEditingNotes, notesText, setNotesText,
    updateStatus, updateNotes, deleteApplication
  };
}
