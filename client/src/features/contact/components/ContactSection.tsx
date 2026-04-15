import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer, viewportConfig, fadeInRight } from "@/lib/animations";
import { usePublicSettings } from "@/hooks/use-public-settings";
import { useContactForm } from "../hooks/useContactForm";
import { ContactSuccess } from "./ContactSuccess";
import { ContactForm } from "./ContactForm";
import { ContactInfoCards } from "./ContactInfoCards";

export default function ContactSection() {
  const f = useContactForm();
  const { data: publicSettings } = usePublicSettings();

  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={staggerContainer}>
          <motion.p variants={fadeInUp} className="text-accent font-semibold text-sm mb-2">{f.t({ ar: "لنتحدث عن النمو", en: "Let's Talk Growth" })}</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-extrabold text-foreground">
            {f.t({ ar: "هل أنت مستعد لبناء ", en: "Are you ready to build " })}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-accent to-blue-600">
              {f.t({ ar: "محرك نمو مبيعاتك؟", en: "your growth engine?" })}
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          <motion.div className="lg:col-span-3" initial="hidden" whileInView="visible" viewport={viewportConfig} variants={fadeInRight}>
            <AnimatePresence mode="wait">
              {f.submitted ? (
                <ContactSuccess t={f.t} onReset={() => { f.setSubmitted(false); f.setFormData({ name: "", phone: "", email: "", company: "", service: "", message: "", scheduledDate: undefined, scheduledSlotId: "" }); }} />
              ) : (
                <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <ContactForm 
                    t={f.t} language={f.language} activeTab={f.activeTab} setActiveTab={f.setActiveTab} 
                    formData={f.formData} setFormData={f.setFormData} slots={f.slots} isLoadingSlots={f.isLoadingSlots}
                    onSubmit={f.handleSubmit} isPending={f.mutation.isPending} publicSettings={publicSettings} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <ContactInfoCards t={f.t} />
        </div>
      </div>
    </section>
  );
}
