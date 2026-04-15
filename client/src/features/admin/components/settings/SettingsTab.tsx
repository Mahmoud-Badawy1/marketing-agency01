import { Accordion } from "@/components/ui/accordion";
import { useSettingsState } from "./useSettingsState";
import { useHubSpotSync } from "./useHubSpotSync";
import { HeroSection } from "./SettingsTabs/HeroSection";
import { InstructorSection } from "./SettingsTabs/InstructorSection";
import { WhySection } from "./SettingsTabs/WhySection";
import { ProgramsSection } from "./SettingsTabs/ProgramsSection";
import { GallerySection } from "./SettingsTabs/GallerySection";
import { PricingSection } from "./SettingsTabs/PricingSection";
import { SocialSection } from "./SettingsTabs/SocialSection";
import { FaqSection } from "./SettingsTabs/FaqSection";
import { StatsSection } from "./SettingsTabs/StatsSection";
import { EventSection } from "./SettingsTabs/EventSection";
import { SkillsSection } from "./SettingsTabs/SkillsSection";
import { ServicesSection } from "./SettingsTabs/ServicesSection";
import { EmpowerSection } from "./SettingsTabs/EmpowerSection";
import { HubSpotSection } from "./SettingsTabs/HubSpotSection";
import { CommunicationSection } from "./SettingsTabs/CommunicationSection";

export function SettingsTab() {
  const s = useSettingsState();
  const h = useHubSpotSync();

  if (s.isLoading) return <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <Accordion type="multiple" className="w-full space-y-6">
        <HeroSection heroSlides={s.heroSlides} setHeroSlides={s.setHeroSlides} handleSave={s.handleSave} isSaving={s.isSaving} />
        <InstructorSection instructorData={s.instructorData} setInstructorData={s.setInstructorData} handleSave={s.handleSave} isSaving={s.isSaving} />
        <WhySection whyCards={s.whyCards} setWhyCards={s.setWhyCards} handleSave={s.handleSave} isSaving={s.isSaving} />
        <ProgramsSection programsData={s.programsData} setProgramsData={s.setProgramsData} handleSave={s.handleSave} isSaving={s.isSaving} />
        <GallerySection galleryCards={s.galleryCards} setGalleryCards={s.setGalleryCards} handleSave={s.handleSave} isSaving={s.isSaving} />
        <PricingSection plans={s.plans} setPlans={s.setPlans} handleSave={s.handleSave} isSaving={s.isSaving} />
        <SocialSection social={s.social} setSocial={s.setSocial} whatsapp={s.whatsapp} setWhatsapp={s.setWhatsapp} instapay={s.instapay} setInstapay={s.setInstapay} handleSave={s.handleSave} isSaving={s.isSaving} />
        <FaqSection faqs={s.faqs} setFaqs={s.setFaqs} handleSave={s.handleSave} isSaving={s.isSaving} />
        <StatsSection stats={s.stats} setStats={s.setStats} handleSave={s.handleSave} isSaving={s.isSaving} />
        <EventSection upcomingEvent={s.upcomingEvent} setUpcomingEvent={s.setUpcomingEvent} handleSave={s.handleSave} isSaving={s.isSaving} />
        <SkillsSection skillsCards={s.skillsCards} setSkillsCards={s.setSkillsCards} handleSave={s.handleSave} isSaving={s.isSaving} />
        <ServicesSection services={s.services} setServices={s.setServices} handleSave={s.handleSave} isSaving={s.isSaving} />
        <EmpowerSection empowerSection={s.empowerSection} setEmpowerSection={s.setEmpowerSection} handleSave={s.handleSave} isSaving={s.isSaving} />
        <HubSpotSection hubspotToken={s.hubspotToken} setHubspotToken={s.setHubspotToken} syncPreview={h.syncPreview} fetchPreview={h.fetchPreview} isFetchingPreview={h.isFetchingPreview} syncAll={h.syncAll} isSyncing={h.isSyncing} handleSave={s.handleSave} isSaving={s.isSaving} />
        <CommunicationSection smtpHost={s.smtpHost} setSmtpHost={s.setSmtpHost} smtpPort={s.smtpPort} setSmtpPort={s.setSmtpPort} smtpUser={s.smtpUser} setSmtpUser={s.setSmtpUser} smtpPass={s.smtpPass} setSmtpPass={s.setSmtpPass} senderEmail={s.senderEmail} setSenderEmail={s.setSenderEmail} handleSave={s.handleSave} isSaving={s.isSaving} />
      </Accordion>
    </div>
  );
}
