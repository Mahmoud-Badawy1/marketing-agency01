import { Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import type { TestimonialType } from "@shared/schema";

interface TestimonialRowProps {
  testimonial: TestimonialType;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function TestimonialRow({ testimonial: t, onEdit, onDelete, isDeleting }: TestimonialRowProps) {
  const getName = (val: any) => typeof val === 'string' ? val : (val?.ar || val?.en);
  const getRole = (val: any) => typeof val === 'string' ? val : (val?.ar || val?.en || "-");
  const getText = (val: any) => typeof val === 'string' ? val : (val?.ar || val?.en);

  return (
    <tr className="border-b">
      <td className="p-3">{getName(t.name)}</td>
      <td className="p-3 text-muted-foreground">{getRole(t.role)}</td>
      <td className="p-3">
        {t.whatsappImage ? (
          <a href={t.whatsappImage} target="_blank" rel="noopener noreferrer" className="block w-fit">
            <img src={t.whatsappImage} alt="whatsapp" className="w-12 h-16 object-cover rounded border hover:opacity-80 transition-opacity" />
          </a>
        ) : t.defaultText ? (
          <div className="text-[10px] text-muted-foreground max-w-[150px] line-clamp-3 italic bg-muted/30 p-1 rounded border border-dashed">
            {getText(t.defaultText)}
          </div>
        ) : <span className="text-muted-foreground">-</span>}
      </td>
      <td className="p-3">
        <Badge className={t.isActive !== false ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>
          {t.isActive !== false ? "مفعّل" : "معطّل"}
        </Badge>
      </td>
      <td className="p-3">
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={onEdit}><Edit3 className="h-4 w-4" /></Button>
          <Button size="sm" variant="outline" onClick={onDelete} disabled={isDeleting}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      </td>
    </tr>
  );
}
