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
import { Plus, Trash2, GripVertical, Star, Link2, HelpCircle, BarChart3, UserCircle, BookOpen, AlertTriangle, Images, RefreshCw, Eye, EyeOff, Lock, Calculator } from "lucide-react";
import { SOCIAL_FIELDS, type SocialData } from "../settings/constants";
import type { SiteSettingType } from "@shared/schema";
import { HeroSection } from "../settings/SettingsTabs/HeroSection";
import { InstructorSection } from "../settings/SettingsTabs/InstructorSection";
import { WhySection } from "../settings/SettingsTabs/WhySection";
import { ProgramsSection } from "../settings/SettingsTabs/ProgramsSection";
import { GallerySection } from "../settings/SettingsTabs/GallerySection";
import { PricingSection } from "../settings/SettingsTabs/PricingSection";
import { SocialSection } from "../settings/SettingsTabs/SocialSection";
import { FaqSection } from "../settings/SettingsTabs/FaqSection";
import { StatsSection } from "../settings/SettingsTabs/StatsSection";
import { EventSection } from "../settings/SettingsTabs/EventSection";
import { SkillsSection } from "../settings/SettingsTabs/SkillsSection";
import { ServicesSection } from "../settings/SettingsTabs/ServicesSection";
import { EmpowerSection } from "../settings/SettingsTabs/EmpowerSection";
import { HubSpotSection } from "../settings/SettingsTabs/HubSpotSection";
import { CommunicationSection } from "../settings/SettingsTabs/CommunicationSection";
import { WHY_CARDS, PROGRAMS, PRICING_PLANS, STATS, SERVICES } from "@/lib/constants";
import { BilingualInput, type BilingualText } from "../settings/BilingualInput";
import { BilingualTextarea } from "../settings/BilingualTextarea";
import { ImageUploadInput } from "../settings/ImageUploadInput";
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
  const [services, setServices] = useState<any[]>([]);
  const [empowerSection, setEmpowerSection] = useState<any>({ stats: [] });
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [hubspotToken, setHubspotToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [syncPreview, setSyncPreview] = useState<{ leads: number, trials: number, orders: number } | null>(null);

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
    
    setWhatsapp(getSetting("contact")?.whatsapp || "+201553145631");
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
    
    const loadedServices = getSetting("services") || getSetting("subjects");
    setServices(loadedServices?.length ? loadedServices : SERVICES);
    
    setEmpowerSection(getSetting("empower_section") || defaultEmpower);
    
    const loadedHero = getSetting("hero_slides");
    setHeroSlides(loadedHero?.length ? loadedHero : defaultHero);

    setHubspotToken(getSetting("HUBSPOT_ACCESS_TOKEN") || "");
    setSmtpHost(getSetting("SMTP_HOST") || "smtp-relay.brevo.com");
    setSmtpPort(getSetting("SMTP_PORT") || "587");
    setSmtpUser(getSetting("SMTP_USER") || "");
    setSmtpPass(getSetting("SMTP_PASS") || "");
    setSenderEmail(getSetting("SENDER_EMAIL") || "noreply@marketerpro.com");
  }, [isLoading, rawSettings]);

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

  const syncHubSpotMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch("/api/admin/hubspot/sync-all", {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to sync HubSpot");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "تم بدء المزامنة", 
        description: data.message || "جاري تحديث البيانات في HubSpot..." 
      });
    },
    onError: (err: any) => {
      toast({ title: "خطأ في المزامنة", description: err.message, variant: "destructive" });
    }
  });

  const fetchPreviewMutation = useMutation({
    mutationFn: async () => {
      const res = await adminFetch("/api/admin/hubspot/preview");
      if (!res.ok) throw new Error("Failed to fetch preview");
      return res.json();
    },
    onSuccess: (data) => {
      setSyncPreview(data);
      toast({ title: "تم جلب بيانات المعاينة بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل في جلب بيانات المعاينة", variant: "destructive" });
    }
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <Accordion type="multiple" className="w-full space-y-6">
        <HeroSection heroSlides={heroSlides} setHeroSlides={setHeroSlides} handleSave={handleSave} isSaving={saveSetting.isPending} />

        <InstructorSection instructorData={instructorData} setInstructorData={setInstructorData} handleSave={handleSave} isSaving={saveSetting.isPending} />

        <WhySection whyCards={whyCards} setWhyCards={setWhyCards} handleSave={handleSave} isSaving={saveSetting.isPending} />
        <ProgramsSection programsData={programsData} setProgramsData={setProgramsData} handleSave={handleSave} isSaving={saveSetting.isPending} />

        <GallerySection galleryCards={galleryCards} setGalleryCards={setGalleryCards} handleSave={handleSave} isSaving={saveSetting.isPending} />
        <PricingSection plans={plans} setPlans={setPlans} handleSave={handleSave} isSaving={saveSetting.isPending} />

        <SocialSection social={social} setSocial={setSocial} whatsapp={whatsapp} setWhatsapp={setWhatsapp} instapay={instapay} setInstapay={setInstapay} handleSave={handleSave} isSaving={saveSetting.isPending} />

        <FaqSection faqs={faqs} setFaqs={setFaqs} handleSave={handleSave} isSaving={saveSetting.isPending} />
        <StatsSection stats={stats} setStats={setStats} handleSave={handleSave} isSaving={saveSetting.isPending} />

        <EventSection upcomingEvent={upcomingEvent} setUpcomingEvent={setUpcomingEvent} handleSave={handleSave} isSaving={saveSetting.isPending} />
        <SkillsSection skillsCards={skillsCards} setSkillsCards={setSkillsCards} handleSave={handleSave} isSaving={saveSetting.isPending} />
        <ServicesSection services={services} setServices={setServices} handleSave={handleSave} isSaving={saveSetting.isPending} />
        <EmpowerSection empowerSection={empowerSection} setEmpowerSection={setEmpowerSection} handleSave={handleSave} isSaving={saveSetting.isPending} />
        <HubSpotSection 
          hubspotToken={hubspotToken} 
          setHubspotToken={setHubspotToken} 
          showToken={showToken} 
          setShowToken={setShowToken}
          syncPreview={syncPreview}
          fetchPreview={() => fetchPreviewMutation.mutate()}
          isFetchingPreview={fetchPreviewMutation.isPending}
          syncAll={() => syncHubSpotMutation.mutate()}
          isSyncing={syncHubSpotMutation.isPending}
          handleSave={handleSave}
          isSaving={saveSetting.isPending}
        />

        <CommunicationSection 
          smtpHost={smtpHost}
          setSmtpHost={setSmtpHost}
          smtpPort={smtpPort}
          setSmtpPort={setSmtpPort}
          smtpUser={smtpUser}
          setSmtpUser={setSmtpUser}
          smtpPass={smtpPass}
          setSmtpPass={setSmtpPass}
          senderEmail={senderEmail}
          setSenderEmail={setSenderEmail}
          showPass={showPass}
          setShowPass={setShowPass}
          handleSave={handleSave}
          isSaving={saveSetting.isPending}
        />
      
    </Accordion>
    </div>
  );
}