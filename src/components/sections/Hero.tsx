"use client";
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Link } from '@/i18n/routing'; // Use internationalized Link
import { useTranslations } from '../../hooks/useTranslations'

// Lazy load heavy animation components
const AnimatedShinyTextDemo = dynamic(() => import('../magicui/demo/animated_shiny_text_demo').then(mod => ({ default: mod.AnimatedShinyTextDemo })), {
  ssr: false,
  loading: () => <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md mx-auto md:mx-0" />
});

const CoverDemo = dynamic(() => import('../magicui/demo/cover-demo').then(mod => ({ default: mod.CoverDemo })), {
  ssr: false,
  loading: () => <div className="h-16 md:h-20 bg-gray-200 animate-pulse rounded-md mb-4" />
});

const InteractiveHoverButton = dynamic(() => import('../magicui/interactive-hover-button').then(mod => ({ default: mod.InteractiveHoverButton })), {
  ssr: false,
  loading: () => <div className="h-12 bg-primary rounded-md animate-pulse" />
});

// Keep these as regular imports since they're likely lighter
import We_Offer from '../What-We-Offer'
import Trusted from '../Trusted'

const Hero = () => {
  const { t, locale } = useTranslations();
  const isRTL = locale === 'ar';

  return (
    <main className="md:pb-10 container" dir={isRTL ? 'rtl' : 'ltr'}>
    <div className="md:px-0 mx-6 xl:w-4/5 2xl:w-[68%] md:mx-auto ">
      <Suspense fallback={<div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md mx-auto md:mx-0" />}>
        <AnimatedShinyTextDemo />
      </Suspense>

      <h1>
        <Suspense fallback={<div className="h-16 md:h-20 bg-gray-200 animate-pulse rounded-md mb-4" />}>
          <CoverDemo />
        </Suspense>
      </h1>
      <p
        className={`md:text-center text-xl 
md:text-2xl my-6 md:my-10 
 text-gray-500 ${isRTL ? 'text-center' : ''}`}
      >
        {t("Hero.description")}
      </p>
      <div className="flex md:justify-center items-center gap-x-4 max-md:w-full max-md:grid max-md:grid-cols-2">
        {/* Primary Button */}
        <Link href="/meeting">
          <Suspense fallback={<div className="h-12 bg-primary rounded-md animate-pulse" />}>
            <InteractiveHoverButton
              className="sm:text-base bg-primary text-primary-foreground
              py-3 px-10 md:px-16 md:text-xl max-md:w-full max-md:px-2
              hover:bg-primary-foreground hover:text-primary hover:border-primary
              hover:shadow-[1px_1px_var(--color-primary),2px_2px_var(--color-primary),3px_3px_var(--color-primary),4px_4px_var(--color-primary),5px_5px_0px_0px_var(--color-primary)]
              dark:hover:shadow-[1px_1px_var(--color-primary-foreground),2px_2px_var(--color-primary-foreground),3px_3px_var(--color-primary-foreground),4px_4px_var(--color-primary-foreground),5px_5px_0px_0px_var(--color-primary-foreground)]"
            >
              <span className="max-md:text-sm">{t("Hero.buttons.bookCall")}</span>
            </InteractiveHoverButton>
          </Suspense>
        </Link>

        {/* Secondary Button */}
        <Link href="/about">
          <Suspense fallback={<div className="h-12 bg-gray-200 rounded-md animate-pulse" />}>
            <InteractiveHoverButton
              className="py-3 px-10 md:px-16 md:text-xl max-md:w-full max-md:px-2
              hover:shadow-[1px_1px_var(--color-primary),2px_2px_var(--color-primary),3px_3px_var(--color-primary),4px_4px_var(--color-primary),5px_5px_0px_0px_var(--color-primary)]
              dark:hover:shadow-[1px_1px_var(--color-primary-foreground),2px_2px_var(--color-primary-foreground),3px_3px_var(--color-primary-foreground),4px_4px_var(--color-primary-foreground),5px_5px_0px_0px_var(--color-primary-foreground)]"
            >
              <span className="max-md:text-sm">{t("Hero.buttons.aboutUs")}</span>
            </InteractiveHoverButton>
          </Suspense>
        </Link>
      </div>
      <We_Offer />
      <Trusted />
    </div>
  </main>
  )
}

export default Hero
