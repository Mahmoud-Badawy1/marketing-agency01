import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";

interface ExportButtonProps {
  onExport: () => Promise<void> | void;
  isLoading?: boolean;
  className?: string;
  label?: string;
}

export function ExportButton({ 
  onExport, 
  isLoading: externalLoading, 
  className,
  label = "تصدير إلى Excel"
}: ExportButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  const handleExport = async () => {
    setInternalLoading(true);
    try {
      await onExport();
    } finally {
      // Small timeout for better UX to show export happened
      setTimeout(() => setInternalLoading(false), 500);
    }
  };

  const isExporting = externalLoading || internalLoading;

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-2 ${className}`}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
      ) : (
        <FileDown className="h-4 w-4 text-green-600" />
      )}
      {label}
    </Button>
  );
}
