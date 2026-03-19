import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Clock,
  Heart,
  FileUp,
  Send,
  UserCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, scaleIn, viewportConfig } from "@/lib/animations";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import SeasonalDecor from "@/components/layout/SeasonalDecor";
import { useLanguage } from "@/hooks/use-language";

const getWhyJoinCards = (t: any) => [
  {
    icon: Users,
    title: t({ ar: "بيئة عمل مرنة", en: "Flexible Environment" }),
    description: t({
      ar: "العمل أونلاين من أي مكان بالأوقات المناسبة لك",
      en: "Work online from anywhere at your suitable times"
    }),
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    icon: TrendingUp,
    title: t({ ar: "تطوير مهني مستمر", en: "Continuous Growth" }),
    description: t({
      ar: "تدريبات وورش عمل دورية لتحسين مهاراتك",
      en: "Periodic training and workshops to improve your skills"
    }),
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: DollarSign,
    title: t({ ar: "دخل مجزي", en: "Rewarding Income" }),
    description: t({
      ar: "عائد مادي ممتاز يتناسب مع خبرتك وأدائك",
      en: "Excellent financial return matching your expertise and performance"
    }),
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

const getRequirements = (t: any) => [
  t({ ar: "خبرة عملية ومثبتة في مجال التسويق الرقمي", en: "Proven practical experience in digital marketing" }),
  t({ ar: "شغف بتحقيق أهداف العملاء وزيادة المبيعات", en: "Passion for achieving clients' goals and increasing sales" }),
  t({ ar: "التزام عالي بالمواعيد والاحترافية في العمل", en: "High commitment to deadlines and professionalism" }),
  t({ ar: "القدرة على تحليل البيانات واتخاذ قرارات مبنية على الأرقام", en: "Ability to analyze data and make data-driven decisions" }),
  t({ ar: "مهارات تواصل ممتازة والقدرة على العمل ضمن فريق", en: "Excellent communication skills and ability to work in a team" }),
];

export default function JoinTeam() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    city: "",
    education: "",
    specialization: "",
    experienceYears: "",
    hasAbacusExperience: "",
    abacusDetails: "",
    teachingPlatforms: "",
    availableHours: "",
    motivation: "",
  });
  
  const [cvFile, setCvFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/teacher-applications", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: t({ ar: "تم إرسال طلبك بنجاح!", en: "Application submitted successfully!" }),
        description: t({ ar: "سنراجع طلبك ونتواصل معك قريباً إن شاء الله", en: "We will review your application and contact you soon." }),
      });
    },
    onError: () => {
      toast({
        title: t({ ar: "حدث خطأ", en: "An error occurred" }),
        description: t({ ar: "يرجى المحاولة مرة أخرى أو التواصل معنا", en: "Please try again or contact us." }),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });
    
    if (cvFile) {
      formDataToSend.append("cv", cvFile);
    }
    
    mutation.mutate(formDataToSend);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: t({ ar: "نوع الملف غير مدعوم", en: "Unsupported file type" }),
          description: t({ ar: "يرجى رفع ملف PDF فقط", en: "Please upload a PDF file only" }),
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t({ ar: "حجم الملف كبير", en: "File too large" }),
          description: t({ ar: "يجب أن يكون حجم الملف أقل من 5 ميغابايت", en: "File size must be under 5MB" }),
          variant: "destructive",
        });
        return;
      }
      setCvFile(file);
    }
  };

  const scrollToForm = () => {
    document.querySelector("#application-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const whyJoinCards = getWhyJoinCards(t);
  const requirements = getRequirements(t);

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Helmet>
          <title>{t({ ar: "تم إرسال طلبك | ماركتير برو", en: "Application Submitted | Marketer Pro" })}</title>
        </Helmet>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"
          >
            <UserCheck className="h-12 w-12 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t({ ar: "تم إرسال طلبك بنجاح!", en: "Application submitted successfully!" })}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t({ ar: "سنراجع طلبك ونتواصل معك قريباً إن شاء الله", en: "We will review your application and contact you soon." })}
          </p>
          <Link href="/">
            <Button>
              {language === "en" ? <ArrowLeft className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              {t({ ar: "العودة للرئيسية", en: "Back to Home" })}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>{t({ ar: "انضم لفريقنا | ماركتير برو — وظائف تسويق ومبيعات", en: "Join Our Team | Marketer Pro — Marketing & Sales Jobs" })}</title>
        <meta name="description" content={t({ ar: "انضم لفريق الخبراء في ماركتير برو وكن جزءاً من وكالة تسويقية رائدة.", en: "Join Marketer Pro's team of experts and be a part of a leading marketing agency." })} />
        <meta property="og:title" content={t({ ar: "انضم لفريق ماركتير برو | وظائف تسويق", en: "Join Marketer Pro Team | Marketing Jobs" })} />
        <meta property="og:description" content={t({ ar: "فرصة عمل مميزة في التسويق الرقمي مع ماركتير برو - بيئة عمل مرنة ودخل مجزي", en: "Exceptional career opportunity in digital marketing with Marketer Pro - flexible environment and rewarding income." })} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://marketerpro.example.com/join-us" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: "Digital Marketing Specialist",
          description: "Join Marketer Pro team to provide professional marketing services.",
          hiringOrganization: {
            "@type": "Organization",
            name: "Marketer Pro",
            url: "https://marketerpro.example.com"
          },
          jobLocation: {
            "@type": "Place",
            addressRegion: "Egypt",
            addressCountry: "EG"
          },
          employmentType: "FULL_TIME",
          workHours: "Flexible"
        })}</script>
      </Helmet>

      <Navbar />
      <SeasonalDecor />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/90 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center text-white"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6"
              >
                {t({ ar: "انضم لفريق الخبراء في", en: "Join the Expert Team at" })}
                <span className="text-accent"> {t({ ar: "ماركتير برو", en: "Marketer Pro" })}</span>
              </motion.h1>
              <motion.p 
                variants={fadeInUp}
                className="text-xl sm:text-2xl mb-8 text-white/90 max-w-3xl mx-auto"
              >
                {t({ ar: "كن جزءاً من وكالة تسويقية تصنع الفارق لعملائها", en: "Be part of a marketing agency that makes a difference for its clients" })}
              </motion.p>
              <motion.div variants={fadeInUp}>
                <Button size="lg" onClick={scrollToForm} className="text-lg px-8 py-4">
                  {t({ ar: "قدّم الآن", en: "Apply Now" })}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Why Join Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              variants={staggerContainer}
            >
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4"
              >
                {t({ ar: "لماذا تنضم لماركتير برو؟", en: "Why Join Marketer Pro?" })}
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                {t({ ar: "اكتشف المزايا المتميزة للعمل معنا", en: "Discover the outstanding benefits of working with us" })}
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {whyJoinCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportConfig}
                  variants={index % 2 === 0 ? fadeInLeft : fadeInRight}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-full ${card.bgColor} flex items-center justify-center`}>
                      <card.icon className={`h-8 w-8 ${card.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">{card.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{card.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="py-20 bg-muted/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              variants={staggerContainer}
            >
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4"
              >
                {t({ ar: "المتطلبات", en: "Requirements" })}
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t({ ar: "ما نبحث عنه في المسوق الشريك المثالي", en: "What we look for in the ideal marketing partner" })}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              variants={staggerContainer}
              className="space-y-4"
            >
              {requirements.map((req, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="flex items-center gap-4 p-4 bg-background rounded-lg"
                >
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">{req}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Application Form */}
        <section id="application-form" className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              variants={staggerContainer}
            >
              <motion.h2 
                variants={fadeInUp}
                className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4"
              >
                {t({ ar: "طلب الانضمام", en: "Application Form" })}
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-lg text-muted-foreground"
              >
                {t({ ar: "املأ النموذج التالي وسنتواصل معك قريباً", en: "Fill out the form below and we will contact you soon" })}
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              variants={scaleIn}
            >
              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        {t({ ar: "الاسم الكامل *", en: "Full Name *" })}
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        required
                        placeholder={t({ ar: "أدخل اسمك الكامل", en: "Enter your full name" })}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4" />
                        {t({ ar: "البريد الإلكتروني *", en: "Email *" })}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4" />
                        {t({ ar: "رقم الهاتف (واتساب) *", en: "WhatsApp Number *" })}
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        required
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <Label htmlFor="age" className="mb-2 block">{t({ ar: "العمر *", en: "Age *" })}</Label>
                      <Input
                        id="age"
                        type="number"
                        min="18"
                        max="60"
                        value={formData.age}
                        onChange={(e) => handleChange("age", e.target.value)}
                        required
                        placeholder={t({ ar: "العمر", en: "Age" })}
                        dir="ltr"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <Label htmlFor="city" className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4" />
                        {t({ ar: "المدينة / المحافظة *", en: "City / Governorate *" })}
                      </Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        required
                        placeholder={t({ ar: "القاهرة، الإسكندرية، الجيزة...", en: "Cairo, Alexandria, Giza..." })}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </div>

                    {/* Education */}
                    <div>
                      <Label htmlFor="education" className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4" />
                        {t({ ar: "المؤهل الدراسي *", en: "Education Level *" })}
                      </Label>
                      <Select onValueChange={(value) => handleChange("education", value)} required dir={language === "ar" ? "rtl" : "ltr"}>
                        <SelectTrigger>
                          <SelectValue placeholder={t({ ar: "اختر المؤهل", en: "Select Education" })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="دبلوم">{t({ ar: "دبلوم", en: "Diploma" })}</SelectItem>
                          <SelectItem value="بكالوريوس">{t({ ar: "بكالوريوس", en: "Bachelor's Degree" })}</SelectItem>
                          <SelectItem value="ماجستير">{t({ ar: "ماجستير", en: "Master's Degree" })}</SelectItem>
                          <SelectItem value="دكتوراه">{t({ ar: "دكتوراه", en: "Ph.D." })}</SelectItem>
                          <SelectItem value="أخرى">{t({ ar: "أخرى", en: "Other" })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Specialization */}
                    <div>
                      <Label htmlFor="specialization" className="flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4" />
                        {t({ ar: "التخصص المهني *", en: "Professional Specialization *" })}
                      </Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => handleChange("specialization", e.target.value)}
                        required
                        placeholder={t({ ar: "إدارة إعلانات، SEO، تصميم، مبيعات...", en: "Ads Management, SEO, Design, Sales..." })}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </div>

                    {/* Experience Years */}
                    <div>
                      <Label htmlFor="experienceYears" className="mb-2 block">{t({ ar: "سنوات الخبرة في التسويق / مجالك *", en: "Years of Experience in Marketing *" })}</Label>
                      <Input
                        id="experienceYears"
                        type="number"
                        min="0"
                        max="40"
                        value={formData.experienceYears}
                        onChange={(e) => handleChange("experienceYears", e.target.value)}
                        required
                        placeholder={t({ ar: "عدد السنوات", en: "Number of Years" })}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Previous Experience Validated */}
                  <div>
                    <Label className="mb-4 block">{t({ ar: "هل لديك خبرة سابقة في إدارة حملات تسويقية ناجحة؟ *", en: "Do you have previous experience managing successful marketing campaigns? *" })}</Label>
                    <RadioGroup 
                      onValueChange={(value) => handleChange("hasAbacusExperience", value)}
                      className="flex gap-6"
                      required
                      dir={language === "ar" ? "rtl" : "ltr"}
                    >
                      <div className={`flex items-center space-x-2 ${language === "ar" ? "space-x-reverse" : ""}`}>
                        <RadioGroupItem value="true" id="abacus-yes" />
                        <Label htmlFor="abacus-yes">{t({ ar: "نعم", en: "Yes" })}</Label>
                      </div>
                      <div className={`flex items-center space-x-2 ${language === "ar" ? "space-x-reverse" : ""}`}>
                        <RadioGroupItem value="false" id="abacus-no" />
                        <Label htmlFor="abacus-no">{t({ ar: "لا", en: "No" })}</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Previous Experience Details (conditional) */}
                  {formData.hasAbacusExperience === "true" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Label htmlFor="abacusDetails" className="mb-2 block">{t({ ar: "أبرز إنجازاتك أو حملاتك التسويقية", en: "Your most prominent marketing achievements or campaigns" })}</Label>
                      <Textarea
                        id="abacusDetails"
                        value={formData.abacusDetails}
                        onChange={(e) => handleChange("abacusDetails", e.target.value)}
                        placeholder={t({ ar: "اذكر تفاصيل خبرتك والنتائج التي حققتها للعملاء...", en: "Mention details of your experience and the results you achieved for clients..." })}
                        rows={3}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      />
                    </motion.div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Platforms */}
                    <div>
                      <Label htmlFor="teachingPlatforms" className="mb-2 block">{t({ ar: "المنصات التسويقية التي تتقنها", en: "Marketing Platforms you master" })}</Label>
                      <Input
                        id="teachingPlatforms"
                        value={formData.teachingPlatforms}
                        onChange={(e) => handleChange("teachingPlatforms", e.target.value)}
                        placeholder="Facebook Ads, Google Ads, TikTok..."
                        dir="ltr"
                      />
                    </div>

                    {/* Available Hours */}
                    <div>
                      <Label htmlFor="availableHours" className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4" />
                        {t({ ar: "الأوقات المتاحة للعمل *", en: "Available Work Hours *" })}
                      </Label>
                      <Select onValueChange={(value) => handleChange("availableHours", value)} required dir={language === "ar" ? "rtl" : "ltr"}>
                        <SelectTrigger>
                          <SelectValue placeholder={t({ ar: "اختر وقت العمل المفضل", en: "Select preferred work schedule" })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="صباحي">{t({ ar: "دوام كامل (عن بعد)", en: "Full-Time (Remote)" })}</SelectItem>
                          <SelectItem value="مسائي">{t({ ar: "دوام جزئي (نصف يوم)", en: "Part-Time (Half Day)" })}</SelectItem>
                          <SelectItem value="مرن">{t({ ar: "مستقل / فريلانس", en: "Freelance" })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Motivation */}
                  <div>
                    <Label htmlFor="motivation" className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4" />
                      {t({ ar: "لماذا تريد الانضمام لفريق ماركتير برو؟", en: "Why do you want to join Marketer Pro's team?" })}
                    </Label>
                    <Textarea
                      id="motivation"
                      value={formData.motivation}
                      onChange={(e) => handleChange("motivation", e.target.value)}
                      placeholder={t({ ar: "اكتب دافعك وطموحاتك من الانضمام إلينا...", en: "Write your motivation and ambitions for joining us..." })}
                      rows={4}
                      maxLength={500}
                      dir={language === "ar" ? "rtl" : "ltr"}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {formData.motivation.length}/500
                    </div>
                  </div>

                  {/* CV Upload */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <FileUp className="h-4 w-4" />
                      {t({ ar: "السيرة الذاتية (PDF)", en: "Resume / CV (PDF)" })}
                    </Label>
                    <div className="flex items-center gap-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {cvFile ? t({ ar: "تغيير الملف", en: "Change File" }) : t({ ar: "رفع السيرة الذاتية", en: "Upload Resume" })}
                      </Button>
                      {cvFile && (
                        <span className="text-sm text-muted-foreground">
                          {cvFile.name}
                        </span>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {t({ ar: "ملف PDF، حد أقصى 5 ميغابايت (اختياري)", en: "PDF file, maximum 5 MB (Optional)" })}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-lg"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        t({ ar: "جارٍ الإرسال...", en: "Submitting..." })
                      ) : (
                        <>
                          <Send className="ml-2 h-5 w-5" />
                          {t({ ar: "أرسل طلب الانضمام", en: "Submit Application" })}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}