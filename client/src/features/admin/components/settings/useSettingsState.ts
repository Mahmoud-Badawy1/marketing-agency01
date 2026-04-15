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
    setPlans(getSetting("plans") || PRICING_PLANS);
    setWhatsapp(getSetting("contact")?.whatsapp || "+201553145631");
    setInstapay(getSetting("contact")?.instapay || "");
    setSocial(getSetting("social") || {});
    setFaqs(getSetting("faqs") || []);
    setStats(getSetting("stats") || STATS);
    setInstructorData(getSetting("instructor") || { image: instructorFallback });
    setProgramsData(getSetting("programs") || []);
    setWhyCards(getSetting("why_cards") || []);
    setGalleryCards(getSetting("gallery_cards") || []);
    setUpcomingEvent(getSetting("upcoming_event") || {});
    setSkillsCards(getSetting("skills_cards") || []);
    setServices(getSetting("services") || SERVICES);
    setEmpowerSection(getSetting("empower_section") || {});
    setHeroSlides(getSetting("hero_slides") || []);
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
