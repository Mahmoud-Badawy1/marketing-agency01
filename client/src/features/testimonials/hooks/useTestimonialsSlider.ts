import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TestimonialType } from "@shared/schema";

const FALLBACK_TESTIMONIALS: TestimonialType[] = [
  { _id: "1", name: "مجموعة العليان", role: "شريك استراتيجي", whatsappImage: "", defaultText: { ar: "شراكة استراتيجية مثمرة ساهمت في تعزيز حضورنا الرقمي بشكل كبير وملحوظ في السوق السعودي.", en: "A fruitful strategic partnership that significantly enhanced our digital presence in the Saudi market." } },
  { _id: "2", name: "شركة تكامل", role: "عميل متميز", defaultText: { ar: "تعاون مثمر ", en: "Great cooperation." } },
  { _id: "3", name: "مؤسسة الأفق", role: "شريك نجاح", defaultText: { ar: "شراكة استراتيجية مثمرة ساهمت في تعزيز حضورنا الرقمي بشكل كبير وملحوظ في السوق السعودي.", en: "A fruitful strategic partnership that significantly enhanced our digital presence in the Saudi market." } },
];

export function useTestimonialsSlider() {
  const { data: testimonials = [] } = useQuery<TestimonialType[]>({
    queryKey: ["/api/testimonials"],
    queryFn: async () => {
      const res = await fetch("/api/testimonials");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const items = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  useEffect(() => {
    if (!api || items.length <= 1) return;
    const interval = setInterval(() => api.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [api, items.length]);

  return { items, api, setApi, current };
}
