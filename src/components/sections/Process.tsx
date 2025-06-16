"use client";

import React from "react";
import WordPullUp from "@/components/magicui/word-pull-up";
import { useTranslations } from "../../hooks/useTranslations";
import { useDelayedAnimation } from "../../hooks/useDelayedAnimation";
import BoxRevealDemo from "../magicui/demo/Box-reveal-demo";
import { AnimatedBeamMultipleOutputDemo } from "../magicui/demo/animated-beam-demo";

const Process = () => {
  const { t, locale } = useTranslations();
  const isRTL = locale === "ar";
  const { shouldAnimate } = useDelayedAnimation({ delay: 200 });

  // Get the title text based on locale
  const titleText = isRTL ? 
    t("Process.title.our") : 
    `${t("Process.title.our")} ${t("Process.title.process")}`;

  return (
    <section id="process" aria-labelledby="process-heading">
      <div 
        className="md:px-0 mx-6 md:mx-auto max-w-7xl"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <header className="text-center mb-8">
          {shouldAnimate ? (
            <WordPullUp
              className={`text-3xl md:text-5xl font-medium mb-4 ${
                isRTL ? "text-center" : "text-center"
              }`}
              words={titleText}
            />
          ) : (
            <h2 id="process-heading" className="text-3xl md:text-5xl font-medium mb-4 text-center opacity-0">
              {titleText}
            </h2>
          )}
        </header>
        
        <p className="py-2 md:w-1/2 mx-auto text-xl md:text-2xl text-gray-500 text-center">
          {t("Process.subtitle")}
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center w-full md:w-1/2 mx-auto mt-12">
          <div className="w-full md:w-1/2 md:order-1" role="img" aria-label="Animated workflow diagram">
            <AnimatedBeamMultipleOutputDemo />
          </div>
          <div className="w-full md:w-1/2 order-1 md:order-2 md:ml-0"> 
            <BoxRevealDemo />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
