import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { PiCheckBold } from 'react-icons/pi'
import { useTranslations } from '../hooks/useTranslations'

// Lazy load the heavy BoxReveal component
const BoxReveal = dynamic(() => import('./magicui/box-reveal').then(mod => ({ default: mod.BoxReveal })), {
  ssr: false,
  loading: () => <div className="opacity-0" />
});

// Lightweight fallback component
const SimpleCheckItem = ({ children, isRTL }: { children: React.ReactNode; isRTL: boolean }) => (
  <div className={`md:text-xl font-semibold flex gap-x-2 md:gap-x-4 items-center opacity-0 animate-fadeIn ${
    isRTL ? 'flex-row-reverse' : ''
  }`}>
    <PiCheckBold className="text-xl text-lochmara-500" />
    {children}
  </div>
);

const We_Offer = () => {
  const { t, locale } = useTranslations();
  const isRTL = locale === 'ar';
  const [useHeavyAnimations, setUseHeavyAnimations] = useState(false);

  // Load heavy animations after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setUseHeavyAnimations(true);
    }, 2000); // Delay to improve initial load
    return () => clearTimeout(timer);
  }, []);

  const offers = [
    t("WhatWeOffer.videoProduction"),
    t("WhatWeOffer.webDevelopment"),
    t("WhatWeOffer.marketingStrategy"),
    t("WhatWeOffer.mediaBuying"),
    t("WhatWeOffer.emailCampaigns")
  ];

  return (
    <div
      className="grid grid-cols-2 
    md:grid-cols-4 gap-4 items-center 
    text-left md:justify-items-center 
    md:mx-auto mt-10 md:mt-16"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {offers.map((offer, index) => (
        <div key={index} style={{ animationDelay: `${index * 150}ms` }}>
          {useHeavyAnimations ? (
            <Suspense fallback={<SimpleCheckItem isRTL={isRTL}>{offer}</SimpleCheckItem>}>
              <BoxReveal boxColor={"var(--color-lochmara-500)"} duration={0.5}>
                <p className={`md:text-xl font-semibold flex gap-x-2 md:gap-x-4 items-center ${
                  isRTL ? 'flex-row-reverse' : ''
                }`}>
                  <PiCheckBold className="text-xl text-lochmara-500" />
                  {offer}
                </p>
              </BoxReveal>
            </Suspense>
          ) : (
            <SimpleCheckItem isRTL={isRTL}>{offer}</SimpleCheckItem>
          )}
        </div>
      ))}
    </div>
  )
}

export default We_Offer
