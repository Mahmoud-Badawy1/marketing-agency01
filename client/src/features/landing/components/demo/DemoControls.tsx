import { Card } from "@/components/ui/card";
import { Target, Users } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface DemoControlsProps {
  adBudget: number;
  setAdBudget: (v: number) => void;
  customerValue: number;
  setCustomerValue: (v: number) => void;
  gradientDir: string;
}

export function DemoControls({ adBudget, setAdBudget, customerValue, setCustomerValue, gradientDir }: DemoControlsProps) {
  const { t } = useLanguage();
  return (
    <Card className="p-6 sm:p-8 border border-border shadow-xl bg-card/60 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-transparent pointer-events-none" />
      <div className="space-y-8 relative z-10">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />{t("demo.budget_label")}
            </label>
            <span className="text-lg font-bold text-accent font-mono" dir="ltr">{adBudget.toLocaleString()} {t("pricing.egp")}</span>
          </div>
          <input type="range" min="5000" max="100000" step="1000" value={adBudget}
            onChange={(e) => setAdBudget(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
            style={{ background: `linear-gradient(${gradientDir}, hsl(var(--accent)) ${(adBudget - 5000) / (100000 - 5000) * 100}%, hsl(var(--muted)) ${(adBudget - 5000) / (100000 - 5000) * 100}%)` }}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>5,000 {t("pricing.egp")}</span><span>100,000 {t("pricing.egp")}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />{t("demo.aov_label")}
            </label>
            <span className="text-lg font-bold text-primary font-mono" dir="ltr">{customerValue.toLocaleString()} {t("pricing.egp")}</span>
          </div>
          <input type="range" min="500" max="20000" step="500" value={customerValue}
            onChange={(e) => setCustomerValue(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            style={{ background: `linear-gradient(${gradientDir}, hsl(var(--primary)) ${(customerValue - 500) / (20000 - 500) * 100}%, hsl(var(--muted)) ${(customerValue - 500) / (20000 - 500) * 100}%)` }}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>500 {t("pricing.egp")}</span><span>20,000 {t("pricing.egp")}</span>
          </div>
        </div>
        <div className="pt-6 border-t border-border mt-6">
          <p className="text-xs text-muted-foreground leading-relaxed">{t("demo.note")}</p>
        </div>
      </div>
    </Card>
  );
}
