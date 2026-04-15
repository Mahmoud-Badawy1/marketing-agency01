import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { adminFetch } from "@/lib/admin";
import { useToast } from "@/hooks/use-toast";
import type { SiteSettingType } from "@shared/schema";
import { WHY_CARDS, PROGRAMS, PRICING_PLANS, STATS, SERVICES } from "@/lib/constants";
import { fallbackImages } from "@/lib/fallbackImages";
import instructorFallback from "@assets/instructor.png";
import heroImage1 from "@assets/images/marketing_hero_1_1773563925795.png";
import heroImage2 from "@assets/images/marketing_hero_2_1773563941883.png";
import heroImage3 from "@assets/images/marketing_hero_3_1773563957738.png";

export function useSettingsState() {
  const { toast } = useToast();
  const { data: rawSettings, isLoading } = useQuery<SiteSettingType[]>({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const res = await adminFetch("/api/admin/settings");
      return res.json();
    },
  });

  const settings = Array.isArray(rawSettings) ? rawSettings : [];
  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value;

  // States
  const [plans, setPlans] = useState<any[]>([]);
  const [whatsapp, setWhatsapp] = useState("");
  const [instapay, setInstapay] = useState("");
  const [social, setSocial] = useState<any>({});
  const [faqs, setFaqs] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [instructorData, setInstructorData] = useState<any>({});
  const [programsData, setProgramsData] = useState<any[]>([]);
  const [whyCards, setWhyCards] = useState<any[]>([]);
  const [galleryCards, setGalleryCards] = useState<any[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<any>({});
  const [skillsCards, setSkillsCards] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [empowerSection, setEmpowerSection] = useState<any>({});
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [hubspotToken, setHubspotToken] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  useEffect(() => {
    if (isLoading || !rawSettings) return;
    const _plans = getSetting("plans");
    setPlans(_plans?.length > 0 ? _plans : PRICING_PLANS.map((p: any) => ({ ...p, name: {ar: p.name, en: p.name}, subtitle: {ar: p.subtitle, en: p.subtitle}, discountLabel: {ar:"", en:""}, period: {ar:"", en:""} })));
    setWhatsapp(getSetting("contact")?.whatsapp || "+201553145631");
    setInstapay(getSetting("contact")?.instapay || "");
    setSocial(getSetting("social") || {});
    setFaqs(getSetting("faqs") || []);
    setStats(getSetting("stats") || STATS);
    setInstructorData(getSetting("instructor") || { image: instructorFallback });

    const _programs = getSetting("programs");
    setProgramsData(_programs?.length > 0 ? _programs : [
      { level: {ar:"المستوى الأول", en:"Level 1"}, title: {ar:"التسويق الرقمي", en:"Digital Marketing"}, subtitle: {ar:"أساسيات", en:"Basics"}, description: {ar:"", en:""}, age: {ar:"المبتدئين", en:"Beginners"}, color: "from-blue-400 to-blue-600" },
      { level: {ar:"المستوى الثاني", en:"Level 2"}, title: {ar:"إدارة الحملات", en:"Campaigns Management"}, subtitle: {ar:"متقدم", en:"Advanced"}, description: {ar:"", en:""}, age: {ar:"المحترفين", en:"Professionals"}, color: "from-indigo-400 to-indigo-600" }
    ]);

    const _whyCards = getSetting("why_cards");
    setWhyCards(_whyCards?.length > 0 ? _whyCards : [
      { title: { ar: "تحتاج إلى المزيد من المبيعات؟", en: "Need more sales?" }, description: { ar: "الظهور الرقمي وحده لا يكفي", en: "Digital presence alone is not enough" }, type: "problem" },
      { title: { ar: "الحل عندنا", en: "We have the solution" }, description: { ar: "نقدم استراتيجيات متكاملة", en: "We offer comprehensive strategies" }, type: "solution" },
      { title: { ar: "نتائج مضمونة", en: "Guaranteed results" }, description: { ar: "مبيعات أكثر ونمو مستدام", en: "More sales and sustainable growth" }, type: "result" }
    ]);

    const _galleryCards = getSetting("gallery_cards");
    setGalleryCards(_galleryCards?.length > 0 ? _galleryCards : [
      { badge: {ar:"قصة نجاح", en:"Success Story"}, badgeColor: "bg-accent", title: {ar:"عنوان 1", en:"Title 1"}, description: {ar:"", en:""}, imageKey: "gallery1", image: "" },
      { badge: {ar:"ورشة عمل", en:"Workshop"}, badgeColor: "bg-primary", title: {ar:"عنوان 2", en:"Title 2"}, description: {ar:"", en:""}, imageKey: "gallery2", image: "" }
    ]);

    setUpcomingEvent(getSetting("upcoming_event") || {});

    const _skillsCards = getSetting("skills_cards");
    setSkillsCards(_skillsCards?.length > 0 ? _skillsCards : [
      { title: {ar:"مهارة 1", en:"Skill 1"}, description: {ar:"", en:""}, buttonText: {ar:"تفاصيل", en:"Details"}, buttonLink: "#contact", imageKey: "gallery3", image: "" }
    ]);

    const _services = getSetting("services");
    setServices(_services?.length > 0 ? _services : SERVICES);

    setEmpowerSection(getSetting("empower_section") || {});

    const _heroSlides = getSetting("hero_slides");
    setHeroSlides(_heroSlides?.length > 0 ? _heroSlides : [
      { mediaUrl: heroImage1, title: {ar:"دليلك الكامل لاحتراف", en: "Your Guide to"}, highlight: {ar:"التسويق", en: "Marketing"}, subtitle: {ar:"", en:""}, mediaType: "image" },
      { mediaUrl: heroImage2, title: {ar:"استراتيجيات مبنية على", en: "Strategies based on"}, highlight: {ar:"البيانات", en: "Data"}, subtitle: {ar:"", en:""}, mediaType: "image" },
      { mediaUrl: heroImage3, title: {ar:"حلول تسويقية لـ", en: "Marketing solutions for"}, highlight: {ar:"النمو المستدام", en: "Sustainable Growth"}, subtitle: {ar:"", en:""}, mediaType: "image" },
    ]);
    setHubspotToken(getSetting("HUBSPOT_ACCESS_TOKEN") || "");
    setSmtpHost(getSetting("SMTP_HOST") || "");
    setSmtpPort(getSetting("SMTP_PORT") || "");
    setSmtpUser(getSetting("SMTP_USER") || "");
    setSmtpPass(getSetting("SMTP_PASS") || "");
    setSenderEmail(getSetting("SENDER_EMAIL") || "");
  }, [isLoading, rawSettings]);

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      await adminFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify({ key, value }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Saved" });
    },
  });

  return {
    isLoading, plans, setPlans, whatsapp, setWhatsapp, instapay, setInstapay, social, setSocial,
    faqs, setFaqs, stats, setStats, instructorData, setInstructorData,
    programsData, setProgramsData, whyCards, setWhyCards, galleryCards, setGalleryCards,
    upcomingEvent, setUpcomingEvent, skillsCards, setSkillsCards, services, setServices,
    empowerSection, setEmpowerSection, heroSlides, setHeroSlides,
    hubspotToken, setHubspotToken, smtpHost, setSmtpHost, smtpPort, setSmtpPort,
    smtpUser, setSmtpUser, smtpPass, setSmtpPass, senderEmail, setSenderEmail,
    handleSave: (key: string, value: any) => saveSetting.mutate({ key, value }),
    isSaving: saveSetting.isPending
  };
}
