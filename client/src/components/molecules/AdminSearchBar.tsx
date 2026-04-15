import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Search, X } from "lucide-react";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
  totalCount?: number;
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder = "ابحث هنا...",
  resultCount,
  totalCount,
}: AdminSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center bg-card p-4 rounded-xl border shadow-sm gap-4">
      <div className="relative w-full sm:w-80 lg:w-96">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 w-full rounded-full bg-secondary/50 border-transparent focus-visible:ring-1 focus-visible:bg-background"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {resultCount !== undefined && totalCount !== undefined && (
        <div className="text-sm text-muted-foreground flex items-center bg-secondary/50 px-3 py-1.5 rounded-full">
          عرض {resultCount} من {totalCount} سجل
        </div>
      )}
    </div>
  );
}
