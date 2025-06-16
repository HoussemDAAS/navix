import React, { memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  isNavigating?: boolean;
  locale?: string;
}

// Memoize the component to prevent unnecessary re-renders
const LoadingScreen = memo(function LoadingScreen({ isNavigating, locale }: LoadingScreenProps) {
  // Optimize animation variants
  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.5, // Reduced from 0.6
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.1, duration: 0.3 } // Reduced from 0.4
    }
  };

  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: "100%",
      transition: {
        duration: isNavigating ? 0.6 : 0.8, // Reduced durations
        ease: "easeInOut",
      }
    }
  };

  const brandingVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.2, duration: 0.4 } // Reduced from 0.6
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-lochmara-50 px-4">
      {/* Simplified background pattern - remove heavy animations */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-4 left-4 w-16 h-16 md:w-32 md:h-32 bg-lochmara-500 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute top-8 right-4 w-16 h-16 md:w-32 md:h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl"></div>
        <div className="absolute bottom-8 left-8 w-16 h-16 md:w-32 md:h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl"></div>
      </div>

      <div className="relative flex flex-col items-center gap-6 md:gap-8 w-full max-w-sm">
        {/* Logo Container - Optimized */}
        <motion.div
          variants={logoVariants}
          initial="initial"
          animate="animate"
          className="relative"
        >
          {/* Simplified glow effect */}
          <div className="absolute inset-0 bg-lochmara-500/20 rounded-full blur-xl scale-150"></div>
          
          {/* Logo - Responsive sizes */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32">
            <Image
              src="/logo_navix.png"
              alt="Navix Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
            />
          </div>
        </motion.div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full">
          {/* Optimized Progress Bar */}
          <div className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              variants={progressVariants}
              initial="initial"
              animate="animate"
              className="h-full bg-gradient-to-r from-lochmara-500 to-blue-600 rounded-full"
            />
          </div>

          {/* Loading Text - Optimized */}
          <motion.div
            variants={textVariants}
            initial="initial"
            animate="animate"
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

          {/* Simplified Spinner - Single rotation for better performance */}
          <div className="relative w-8 h-8 sm:w-10 sm:h-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 border-2 border-lochmara-200 border-t-lochmara-500 rounded-full"
              style={{ willChange: 'transform' }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Branding - Optimized */}
      <motion.div
        variants={brandingVariants}
        initial="initial"
        animate="animate"
        className="absolute bottom-4 md:bottom-8 text-center px-4"
      >
        <p className="text-xs text-gray-500">
          Digital Growth Solutions
        </p>
      </motion.div>
    </div>
  );
});

export default LoadingScreen;