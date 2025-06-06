import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Custom hook to load translations from JSON files
export const useTranslations = () => {
  const pathname = usePathname();
  const [translations, setTranslations] = useState<any>({});

  // Get current locale from pathname
  const getCurrentLocale = () => {
    const segments = pathname.split('/');
    const potentialLocale = segments[1];
    return ['en', 'fr', 'ar'].includes(potentialLocale) ? potentialLocale : 'en';
  };

  const currentLocale = getCurrentLocale();

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/messages/${currentLocale}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to English
        try {
          const fallbackResponse = await fetch('/messages/en.json');
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            setTranslations(fallbackData);
          }
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
        }
      }
    };

    loadTranslations();
  }, [currentLocale]);

  const t = (key: string) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { t, locale: currentLocale };
};