import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, Star, Link2, HelpCircle, BarChart3, UserCircle, BookOpen, AlertTriangle, Images } from "lucide-react";
import { SOCIAL_FIELDS, type SocialData } from "../settings/constants";
import type { SiteSettingType } from "@shared/schema";
import { BilingualInput, type BilingualText } from "../settings/BilingualInput";
import { BilingualTextarea } from "../settings/BilingualTextarea";
import { ImageUploadInput } from "../settings/ImageUploadInput";
import { WHY_CARDS, PROGRAMS, PRICING_PLANS, STATS, SUBJECTS } from "@/lib/constants";
import heroImage1 from "@assets/images/marketing_hero_1_1773563925795.png";
import heroImage2 from "@assets/images/marketing_hero_2_1773563941883.png";
import heroImage3 from "@assets/images/marketing_hero_3_1773563957738.png";
import instructorFallback from "@assets/IMG_20251001_222118_706_1771129139868.jpg";
import { fallbackImages } from "@/lib/fallbackImages";

export function SettingsTab() {
  const { toast } = useToast();
  const { data: rawSettings, isLoading } = useQuery<SiteSettingType[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
  const settings = Array.isArray(rawSettings) ? rawSettings : [];

  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value;

  // --- STATE DEFINITIONS ---
  const [decorationEnabled, setDecorationEnabled] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [instapay, setInstapay] = useState("");
  const [social, setSocial] = useState<SocialData>({});
  
  const [faqs, setFaqs] = useState<{ q: BilingualText; a: BilingualText }[]>([]);
  const [stats, setStats] = useState<{ value: string; label: BilingualText; color: string }[]>([]);
  const [instructorData, setInstructorData] = useState<any>({
    name: { ar: "", en: "" }, title: { ar: "", en: "" }, bio: { ar: "", en: "" }, quote: { ar: "", en: "" }, image: "", achievements: []
  });
  const [programsData, setProgramsData] = useState<any[]>([]);
  const [whyCards, setWhyCards] = useState<any[]>([]);
  const [galleryCards, setGalleryCards] = useState<any[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<any>({ visible: false });
  const [skillsCards, setSkillsCards] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [empowerSection, setEmpowerSection] = useState<any>({ stats: [] });
  const [heroSlides, setHeroSlides] = useState<any[]>([]);

  // --- DEFAULT VALUES ---
  const defaultInstructor = {
    name: { ar: "خبير ماركتير برو", en: "Marketer Pro Expert" },
    title: { ar: "خبير التسويق الرقمي وإدارة الحملات الإعلانية", en: "Digital Marketing & Ad Campaign Expert" },
    bio: { ar: "مدرب معتمد ومتخصص في التسويق الرقمي بخبرة عملية تتجاوز 10 سنوات. أدار حملات إعلانية بملايين الدولارات وحقق أعلى معدلات العائد على الاستثمار للعديد من العلامات التجارية الكبرى.", en: "Certified trainer and digital marketing specialist with over 10 years of practical experience. Managed multi-million dollar ad campaigns and achieved the highest ROI for many major brands." },
    quote: { ar: "ليس مجرد وكالة تسويقية... بل شريك حقيقي يضاعف مبيعاتك", en: "Not just a marketing agency... but a true partner that multiplies your sales" },
    badge: { ar: "خبير معتمد", en: "Certified Expert" },
    image: instructorFallback,
    achievements: [
      { label: { ar: "500+ عميل ناجح", en: "500+ Successful Clients" }, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
      { label: { ar: "إدارة ميزانيات ضخمة", en: "Managing Huge Budgets" }, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    ]
  };

  const defaultSocial: SocialData = {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    tiktok: "https://tiktok.com",
  };

  const defaultFaqs = [
    { q: { ar: "هل الكورسات مناسبة للمبتدئين؟", en: "Are the courses suitable for beginners?" }, a: { ar: "نعم، الكورسات تبدأ معك من الصفر وتتدرج إلى الاحتراف.", en: "Yes, the courses start from scratch and progress to professional levels." } },
    { q: { ar: "كيف يمكنني حجز استشارة؟", en: "How can I book a consultation?" }, a: { ar: "يمكنك التواصل معنا عبر نموذج الاتصال أو واتساب.", en: "You can contact us via the contact form or WhatsApp." } }
  ];

  const defaultGallery = [
    {
      badge: { ar: "قصة نجاح", en: "Success Story" },
      badgeColor: "bg-accent",
      title: { ar: "إطلاق حملة تسويقية ناجحة", en: "Successful Marketing Campaign" },
      description: { ar: "حققنا زيادة في المبيعات بنسبة 300% لعملائنا في قطاع التجزئة", en: "Achieved a 300% sales increase for our retail clients." },
      image: fallbackImages.gallery1,
    },
    {
      badge: { ar: "ورشة عمل", en: "Workshop" },
      badgeColor: "bg-primary",
      title: { ar: "التسويق عبر منصات التواصل", en: "Social Media Marketing" },
      description: { ar: "ورشة تفاعلية متقدمة عن أحدث الاستراتيجيات", en: "Advanced interactive workshop on the latest strategies." },
      image: fallbackImages.gallery2,
    },
    {
      badge: { ar: "دراسة حالة", en: "Case Study" },
      badgeColor: "bg-emerald-500",
      title: { ar: "مضاعفة العائد على الإعلانات", en: "Multiplying ROAS" },
      description: { ar: "كيف رفعنا الـ ROAS لمتجر أزياء محلي بـ 5 أضعاف", en: "How we increased ROAS for a local fashion store by 5x." },
      image: fallbackImages.gallery3,
    },
    {
      badge: { ar: "تدريب عملي", en: "Practical Training" },
      badgeColor: "bg-blue-500",
      title: { ar: "تجهيز المسوقين للعمل الحر", en: "Preparing Marketers for Freelancing" },
      description: { ar: "ساعدنا أكثر من ١٠٠ مسوق في البدء بمسارهم المهني الخاص", en: "We helped over 100 marketers start their own professional career." },
      image: fallbackImages.gallery4,
    }
  ];

  const defaultEvent = {
    visible: true,
    badge: { ar: "قريباً جداً", en: "Coming Very Soon" },
    title: { ar: "معسكر التسويق المكثف", en: "Intensive Marketing Bootcamp" },
    date: { ar: "١٥ أكتوبر ٢٠٢٤", en: "October 15, 2024" },
    description: { ar: "انضم إلينا في معسكر تدريبي عملي لمدة ٣ أيام لاحتراف إطلاق الحملات الإعلانية على مختلف المنصات.", en: "Join us for an intensive 3-day bootcamp to master launching ad campaigns on various platforms." },
    backgroundImage: ""
  };

  const defaultSkills = [
    { 
      title: { ar: "استراتيجيات تبني علامة تجارية قوية", en: "Strategies that build a strong brand" }, 
      description: { ar: "نساعدك في بناء حضور رقمي قوي لشركتك", en: "We help you build a strong digital presence for your company" }, 
      buttonText: { ar: "احجز استشارة", en: "Book Consultation" }, 
      imageKey: "gallery1",
      image: "" 
    },
    { 
      title: { ar: "نضاعف مبيعاتك بخطوات مدروسة", en: "Multiply Your Sales with Calculated Steps" }, 
      description: { ar: "نلهمك لتوسيع نطاق أعمالك وتحقيق أهدافك", en: "We inspire you to expand your business scope and achieve your goals" }, 
      buttonText: { ar: "اعرف خدماتنا", en: "Discover Our Services" }, 
      imageKey: "gallery3",
      image: "" 
    }
  ];

  const defaultEmpower = {
    subtitle: { ar: "نحن هنا لنجاحك", en: "We are here for your success" },
    title: { ar: "مكّن علامتك التجارية لتنمو بشكل", en: "Empower your brand to grow" },
    titleHighlight: { ar: "أسرع وأقوى", en: "faster & stronger" },
    description: { 
      ar: "نحن نساعدك في بناء حضور رقمي استثنائي، الوصول إلى جمهورك المستهدف، وتحقيق أرباح مضاعفة. مع ماركتير برو، مستقبلك أفضل",
      en: "We help you build an exceptional digital presence, reach your target audience, and double your profits. With Marketer Pro, your future is brighter"
    },
    ctaText: { ar: "ابدأ حملتك اليوم", en: "Start Your Campaign Today" },
    stats: [
      { value: "50M+", label: { ar: "وصول للحملات الإعلانية", en: "Ad Campaign Reach" }, iconType: "check", iconColor: "text-emerald-400" },
      { value: "20+", label: { ar: "دولة نخدم عملاءها", en: "Countries Served" }, iconType: "globe", iconColor: "text-accent" },
    ],
  };
  
  const defaultWhyCards = [
    {
      title: { ar: "هل تعاني من ضعف المبيعات؟", en: "Are you suffering from low sales?" },
      description: { ar: "الكثير من أصحاب الأعمال والمسوقين يواجهون صعوبة في الوصول للجمهور المستهدف وتحقيق مبيعات حقيقية.", en: "Many business owners and marketers struggle to reach their target audience and achieve real sales." },
      type: "problem"
    },
    {
      title: { ar: "استراتيجيات تسويقية مثبتة", en: "Proven Marketing Strategies" },
      description: { ar: "نقدم لك دورات واستشارات مبنية على خبرة عملية في السوق لضمان تحقيق أفضل النتائج.", en: "We offer courses and consultations based on practical market experience to ensure the best results." },
      type: "solution"
    },
    {
      title: { ar: "نمو ومبيعات مستدامة", en: "Sustainable Growth & Sales" },
      description: { ar: "النتيجة: تحسن ملحوظ في المبيعات، بناء علامة تجارية قوية، وعائد استثمار مضاعف.", en: "The result: significant improvement in sales, building a strong brand, and multiplied ROI." },
      type: "result"
    }
  ];

  const defaultPrograms = [
    {
      level: { ar: "المستوى الأساسي", en: "Basic Level" },
      title: { ar: "أساسيات التسويق", en: "Marketing Fundamentals" },
      subtitle: { ar: "فهم السوق والجمهور", en: "Understanding Market & Audience" },
      description: { ar: "بناء الأساس الصحيح للتسويق الرقمي وإدارة السوشيال ميديا", en: "Building the right foundation for digital marketing and social media management" },
      age: { ar: "للمبتدئين", en: "For Beginners" },
      color: "from-blue-400 to-blue-600"
    },
    {
      level: { ar: "المستوى المتقدم", en: "Advanced Level" },
      title: { ar: "إدارة الحملات الإعلانية", en: "Ad Campaign Management" },
      subtitle: { ar: "فيسبوك، انستجرام، وجوجل", en: "Facebook, Instagram, & Google" },
      description: { ar: "احتراف إطلاق الحملات الإعلانية وتحليل البيانات", en: "Mastering launching ad campaigns and data analysis" },
      age: { ar: "للمتوسطين", en: "For Intermediates" },
      color: "from-indigo-400 to-indigo-600"
    },
    {
      level: { ar: "التمكين الرقمي", en: "Digital Empowerment" },
      title: { ar: "استراتيجيات النمو", en: "Growth Strategies" },
      subtitle: { ar: "تحسين الأداء وضبط العائد", en: "Performance Optimization & ROI" },
      description: { ar: "تعلم كيف تضاعف مبيعاتك وتدير فريقاً تسويقياً ناجحاً", en: "Learn how to multiply your sales and manage a successful marketing team" },
      age: { ar: "للمحترفين", en: "For Professionals" },
      color: "from-purple-400 to-purple-600"
    }
  ];

  const defaultHero = [
    {
      title: { ar: "أتقن مهارات مسوقي المستقبل", en: "Master the skills of future marketers" },
      highlight: { ar: "مع الخبراء", en: "with experts" },
      subtitle: { ar: "انضم إلى برنامج الدبلوم الشامل في التسويق الرقمي وابدأ رحلتك في عالم الأعمال", en: "Join the comprehensive digital marketing diploma and begin your journey..." },
      mediaUrl: heroImage1
    },
    {
      title: { ar: "إدارة حملات احترافية", en: "Professional Campaign Management" },
      highlight: { ar: "نتائج حقيقية", en: "Real Results" },
      subtitle: { ar: "تعلم كيف تطلق حملاتك وتحقق أعلى عائد على الاستثمار", en: "Learn how to launch your campaigns and achieve the highest ROI" },
      mediaUrl: heroImage2
    },
    {
      title: { ar: "بناء علامة تجارية قوية", en: "Building a Strong Brand" },
      highlight: { ar: "تميز في السوق", en: "Excel in the Market" },
      subtitle: { ar: "استراتيجيات متكاملة لبناء هوية رقمية فريدة تلتصق بالأذهان", en: "Integrated strategies to build a unique digital identity that sticks" },
      mediaUrl: heroImage3
    }
  ];

  // --- INITIALIZATION ---
  useEffect(() => {
    if (isLoading || !settings) return;

    setDecorationEnabled(getSetting("decoration")?.enabled || false);
    
    const loadedPlans = getSetting("plans");
    setPlans(loadedPlans?.length ? loadedPlans : PRICING_PLANS);
    
    setWhatsapp(getSetting("contact")?.whatsapp || "+201007673634");
    setInstapay(getSetting("contact")?.instapay || "instapay@example");
    
    const loadedSocial = getSetting("social");
    setSocial(Object.keys(loadedSocial || {}).length ? loadedSocial : defaultSocial);
    
    const loadedFaqs = getSetting("faqs");
    setFaqs(loadedFaqs?.length ? loadedFaqs : defaultFaqs);
    
    const loadedStats = getSetting("stats");
    setStats(loadedStats?.length ? loadedStats : STATS);

    setInstructorData(getSetting("instructor") || defaultInstructor);
    
    const loadedPrograms = getSetting("programs");
    setProgramsData(loadedPrograms?.length ? loadedPrograms : defaultPrograms);

    const loadedWhyCards = getSetting("why_cards");
    setWhyCards(loadedWhyCards?.length ? loadedWhyCards : defaultWhyCards);

    const loadedGallery = getSetting("gallery_cards");
    setGalleryCards(loadedGallery?.length ? loadedGallery : defaultGallery);
    
    setUpcomingEvent(getSetting("upcoming_event") || defaultEvent);
    
    const loadedSkills = getSetting("skills_cards");
    setSkillsCards(loadedSkills?.length ? loadedSkills : defaultSkills);
    
    const loadedSubjects = getSetting("subjects");
    setSubjects(loadedSubjects?.length ? loadedSubjects : SUBJECTS);
    
    setEmpowerSection(getSetting("empower_section") || defaultEmpower);
    
    const loadedHero = getSetting("hero_slides");
    setHeroSlides(loadedHero?.length ? loadedHero : defaultHero);

  }, [isLoading, settings]);

  // --- SAVING LOGIC ---
  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const res = await adminFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to save " + key);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "تم الحفظ بنجاح / Saved Successfully" });
    },
    onError: () => {
      toast({ title: "خطأ / Error", variant: "destructive" });
    },
  });

  const handleSave = (key: string, value: any) => saveSetting.mutate({ key, value });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <Accordion type="multiple" className="w-full space-y-6">
      {/* 1. Hero Slides */}
      <AccordionItem value="item-1HeroSlides" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2"><Images className="h-5 w-5"/> شرائح قسم البداية (Hero)</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setHeroSlides(p => [...p, { title: {ar:"", en:""}, highlight: {ar:"", en:""}, subtitle: {ar:"", en:""}, mediaUrl: "" }])}>
            <Plus className="h-4 w-4 ml-1" /> إضافة شريحة
          </Button>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          {heroSlides.map((slide, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">شريحة {i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => setHeroSlides(p => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <BilingualInput label="العنوان الرئيسي" value={slide.title} onChange={v => setHeroSlides(p => p.map((s, idx) => idx === i ? {...s, title: v} : s))} />
              <BilingualInput label="الكلمة المميزة (التي تظهر بلون مختلف)" value={slide.highlight} onChange={v => setHeroSlides(p => p.map((s, idx) => idx === i ? {...s, highlight: v} : s))} />
              <BilingualTextarea label="العنوان الفرعي" value={slide.subtitle} onChange={v => setHeroSlides(p => p.map((s, idx) => idx === i ? {...s, subtitle: v} : s))} />
              <div className="pt-2">
                <ImageUploadInput label="صورة/فيديو الشريحة" value={slide.mediaUrl} onChange={url => setHeroSlides(p => p.map((s, idx) => idx === i ? {...s, mediaUrl: url} : s))} />
              </div>
            </div>
          ))}
          <Button className="w-full" onClick={() => handleSave("hero_slides", heroSlides)} disabled={saveSetting.isPending}>حفظ التعديلات</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 2. Instructor Details */}
      <AccordionItem value="item-2InstructorDeta" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2"><UserCircle className="h-5 w-5"/> ملف المدرب (Instructor)</CardTitle>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          <ImageUploadInput label="صورة المدرب الشخصية" value={instructorData.image} onChange={url => setInstructorData((p:any) => ({...p, image: url}))} />
          <BilingualInput label="الشارة (Badge)" value={instructorData.badge} onChange={v => setInstructorData((p:any) => ({...p, badge: v}))} />
          <BilingualInput label="اسم المدرب" value={instructorData.name} onChange={v => setInstructorData((p:any) => ({...p, name: v}))} />
          <BilingualInput label="المسمى الوظيفي" value={instructorData.title} onChange={v => setInstructorData((p:any) => ({...p, title: v}))} />
          <BilingualTextarea label="نبذة تعريفية" value={instructorData.bio} onChange={v => setInstructorData((p:any) => ({...p, bio: v}))} />
          <BilingualInput label="اقتباس مأثور" value={instructorData.quote} onChange={v => setInstructorData((p:any) => ({...p, quote: v}))} />
          
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label className="font-bold">الإنجازات المرفقة (شريطان بجوار الصورة)</Label>
              <Button size="sm" variant="outline" onClick={() => setInstructorData((p:any) => ({...p, achievements: [...(p.achievements||[]), {label: {ar:"", en:""}, color: "text-blue-500"}]}))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {instructorData.achievements?.map((a:any, i:number) => (
              <div key={i} className="flex gap-2 items-start border p-3 rounded-md bg-muted/10">
                <div className="flex-1">
                  <BilingualInput label={`إنجاز ${i+1}`} value={a.label} onChange={v => setInstructorData((p:any) => { const ach = [...p.achievements]; ach[i].label = v; return {...p, achievements: ach}; })} />
                </div>
                <Button variant="ghost" size="icon" className="mt-8" onClick={() => setInstructorData((p:any) => ({...p, achievements: p.achievements.filter((_:any, idx:number) => idx !== i)}))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={() => handleSave("instructor", instructorData)} disabled={saveSetting.isPending}>حفظ التعديلات</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 3. Why Us Cards & Programs - Defaulting to constants if empty */}
      <AccordionItem value="item-3WhyUsCardsProg" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/> بطاقات (لماذا نحن / Why Us)</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setWhyCards(p => [...p, { title: {ar:"", en:""}, description: {ar:"", en:""}, type: "solution" }])}>
             <Plus className="h-4 w-4 ml-1" /> إضافة بطاقة
          </Button>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          {whyCards.map((card, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4 relative">
              <Button variant="ghost" size="icon" className="absolute left-2 top-2" onClick={() => setWhyCards(p => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              <BilingualInput label="العنوان" value={card.title} onChange={v => setWhyCards(p => p.map((c, idx) => idx === i ? {...c, title: v} : c))} />
              <BilingualTextarea label="الوصف" value={card.description} onChange={v => setWhyCards(p => p.map((c, idx) => idx === i ? {...c, description: v} : c))} />
            </div>
          ))}
          <Button className="w-full" onClick={() => handleSave("why_cards", whyCards)} disabled={saveSetting.isPending}>حفظ التعديلات</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-982362" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5"/> البرامج والدورات (Programs)</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setProgramsData(p => [...p, { title: {ar:"", en:""}, level: {ar:"", en:""}, description: {ar:"", en:""} }])}>
             <Plus className="h-4 w-4 ml-1" /> إضافة برنامج
          </Button>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          {programsData.map((prog, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4 relative">
              <Button variant="ghost" size="icon" className="absolute left-2 top-2" onClick={() => setProgramsData(p => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              <BilingualInput label="اسم البرنامج" value={prog.title} onChange={v => setProgramsData(p => p.map((c, idx) => idx === i ? {...c, title: v} : c))} />
              <BilingualInput label="المستوى" value={prog.level} onChange={v => setProgramsData(p => p.map((c, idx) => idx === i ? {...c, level: v} : c))} />
              <BilingualInput label="العنوان الفرعي" value={prog.subtitle} onChange={v => setProgramsData(p => p.map((c, idx) => idx === i ? {...c, subtitle: v} : c))} />
              <BilingualTextarea label="الوصف" value={prog.description} onChange={v => setProgramsData(p => p.map((c, idx) => idx === i ? {...c, description: v} : c))} />
            </div>
          ))}
          <Button className="w-full" onClick={() => handleSave("programs", programsData)} disabled={saveSetting.isPending}>حفظ التعديلات</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 4. Gallery & Portfolio Cards */}
      <AccordionItem value="item-4GalleryPortfol" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2"><Images className="h-5 w-5"/> معرض الأعمال / القصص (Gallery)</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setGalleryCards(p => [...p, { title: {ar:"", en:""}, description: {ar:"", en:""}, image: "" }])}>
             <Plus className="h-4 w-4 ml-1" /> إضافة بطاقة
          </Button>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          {galleryCards.map((card, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4">
               <div className="flex justify-between items-center mb-2">
                <span className="font-bold">بطاقة {i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => setGalleryCards(p => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <ImageUploadInput label="صورة العمل/المعرض" value={card.image} onChange={url => setGalleryCards(p => p.map((c, idx) => idx === i ? {...c, image: url} : c))} />
              <BilingualInput label="الشارة البيضاوية (Badge)" value={card.badge} onChange={v => setGalleryCards(p => p.map((c, idx) => idx === i ? {...c, badge: v} : c))} />
              <BilingualInput label="عنوان البطاقة" value={card.title} onChange={v => setGalleryCards(p => p.map((c, idx) => idx === i ? {...c, title: v} : c))} />
              <BilingualTextarea label="الوصف المستتر" value={card.description} onChange={v => setGalleryCards(p => p.map((c, idx) => idx === i ? {...c, description: v} : c))} />
            </div>
          ))}
          <Button className="w-full" onClick={() => handleSave("gallery_cards", galleryCards)} disabled={saveSetting.isPending}>حفظ التعديلات</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 5. Pricing Plans */}
      <AccordionItem value="item-5PricingPlans" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle>باقات التسعير (Pricing Plans)</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setPlans(p => [...p, { name: {ar:"", en:""}, price: "0", features: [] }])}>
            <Plus className="h-4 w-4 ml-1" /> إضافة باقة
          </Button>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          {plans.map((plan, pi) => (
            <div key={pi} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">باقة {pi+1}</h3>
                <Button variant="destructive" size="sm" onClick={() => setPlans(p => p.filter((_, i) => i !== pi))}><Trash2 className="h-4 w-4"/></Button>
              </div>
              <BilingualInput label="اسم الباقة" value={plan.name} onChange={v => setPlans(p => p.map((c, idx) => idx === pi ? {...c, name: v} : c))} />
              <BilingualInput label="المدة (مثال: شهرياً)" value={plan.period} onChange={v => setPlans(p => p.map((c, idx) => idx === pi ? {...c, period: v} : c))} />
              <div className="space-y-2">
                <Label>السعر رقماً</Label>
                <Input type="number" value={plan.price} onChange={e => setPlans(p => p.map((c, idx) => idx === pi ? {...c, price: e.target.value} : c))} />
              </div>
              
              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <Label>المميزات (Features)</Label>
                  <Button size="sm" variant="outline" onClick={() => setPlans(p => p.map((c, idx) => idx === pi ? {...c, features: [...(c.features||[]), {ar:"", en:""}]} : c))}>إضافة ميزة</Button>
                </div>
                {plan.features?.map((feat: any, fi: number) => (
                   <div key={fi} className="flex gap-2 items-center mb-2">
                     <div className="flex-1"><BilingualInput label={`ميزة ${fi + 1}`} value={feat} onChange={v => setPlans(p => { const newP = [...p]; newP[pi].features[fi] = v; return newP; })} /></div>
                     <Button variant="ghost" size="icon" onClick={() => setPlans(p => { const newP = [...p]; newP[pi].features = newP[pi].features.filter((_:any, index:number) => index !== fi); return newP; })}><Trash2 className="h-4 w-4"/></Button>
                   </div>
                ))}
              </div>
            </div>
          ))}
          <Button className="w-full" onClick={() => handleSave("plans", plans)} disabled={saveSetting.isPending}>حفظ الباقات</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 6. Settings and Contact */}
      <AccordionItem value="item-6SettingsandCon" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">
<CardTitle><Link2 className="inline mr-2 h-5 w-5"/> الإعدادات العامة</CardTitle>
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-4">

          <div className="space-y-4 p-4 border rounded-lg bg-card/50">
            <h3 className="font-bold">التواصل المباشر</h3>
            <Input placeholder="رقم الواتساب..." dir="ltr" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            <Input placeholder="حساب انستاباي..." dir="ltr" value={instapay} onChange={e => setInstapay(e.target.value)} />
            <Button onClick={() => handleSave("contact", {whatsapp, instapay})}>حفظ التواصل</Button>
          </div>

          <div className="space-y-4 p-4 border rounded-lg bg-card/50">
            <h3 className="font-bold">منصات التواصل الاجتماعي</h3>
            {SOCIAL_FIELDS.map(f => (
              <Input key={f.key} placeholder={f.placeholder} dir="ltr" value={social[f.key] || ""} onChange={e => setSocial(p => ({...p, [f.key]: e.target.value}))} />
            ))}
            <Button onClick={() => handleSave("social", social)} disabled={saveSetting.isPending}>حفظ الروابط</Button>
          </div>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 7. FAQs */}
      <AccordionItem value="item-7FAQs" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5"/> الأسئلة الشائعة</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setFaqs(p => [...p, { q: {ar:"", en:""}, a: {ar:"", en:""} }])}>
            <Plus className="h-4 w-4 ml-1" /> إضافة سؤال
          </Button>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          {faqs.map((faq, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4 relative">
              <Button variant="ghost" size="icon" className="absolute left-2 top-2" onClick={() => setFaqs(p => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              <BilingualInput label="السؤال" value={faq.q} onChange={v => setFaqs(p => p.map((c, idx) => idx === i ? {...c, q: v} : c))} />
              <BilingualTextarea label="الإجابة" value={faq.a} onChange={v => setFaqs(p => p.map((c, idx) => idx === i ? {...c, a: v} : c))} />
            </div>
          ))}
          <Button className="w-full" onClick={() => handleSave("faqs", faqs)} disabled={saveSetting.isPending}>حفظ الأسئلة</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 8. Stats */}
      <AccordionItem value="item-8Stats" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5"/> الإحصائيات</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setStats(p => [...p, { value: "", label: {ar:"", en:""}, color: "bg-accent" }])}>
            <Plus className="h-4 w-4 ml-1" /> إضافة إحصائية
          </Button>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          {stats.map((stat, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">إحصائية {i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => setStats(p => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <Label>القيمة الرقمية (مثال 500+)</Label>
              <Input value={stat.value} dir="ltr" onChange={e => setStats(p => p.map((c, idx) => idx === i ? {...c, value: e.target.value} : c))} />
              <BilingualInput label="نص الإحصائية" value={stat.label} onChange={v => setStats(p => p.map((c, idx) => idx === i ? {...c, label: v} : c))} />
              <Label>اللون الكودي (Tailwind)</Label>
              <Input value={stat.color} dir="ltr" onChange={e => setStats(p => p.map((c, idx) => idx === i ? {...c, color: e.target.value} : c))} />
            </div>
          ))}
          <Button className="w-full" onClick={() => handleSave("stats", stats)} disabled={saveSetting.isPending}>حفظ الإحصائيات</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 9. Upcoming Event */}
      <AccordionItem value="item-9UpcomingEvent" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle>الفعالية القادمة</CardTitle>
          <div className="flex items-center gap-2">
            <Label>مُفعل؟</Label>
            <input type="checkbox" onClick={(e) => e.stopPropagation()}  checked={upcomingEvent.visible} onChange={e => setUpcomingEvent((p:any) => ({...p, visible: e.target.checked}))} className="w-4 h-4" />
          </div>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          <BilingualInput label="الشارة (Badge)" value={upcomingEvent.badge} onChange={v => setUpcomingEvent((p:any) => ({...p, badge: v}))} />
          <BilingualInput label="عنوان الفعالية" value={upcomingEvent.title} onChange={v => setUpcomingEvent((p:any) => ({...p, title: v}))} />
          <BilingualInput label="التاريخ الزمني" value={upcomingEvent.date} onChange={v => setUpcomingEvent((p:any) => ({...p, date: v}))} />
          <BilingualTextarea label="الوصف" value={upcomingEvent.description} onChange={v => setUpcomingEvent((p:any) => ({...p, description: v}))} />
          <ImageUploadInput label="صورة خلفية الفعالية" value={upcomingEvent.backgroundImage} onChange={url => setUpcomingEvent((p:any) => ({...p, backgroundType: "image", backgroundImage: url}))} />
          <Button className="w-full" onClick={() => handleSave("upcoming_event", upcomingEvent)} disabled={saveSetting.isPending}>حفظ الفعالية</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 10. Skills Cards */}
      <AccordionItem value="item-10SkillsCards" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle>بطاقات المهارات المكتسبة</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setSkillsCards(p => [...p, { title: {ar:"", en:""}, description: {ar:"", en:""}, buttonText: {ar:"", en:""}, image: "" }])}>
            <Plus className="h-4 w-4 ml-1" /> إضافة بطاقة مهارة
          </Button>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          {skillsCards.map((card, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">بطاقة مهارة {i + 1}</span>
                <Button variant="ghost" size="icon" onClick={() => setSkillsCards(p => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
              <ImageUploadInput label="الصورة المصغرة للمهارة" value={card.image} onChange={url => setSkillsCards(p => p.map((c, idx) => idx === i ? {...c, image: url} : c))} />
              <BilingualInput label="عنوان المهارة" value={card.title} onChange={v => setSkillsCards(p => p.map((c, idx) => idx === i ? {...c, title: v} : c))} />
              <BilingualTextarea label="الوصف" value={card.description} onChange={v => setSkillsCards(p => p.map((c, idx) => idx === i ? {...c, description: v} : c))} />
              <BilingualInput label="نص الزر" value={card.buttonText} onChange={v => setSkillsCards(p => p.map((c, idx) => idx === i ? {...c, buttonText: v} : c))} />
            </div>
          ))}
          <Button className="w-full" onClick={() => handleSave("skills_cards", skillsCards)} disabled={saveSetting.isPending}>حفظ البطاقات</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 11. Subjects */}
      <AccordionItem value="item-11Subjects" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle>المواد الدراسية</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setSubjects(p => [...p, { title: {ar:"", en:""}, grade: {ar:"", en:""} }])}>
            <Plus className="h-4 w-4 ml-1" /> إضافة مادة
          </Button>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          {subjects.map((sub, i) => (
            <div key={i} className="border p-4 rounded-lg bg-card/50 space-y-4 relative">
              <Button variant="ghost" size="icon" className="absolute left-2 top-2" onClick={() => setSubjects(p => p.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              <BilingualInput label="اسم المادة" value={sub.title} onChange={v => setSubjects(p => p.map((c, idx) => idx === i ? {...c, title: v} : c))} />
              <BilingualInput label="المرحلة (Grade)" value={sub.grade} onChange={v => setSubjects(p => p.map((c, idx) => idx === i ? {...c, grade: v} : c))} />
            </div>
          ))}
          <Button className="w-full" onClick={() => handleSave("subjects", subjects)} disabled={saveSetting.isPending}>حفظ المواد</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>

      {/* 12. Empower Section */}
      <AccordionItem value="item-12EmpowerSectio" className="bg-card border shadow-sm rounded-lg overflow-hidden">
        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors">
          <div className="flex-1 text-start">
            <CardHeader className="  flex flex-row items-center justify-between">

          <CardTitle>قسم التمكين (Empower Section)</CardTitle>
        
            </CardHeader>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <CardContent className="space-y-6">

          <BilingualInput label="العنوان الفرعي" value={empowerSection.subtitle} onChange={v => setEmpowerSection((p:any) => ({...p, subtitle: v}))} />
          <BilingualInput label="العنوان الرئيسي" value={empowerSection.title} onChange={v => setEmpowerSection((p:any) => ({...p, title: v}))} />
          <BilingualInput label="الجزء المميز من العنوان" value={empowerSection.titleHighlight} onChange={v => setEmpowerSection((p:any) => ({...p, titleHighlight: v}))} />
          <BilingualTextarea label="الوصف" value={empowerSection.description} onChange={v => setEmpowerSection((p:any) => ({...p, description: v}))} />
          <BilingualInput label="نص الزر" value={empowerSection.ctaText} onChange={v => setEmpowerSection((p:any) => ({...p, ctaText: v}))} />
          
          <div className="pt-4 border-t space-y-4">
            <div className="flex justify-between items-center">
              <Label className="font-bold">إحصائيات القسم المدمجة</Label>
              <Button size="sm" variant="outline" onClick={() => setEmpowerSection((p:any) => ({...p, stats: [...(p.stats||[]), {label: {ar:"", en:""}, value: ""}]}))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {empowerSection.stats?.map((st:any, i:number) => (
              <div key={i} className="flex gap-2 items-start border p-3 rounded-md bg-muted/10">
                <div className="flex-1 space-y-2">
                  <Input placeholder="القيمة الرقمية (45M+)" value={st.value} dir="ltr" onChange={e => setEmpowerSection((p:any) => { const s = [...p.stats]; s[i].value = e.target.value; return {...p, stats: s}; })} />
                  <BilingualInput label={`وصف ${i+1}`} value={st.label} onChange={v => setEmpowerSection((p:any) => { const s = [...p.stats]; s[i].label = v; return {...p, stats: s}; })} />
                </div>
                <Button variant="ghost" size="icon" className="mt-8" onClick={() => setEmpowerSection((p:any) => ({...p, stats: p.stats.filter((_:any, idx:number) => idx !== i)}))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={() => handleSave("empower_section", empowerSection)} disabled={saveSetting.isPending}>حفظ التعديلات</Button>
        
          </CardContent>
        </AccordionContent>
      </AccordionItem>
      
    </Accordion>
    </div>
  );
}