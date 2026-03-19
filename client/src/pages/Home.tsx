import { Helmet } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import WhySection from "@/components/sections/WhySection";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { FEATURE_FLAGS } from "@/lib/constants";

// Lazy load below-fold sections to reduce initial bundle & IntersectionObservers
const DemoSection = lazy(() => import("@/components/sections/DemoSection"));
const SkillsSection = lazy(() => import("@/components/sections/SkillsSection"));
const ProgramsSection = lazy(() => import("@/components/sections/ProgramsSection"));
const EmpowerSection = lazy(() => import("@/components/sections/EmpowerSection"));
const PricingSection = lazy(() => import("@/components/sections/PricingSection"));
const InstructorSection = lazy(() => import("@/components/sections/InstructorSection"));
const GallerySection = lazy(() => import("@/components/sections/GallerySection"));
const TestimonialsSection = lazy(() => import("@/components/sections/TestimonialsSection"));
const ContactSection = lazy(() => import("@/components/sections/ContactSection"));

// Lazy load decorative component
const SeasonalDecor = lazy(() => import("@/components/layout/SeasonalDecor"));

export default function Home() {
  const { data: settings } = usePublicSettings();
  const showDecor = settings?.decoration?.enabled === true;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-16">
      <Helmet>
        <title>ماركتير برو | Marketer Pro - استراتيجيات تسويق ذكية</title>
        <meta name="description" content="ماركتير برو - منصة تسويقية رائدة تقدم خدمات، استشارات، وبرامج تدريبية متقدمة في التسويق الرقمي لعلامتك التجارية" />
        <meta name="keywords" content="تسويق رقمي, وكالة تسويق, كورسات تسويق, بناء علامة تجارية, digital marketing, marketing agency, SEO" />
        <meta property="og:title" content="ماركتير برو | Marketer Pro - استراتيجيات تسويق ذكية" />
        <meta property="og:description" content="دليلك لخدمات وتدريبات التسويق الرقمي. ضاعف مبيعاتك اليوم" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_EG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ماركتير برو | Marketer Pro - استراتيجيات تسويق ذكية" />
        <meta name="twitter:description" content="منصة متخصصة في خدمات وتدريب المسوقين لتعزيز نمو الأعمال" />
        <link rel="canonical" href="https://marketerpro.example.com/" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "ماركتير برو - Marketer Pro",
          url: "https://marketerpro.example.com",
          description: "منصة متخصصة في خدمات وتدريبات التسويق الرقمي",
          sameAs: [],
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "USD",
            lowPrice: "100",
            highPrice: "5000",
            offerCount: "1"
          }
        })}</script>
      </Helmet>
      <Navbar />
      {showDecor && (
        <Suspense fallback={null}>
          <SeasonalDecor />
        </Suspense>
      )}
      <main>
        <HeroSection />
        {FEATURE_FLAGS.enableStats && <StatsSection />}
        {FEATURE_FLAGS.enableWhyUs && <WhySection />}
        <Suspense fallback={<div className="min-h-[400px]" />}>
          {FEATURE_FLAGS.enableDemo && <DemoSection />}
          {FEATURE_FLAGS.enablePortfolio && <SkillsSection />}
          {(FEATURE_FLAGS.enableCourses || FEATURE_FLAGS.enableWorkshops) && <ProgramsSection />}
          <EmpowerSection />
          {FEATURE_FLAGS.enablePricing && <PricingSection />}
          {FEATURE_FLAGS.enableInstructor && <InstructorSection />}
          {FEATURE_FLAGS.enablePortfolio && <GallerySection />}
          {FEATURE_FLAGS.enableTestimonials && <TestimonialsSection />}
          {FEATURE_FLAGS.enableContact && <ContactSection />}
        </Suspense>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
