import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";

export function useDemoCalculator() {
  const { language } = useLanguage();
  const [adBudget, setAdBudget] = useState(15000);
  const [customerValue, setCustomerValue] = useState(2000);
  const [animatedResults, setAnimatedResults] = useState({ leads: 0, sales: 0, revenue: 0, roi: 0 });

  const assumedCPL = 150;
  const conversionRate = 0.10;
  const targetLeads = Math.floor(adBudget / assumedCPL);
  const targetSales = Math.floor(targetLeads * conversionRate);
  const targetRevenue = targetSales * customerValue;
  const targetRoi = adBudget > 0 ? Math.floor(((targetRevenue - adBudget) / adBudget) * 100) : 0;

  useEffect(() => {
    const duration = 500;
    const steps = 20;
    const stepTime = duration / steps;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setAnimatedResults({
        leads: Math.floor(animatedResults.leads + (targetLeads - animatedResults.leads) * progress),
        sales: Math.floor(animatedResults.sales + (targetSales - animatedResults.sales) * progress),
        revenue: Math.floor(animatedResults.revenue + (targetRevenue - animatedResults.revenue) * progress),
        roi: Math.floor(animatedResults.roi + (targetRoi - animatedResults.roi) * progress),
      });
      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedResults({ leads: targetLeads, sales: targetSales, revenue: targetRevenue, roi: targetRoi });
      }
    }, stepTime);
    return () => clearInterval(interval);
  }, [adBudget, customerValue, targetLeads, targetSales, targetRevenue, targetRoi]);

  const isRtl = language === "ar";
  const gradientDir = isRtl ? "to left" : "to right";

  return { adBudget, setAdBudget, customerValue, setCustomerValue, animatedResults, gradientDir };
}
