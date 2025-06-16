"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResponsiveAnimatedTextProps {
  words: string[];
  duration?: number;
  className?: string;
  isRTL?: boolean;
}

export const ResponsiveAnimatedText = ({
  words,
  duration = 3000,
  className,
  isRTL = false,
}: ResponsiveAnimatedTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words.length, duration]);

  if (!words || words.length === 0) return null;

  const currentWord = words[currentIndex] || words[0];

  return (
    <span className="relative inline-block min-w-[120px] text-center" dir={isRTL ? "rtl" : "ltr"}>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${currentIndex}-${currentWord}`}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className={cn(
            "absolute inset-0 flex items-center justify-center whitespace-nowrap",
            className
          )}
          style={{
            fontFeatureSettings: isRTL ? '"liga" 1, "calt" 1' : "normal",
            textRendering: "optimizeLegibility",
          }}
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
      {/* Invisible placeholder to maintain consistent spacing */}
      <span className={cn("opacity-0 whitespace-nowrap", className)}>
        {words.reduce((longest, word) => word.length > longest.length ? word : longest, "")}
      </span>
    </span>
  );
};

// Fallback component for when animation is disabled or causing issues
export const StaticText = ({
  words,
  className,
  isRTL = false,
}: {
  words: string[];
  className?: string;
  isRTL?: boolean;
}) => {
  if (!words || words.length === 0) return null;
  
  return (
    <span 
      className={cn(className, isRTL && "text-right")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {words[0]}
    </span>
  );
};