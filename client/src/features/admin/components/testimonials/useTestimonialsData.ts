import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import type { TestimonialType } from "@shared/schema";
import { useSmartSearch } from "@/hooks/use-smart-search";

export function useTestimonialsData() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({ 
    name: { ar: "", en: "" }, 
    role: { ar: "", en: "" }, 
    whatsappImage: "", 
    defaultText: { ar: "", en: "" },
    isActive: true, 
    order: 0 
  });

  const { data: testimonials = [], isLoading } = useQuery<TestimonialType[]>({
    queryKey: ["/api/admin/testimonials"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/testimonials");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await adminFetch("/api/admin/testimonials", { method: "POST", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "تمت الإضافة بنجاح" });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await adminFetch(`/api/admin/testimonials/${id}`, { method: "PUT", body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "تم التحديث بنجاح" });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonials"] });
      toast({ title: "تم الحذف بنجاح" });
    },
  });

  const resetForm = () => {
    setFormData({ name: { ar: "", en: "" }, role: { ar: "", en: "" }, whatsappImage: "", defaultText: { ar: "", en: "" }, isActive: true, order: 0 });
    setImageFile(null); setImagePreview(""); setEditingId(null); setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredTestimonials = useSmartSearch(testimonials, ['name', 'role', 'defaultText'], searchQuery);

  return {
    testimonials, isLoading, filteredTestimonials, searchQuery, setSearchQuery,
    showForm, setShowForm, editingId, setEditingId,
    formData, setFormData, uploading, setUploading,
    imageFile, setImageFile, imagePreview, setImagePreview,
    fileInputRef, createMutation, updateMutation, deleteMutation,
    resetForm, toast
  };
}
