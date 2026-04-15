import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import type { LeadType } from "@shared/schema";
import { useSmartSearch } from "@/hooks/use-smart-search";

export function useLeadsData() {
  const { toast } = useToast();
  const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: leads = [], isLoading } = useQuery<LeadType[]>({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/leads");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await adminFetch(`/api/admin/leads/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({ title: "تم التحديث" });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminFetch(`/api/admin/leads/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({ title: "تم الحذف بنجاح" });
    },
  });

  const filteredLeads = useSmartSearch(leads, ['clientName', 'email', 'phone', 'companyName'], searchQuery);

  return {
    leads, isLoading, filteredLeads, searchQuery, setSearchQuery,
    selectedLead, setSelectedLead, updateStatus, deleteLeadMutation
  };
}
