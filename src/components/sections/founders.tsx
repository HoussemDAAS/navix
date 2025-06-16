'use client'

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  PiArrowArcLeft,
  PiArrowArcRight,
  PiGlobe,
  PiLinkedinLogo,
  PiTwitterLogo,
} from "react-icons/pi";
import { useData } from "../context/DataContext";
import { useTranslations } from "../../hooks/useTranslations";
import Link from "next/link";

const Founders = () => {
  const { clients, isLoading } = useData();
  const { t, locale } = useTranslations();
  const isRTL = locale === "ar";
  const [startIndex, setStartIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);

  // Filter clients with representatives
  const featuredClients = useMemo(() => 
    clients.filter(client => client.representative), 
  [clients]);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const newItemsToShow = isMobile ? 1 : 4; // Changed to 1 for mobile
      setItemsToShow(newItemsToShow);
      setStartIndex(prev => {
        const maxStart = Math.max(0, featuredClients.length - newItemsToShow);
        return prev > maxStart ? maxStart : prev;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [featuredClients.length]);

  const next = () => {
    setStartIndex(prev => {
      const nextIndex = prev + 1;
      const maxStart = Math.max(0, featuredClients.length - itemsToShow);
      return nextIndex > maxStart ? 0 : nextIndex;
    });
  };

  const prev = () => {
    setStartIndex(prev => {
      const nextIndex = prev - 1;
      return nextIndex < 0 ? Math.max(0, featuredClients.length - itemsToShow) : nextIndex;
    });
  };

  const visibleClients = featuredClients.slice(startIndex, startIndex + itemsToShow);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        duration: 0.2,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        duration: 0.5,
        bounce: 0.4,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="px-6 mx-auto 2xl:w-4/5 md:px-16 py-16 md:py-32">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="bg-gray-200 aspect-square rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return ( 
    <div 
      className="px-6 mx-auto 2xl:w-4/5 md:px-16 py-16 md:py-32"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={`flex justify-between items-center mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold mb-2">
            {t("Founders.title", { count: clients.length })}
          </h2>
          <p className="text-gray-600">
            {t("Founders.subtitle")}
          </p>
        </div>
        {featuredClients.length > itemsToShow && (
          <div className={`hidden md:flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <motion.button onClick={prev} whileHover={{ scale: 1.1 }}>
              <PiArrowArcLeft className="text-black border rounded-full flex items-center justify-center text-5xl p-3 hover:bg-black/10 transition-colors" />
            </motion.button>
            <motion.button onClick={next} whileHover={{ scale: 1.1 }}>
              <PiArrowArcRight className="text-black border rounded-full flex items-center justify-center text-5xl p-3 hover:bg-black/10 transition-colors" />
            </motion.button>
          </div>
        )}
      </div>

      <div className="relative max-w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
            key={startIndex}
            variants={container}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {visibleClients.map((client) => {
              const rep = client.representative;
              return (
                <motion.div
                  key={client._id}
                  variants={item}
                  className="md:mb-0 mb-8"
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <div className="bg-gray-100 aspect-square mb-4 overflow-hidden rounded-xl">
                    {rep?.image ? (
                      <Image
                        priority
                        width={500}
                        height={500}
                        src={rep.image.asset.url}
                        alt={rep.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Image
                          priority
                          width={200}
                          height={200}
                          src={client.logo.asset.url}
                          alt={client.logo.alt || client.name}
                          className="w-3/4 h-3/4 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <h3 className={`font-bold text-lg mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {rep?.name || client.name}
                  </h3>
                  <p className={`text-[#7b7b7b] text-sm mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {rep?.role || client.category}
                  </p>
                  {client.testimonial ? (
                    <p className={`text-gray-700 text-sm mb-4 italic ${isRTL ? 'text-right' : 'text-left'}`}>
                      &quot;{client.testimonial}&quot;
                    </p>
                  ) : (
                    <p className={`text-gray-700 text-sm mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {client.description}
                    </p>
                  )}
                  <div className={`flex gap-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    {client.social?.linkedin && (
                      <Link href={client.social.linkedin} target="_blank" rel="noopener noreferrer">
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <PiLinkedinLogo className="w-5 h-5 text-[#7b7b7b] hover:text-[#0077b5] cursor-pointer" />
                        </motion.div>
                      </Link>
                    )}
                    {client.social?.twitter && (
                      <Link href={client.social.twitter} target="_blank" rel="noopener noreferrer">
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <PiTwitterLogo className="w-5 h-5 text-[#7b7b7b] hover:text-[#1DA1F2] cursor-pointer" />
                        </motion.div>
                      </Link>
                    )}
                    {client.website && (
                      <Link href={client.website} target="_blank" rel="noopener noreferrer">
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <PiGlobe className="w-5 h-5 text-[#7b7b7b] hover:text-lochmara-500 cursor-pointer" />
                        </motion.div>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
        
        {/* Mobile Navigation Arrows */}
        {featuredClients.length > itemsToShow && (
          <div className={`md:hidden flex justify-center gap-4 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <motion.button 
              onClick={prev} 
              whileHover={{ scale: 1.1 }}
              className="bg-white rounded-full p-3 shadow-md"
            >
              <PiArrowArcLeft className="text-black text-2xl" />
            </motion.button>
            <motion.button 
              onClick={next} 
              whileHover={{ scale: 1.1 }}
              className="bg-white rounded-full p-3 shadow-md"
            >
              <PiArrowArcRight className="text-black text-2xl" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Founders;