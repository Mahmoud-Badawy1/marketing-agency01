import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/admin";

export function useHubSpotSync() {
  const { toast } = useToast();
  const [showToken, setShowToken] = useState(false);
  const [syncPreview, setSyncPreview] = useState<any>(null);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchPreview = async () => {
    setIsFetchingPreview(true);
    try {
      const res = await adminFetch("/api/admin/hubspot/preview");
      if (res.ok) setSyncPreview(await res.json());
      else toast({ title: "Error", description: "Failed to fetch preview", variant: "destructive" });
    } catch {
      toast({ title: "Error", description: "Connection error", variant: "destructive" });
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const syncAll = async () => {
    setIsSyncing(true);
    try {
      const res = await adminFetch("/api/admin/hubspot/sync", { method: "POST" });
      if (res.ok) {
        toast({ title: "Success", description: "HubSpot sync completed" });
        setSyncPreview(null);
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.message || "Sync failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Connection error", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  return { showToken, setShowToken, syncPreview, fetchPreview, isFetchingPreview, syncAll, isSyncing };
}
