import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import { Copy, Pencil, Trash2, TrendingUp, Clock, Tag, ChevronUp, ChevronDown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { CouponType } from "@shared/schema";

interface CouponCardProps {
  coupon: CouponType;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCopy: (code: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (val: boolean) => void;
}

export function CouponCard({
  coupon,
  isExpanded,
  onToggleExpand,
  onCopy,
  onEdit,
  onDelete,
  onToggleActive
}: CouponCardProps) {
  const getStatus = (c: CouponType) => {
    if (!c.isActive) return { label: "غير مفعّل", variant: "secondary" as const };
    const now = new Date();
    if (c.endDate && new Date(c.endDate) < now) return { label: "منتهي", variant: "destructive" as const };
    if (c.startDate && new Date(c.startDate) > now) return { label: "لم يبدأ", variant: "outline" as const };
    if (c.maxTotalUses > 0 && c.currentUses >= c.maxTotalUses) return { label: "مستنفد", variant: "destructive" as const };
    return { label: "نشط", variant: "default" as const };
  };

  const status = getStatus(coupon);

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <code className="text-lg font-bold font-mono tracking-wider text-foreground">{coupon.code}</code>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(coupon.code)}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          {coupon.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {/* @ts-ignore - description structure can be complex */}
              {typeof coupon.description === 'string' ? coupon.description : (coupon.description?.ar || coupon.description?.en)}
            </p>
          )}
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <span className="font-medium text-primary">
              {coupon.discountType === "percentage" ? `خصم ${coupon.discountValue}%` : `خصم ${coupon.discountValue} ج.م`}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> {coupon.currentUses}{coupon.maxTotalUses > 0 ? `/${coupon.maxTotalUses}` : ""} استخدام
            </span>
            {coupon.endDate && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> حتى {new Date(coupon.endDate).toLocaleDateString("ar-EG")}
              </span>
            )}
            {coupon.applicablePlans.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Tag className="h-3.5 w-3.5" /> {coupon.applicablePlans.length} باقات
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={coupon.isActive} onCheckedChange={onToggleActive} />
          <Button variant="ghost" size="icon" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>حذف الكوبون {coupon.code}؟</AlertDialogTitle>
                <AlertDialogDescription>هذا الإجراء لا يمكن التراجع عنه.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>حذف</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {coupon.usageLog.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={onToggleExpand}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            سجل الاستخدام ({coupon.usageLog.length})
          </button>
          {isExpanded && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {coupon.usageLog.map((log, i) => (
                <div key={i} className="text-xs flex items-center gap-3 p-2 rounded bg-muted/50">
                  <span className="font-mono">{log.phone || "—"}</span>
                  <span className="text-muted-foreground">{log.seatsUsed} {log.seatsUsed === 1 ? "طفل" : "أطفال"}</span>
                  <span className="text-muted-foreground mr-auto">{log.usedAt ? new Date(log.usedAt).toLocaleString("ar-EG") : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
