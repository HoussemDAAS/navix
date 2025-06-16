"use client";
import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useData } from './context/DataContext';
import { useTranslations } from '../hooks/useTranslations';

// Lazy load heavy animation components
const InfiniteMovingLogos = dynamic(() => import('./ui/inifinite_logo').then(mod => ({ default: mod.InfiniteMovingLogos })), {
  ssr: false,
  loading: () => <div className="flex space-x-8">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-gray-200 rounded-xl w-32 h-32 animate-pulse" />
    ))}
  </div>
});

const NumberTicker = dynamic(() => import('./magicui/number-ticker').then(mod => ({ default: mod.NumberTicker })), {
  ssr: false,
  loading: () => <span className="inline-block">0</span>
});

// Lightweight number component without animation
const SimpleNumber = ({ value }: { value: number }) => (
  <span className="animate-fadeIn">{value}</span>
);

const Trusted = () => {
  const { t } = useTranslations();
  const { clients, isLoading } = useData();
  const [useHeavyAnimations, setUseHeavyAnimations] = useState(false);

  // Load heavy animations after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setUseHeavyAnimations(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const clientLogos = clients.map(client => ({
    logo: typeof client.logo === "string"
      ? client.logo
      : client.logo?.asset?.url || "",
    name: client.name,
    link: client.website || "#"
  }));

  return (
    <div className="md:flex items-center justify-between gap-y-4 my-10 gap-x-28 mx-auto">
      <div className="md:w-2/5">
        <h1 className="text-2xl font-medium text-gray-600 w-4/5">
          {t("Trusted.title")}
        </h1>
        <div className="flex my-6 gap-x-5 w-full">
          <div>
            <h1 className="text-3xl md:text-5xl text-lochmara-500">
              {useHeavyAnimations ? (
                <Suspense fallback={<SimpleNumber value={100} />}>
                  <NumberTicker value={100} />
                </Suspense>
              ) : (
                <SimpleNumber value={100} />
              )}+
              <p className="text-gray-500 text-sm md:text-md">
                {t("Trusted.stats.happyClients")}
              </p>
            </h1>
          </div>
          <div className="w-px bg-gray-300 self-stretch" />
          <div className="flex-1 min-w-0 ">
            <h1 className="text-3xl md:text-5xl text-lochmara-500 whitespace-nowrap overflow-hidden">
              {useHeavyAnimations ? (
                <Suspense fallback={<SimpleNumber value={30} />}>
                  <NumberTicker value={30} />
                </Suspense>
              ) : (
                <SimpleNumber value={30} />
              )}+
              <p className="text-gray-500 text-sm md:text-md">
                {t("Trusted.stats.projectsCompleted")}
              </p>
            </h1>
          </div>
        </div>
      </div>
      <section className="overflow-hidden mt-10 md:w-4/5">
        {isLoading ? (
          <div className="flex space-x-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl w-32 h-32 animate-pulse" />
            ))}
          </div>
        ) : useHeavyAnimations ? (
          <Suspense fallback={
            <div className="flex space-x-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl w-32 h-32 animate-pulse" />
              ))}
            </div>
          }>
            <InfiniteMovingLogos 
              speed="normal"
              direction="left"
              items={clientLogos}
            />
          </Suspense>
        ) : (
          <div className="flex space-x-8 animate-fadeIn">
            {clientLogos.slice(0, 3).map((client, i) => (
              <div key={i} className="bg-white rounded-xl w-32 h-32 flex items-center justify-center p-4 shadow-sm">
                {client.logo && (
                  <img 
                    src={client.logo} 
                    alt={client.name}
                    className="max-w-full max-h-full object-contain opacity-60"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Trusted
