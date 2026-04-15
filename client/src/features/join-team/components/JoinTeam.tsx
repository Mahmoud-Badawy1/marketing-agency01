import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Users, TrendingUp, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/ui/card";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, scaleIn, viewportConfig } from "@/lib/animations";
import Footer from "@/components/organisms/Footer";
import Navbar from "@/components/organisms/Navbar";
import SeasonalDecor from "@/components/organisms/seasonal/SeasonalDecor";
import { useJoinTeamForm } from "../hooks/useJoinTeamForm";
import { JoinTeamSuccess } from "./JoinTeamSuccess";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { ProfessionalInfoStep } from "./ProfessionalInfoStep";
import { SkillsStep } from "./SkillsStep";
import { MotivationStep } from "./MotivationStep";

export default function JoinTeam() {
  const f = useJoinTeamForm();
  
  const whyJoinCards = [
    { icon: Users, title: f.t({ ar: "بيئة عمل مرنة", en: "Flexible Environment" }), description: f.t({ ar: "العمل أونلاين من أي مكان بالأوقات المناسبة لك", en: "Work online from anywhere" }), color: "text-blue-600", bgColor: "bg-blue-100" },
    { icon: TrendingUp, title: f.t({ ar: "تطوير مهني مستمر", en: "Continuous Growth" }), description: f.t({ ar: "تدريبات وورش عمل دورية لتحسين مهاراتك", en: "Periodic training and workshops" }), color: "text-green-600", bgColor: "bg-green-100" },
    { icon: DollarSign, title: f.t({ ar: "دخل مجزي", en: "Rewarding Income" }), description: f.t({ ar: "عائد مادي ممتاز يتناسب مع خبرتك وأدائك", en: "Excellent financial return" }), color: "text-purple-600", bgColor: "bg-purple-100" },
  ];

  const requirements = [
    f.t({ ar: "خبرة عملية ومثبتة في مجال التسويق الرقمي", en: "Proven practical experience" }),
    f.t({ ar: "شغف بتحقيق أهداف العملاء وزيادة المبيعات", en: "Passion for achieving goals" }),
    f.t({ ar: "التزام عالي بالمواعيد والاحترافية في العمل", en: "High commitment and professionalism" }),
    f.t({ ar: "القدرة على تحليل البيانات واتخاذ قرارات مبنية على الأرقام", en: "Ability to analyze data" }),
    f.t({ ar: "مهارات تواصل ممتازة والقدرة على العمل ضمن فريق", en: "Excellent communication skills" }),
  ];

  if (f.submitted) return <JoinTeamSuccess t={f.t} language={f.language} />;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>{f.t({ ar: "انضم لفريقنا | ماركتير برو", en: "Join Our Team | Marketer Pro" })}</title>
      </Helmet>
      <Navbar />
      <SeasonalDecor />
      <main>
        <section className="relative py-20 bg-gradient-to-br from-primary/90 via-blue-900 to-indigo-900 text-center text-white">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10 max-w-7xl mx-auto px-4">
            <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl font-extrabold mb-6">{f.t({ ar: "انضم لفريق الخبراء في", en: "Join the Expert Team" })} <span className="text-accent">ماركتير برو</span></motion.h1>
            <motion.p variants={fadeInUp} className="text-xl sm:text-2xl mb-8 opacity-90">{f.t({ ar: "كن جزءاً من وكالة تسويقية تصنع الفارق لعملائها", en: "Be part of an agency that makes a difference" })}</motion.p>
            <motion.div variants={fadeInUp}><Button size="lg" onClick={() => document.querySelector("#application-form")?.scrollIntoView({ behavior: "smooth" })} className="text-lg px-8">{f.t({ ar: "قدّم الآن", en: "Apply Now" })}</Button></motion.div>
          </motion.div>
        </section>

        <section className="py-20 px-4"><div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">{whyJoinCards.map((card, i) => (
          <motion.div key={i} initial="hidden" whileInView="visible" viewport={viewportConfig} variants={i % 2 === 0 ? fadeInLeft : fadeInRight}>
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-full ${card.bgColor} flex items-center justify-center`}><card.icon className={`h-8 w-8 ${card.color}`} /></div>
              <h3 className="text-xl font-bold mb-4">{card.title}</h3><p className="text-muted-foreground">{card.description}</p>
            </Card>
          </motion.div>
        ))}</div></section>

        <section className="py-20 bg-muted/50 px-4 text-center"><div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-3xl font-extrabold mb-8">{f.t({ ar: "المتطلبات", en: "Requirements" })}</h2>
          {requirements.map((req, i) => (
            <motion.div key={i} variants={fadeInUp} className="flex items-center gap-4 p-4 bg-background rounded-lg text-right"><CheckCircle className="h-6 w-6 text-green-500 shrink-0" /><span>{req}</span></motion.div>
          ))}
        </div></section>

        <section id="application-form" className="py-20 px-4 max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportConfig} variants={scaleIn}>
            <Card className="p-8"><form onSubmit={f.handleSubmit} className="space-y-6">
              <PersonalInfoStep t={f.t} language={f.language} formData={f.formData} onChange={f.handleChange} />
              <ProfessionalInfoStep t={f.t} language={f.language} formData={f.formData} onChange={f.handleChange} />
              <SkillsStep t={f.t} language={f.language} formData={f.formData} onChange={f.handleChange} />
              <MotivationStep t={f.t} language={f.language} formData={f.formData} onChange={f.handleChange} cvFile={f.cvFile} fileInputRef={f.fileInputRef} onFileChange={f.handleFileChange} isPending={f.mutation.isPending} />
            </form></Card>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
