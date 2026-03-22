import { CheckCircle2 } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: string;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
              currentStep === s
                ? "bg-accent text-accent-foreground"
                : currentStepIndex > i
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-muted-foreground"
            }`}
            data-testid={`step-indicator-${i}`}
          >
            {currentStepIndex > i ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 rounded transition-colors ${currentStepIndex > i ? "bg-emerald-500" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
