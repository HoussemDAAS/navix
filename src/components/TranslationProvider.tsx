"use client";

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface TranslationContextType {
  isTranslationsReady: boolean;
  locale: string;
  isNavigating: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  isTranslationsReady: false,
  locale: 'en',
  isNavigating: false
});

export const useTranslationReady = () => useContext(TranslationContext);

interface TranslationProviderProps {
  children: React.ReactNode;
}

// Separate component that uses useSearchParams - wrapped in Suspense
function NavigationHandler({ 
  setIsNavigating, 
  setIsTranslationsReady 
}: { 
  setIsNavigating: (value: boolean) => void;
  setIsTranslationsReady: (value: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle route changes
  useEffect(() => {
    setIsNavigating(true);
    setIsTranslationsReady(false);

    const timer = setTimeout(() => {
      setIsTranslationsReady(true);
      setIsNavigating(false);
    }, 800); // Shorter delay for navigation

    return () => clearTimeout(timer);
  }, [pathname, searchParams, setIsNavigating, setIsTranslationsReady]);

  return null;
}

// Loading screen component
function LoadingScreen({ 
  isNavigating, 
  locale 
}: { 
  isNavigating: boolean; 
  locale: string; 
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-lochmara-50 px-4">
      {/* Mobile-optimized background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4 w-16 h-16 md:w-32 md:h-32 bg-lochmara-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-8 right-4 w-16 h-16 md:w-32 md:h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 md:w-32 md:h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex flex-col items-center gap-6 md:gap-8 w-full max-w-sm">
        {/* Logo Container - Mobile optimized */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.6, -0.05, 0.01, 0.99]
          }}
          className="relative"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-lochmara-500/20 rounded-full blur-xl md:blur-2xl scale-150 animate-pulse"></div>
          
          {/* Logo - Responsive sizes */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
            <Image
              src="/logo_navix.png"
              alt="Navix Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
          {/* Animated Progress Bar - Mobile responsive */}
          <div className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{
                duration: isNavigating ? 0.8 : 1.2,
                ease: "easeInOut",
              }}
              className="h-full bg-gradient-to-r from-lochmara-500 to-blue-600 rounded-full"
            />
          </div>

          {/* Loading Text - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center"
          >
            <h3 className="text-lochmara-600 font-semibold text-base sm:text-lg md:text-xl mb-1">
              NAVIX
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm">
              {isNavigating ? (
                locale === 'ar' ? 'التنقل...' : 
                locale === 'fr' ? 'Navigation...' : 
                'Navigating...'
              ) : (
                locale === 'ar' ? 'جاري التحميل...' : 
                locale === 'fr' ? 'Chargement...' : 
                'Loading...'
              )}
            </p>
          </motion.div>

          {/* Spinner Animation - Better for mobile */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 border-2 border-lochmara-200 border-t-lochmara-500 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-1 border-2 border-transparent border-b-blue-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Bottom Branding - Mobile responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="absolute bottom-4 md:bottom-8 text-center px-4"
      >
        <p className="text-xs text-gray-500">
          Digital Growth Solutions
        </p>
      </motion.div>
    </div>
  );
}

export default function TranslationProvider({ children }: TranslationProviderProps) {
  const locale = useLocale();
  const [isTranslationsReady, setIsTranslationsReady] = useState(true); // Start as true to prevent SSR loading screen
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration detection
  useEffect(() => {
    // This effect only runs on the client after hydration
    setIsHydrated(true);
    setIsTranslationsReady(false); // Now show loading on client only
    
    const timer = setTimeout(() => {
      setIsTranslationsReady(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TranslationContext.Provider value={{ 
      isTranslationsReady: isHydrated ? isTranslationsReady : true, 
      locale, 
      isNavigating 
    }}>
      {/* Wrap the navigation handler in Suspense */}
      <Suspense fallback={null}>
        <NavigationHandler 
          setIsNavigating={setIsNavigating}
          setIsTranslationsReady={setIsTranslationsReady}
        />
      </Suspense>
      
      {/* Only show loading screen after hydration and when not ready */}
      {isHydrated && !isTranslationsReady ? (
        <LoadingScreen isNavigating={isNavigating} locale={locale} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </TranslationContext.Provider>
  );
}