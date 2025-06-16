import { useTranslations as useNextIntlTranslations, useLocale } from 'next-intl';

// Updated hook to use next-intl properly and prevent FOUC
export const useTranslations = () => {
  const t = useNextIntlTranslations();
  const locale = useLocale();

  return { t, locale };
};