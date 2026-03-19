import { createContext, useContext, useEffect, useState } from "react";
import ar from "../locales/ar.json";
import en from "../locales/en.json";

type Language = "ar" | "en";

const translations: Record<Language, any> = { ar, en };

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string | { ar?: string; en?: string } | undefined | null) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "ar" || saved === "en")) {
      setLanguageState(saved);
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    } else {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
  }, []);

  const setLanguage = (lang: Language) => {
    localStorage.setItem("language", lang);
    setLanguageState(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const t = (key: string | { ar?: string; en?: string } | undefined | null): string => {
    if (!key) return "";

    // If it's the old object format, handle it for backward compatibility or direct DB strings
    if (typeof key === "object") {
      return language === "ar" ? (key.ar || "") : (key.en || key.ar || "");
    }

    // Handle nested keys like 'nav.home'
    const keys = key.split(".");
    let result: any = translations[language];

    for (const k of keys) {
      if (result && typeof result === "object" && k in result) {
        result = result[k];
      } else {
        // Fallback to English if not found in Arabic
        if (language === "ar") {
          let enResult: any = translations.en;
          for (const ek of keys) {
            if (enResult && typeof enResult === "object" && ek in enResult) {
              enResult = enResult[ek];
            } else {
              return key; // Return the key itself if not found
            }
          }
          return typeof enResult === "string" ? enResult : key;
        }
        return key;
      }
    }

    return typeof result === "string" ? result : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
