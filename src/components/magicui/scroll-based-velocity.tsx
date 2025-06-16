"use client";

import React, { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { cn } from "@/lib/utils";

interface VelocityScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultVelocity?: number;
  className?: string;
  numRows?: number;
}

// Lazy load the heavy framer-motion component
const HeavyVelocityScroll = dynamic(
  () =>
    import("./scroll-based-velocity-heavy").then((mod) => ({
      default: mod.HeavyVelocityScroll,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

// Lightweight fallback component without animations
const LightVelocityScroll = ({
  children,
  className,
  numRows = 2,
  ...props
}: VelocityScrollProps) => {
  return (
    <div
      className={cn(
        "relative w-full text-4xl font-bold tracking-[-0.02em] md:text-7xl md:leading-[5rem]",
        className,
      )}
      {...props}
    >
      {Array.from({ length: numRows }).map((_, i) => (
        <div key={i} className="w-full overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-pulse">
            <span>{children} </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export function VelocityScroll({
  defaultVelocity = 5,
  numRows = 2,
  children,
  className,
  ...props
}: VelocityScrollProps) {
  const [shouldLoadHeavy, setShouldLoadHeavy] = useState(false);

  useEffect(() => {
    // Only load the heavy component after a delay to improve initial load
    const timer = setTimeout(() => {
      setShouldLoadHeavy(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoadHeavy) {
    return (
      <LightVelocityScroll
        numRows={numRows}
        className={className}
        {...props}
      >
        {children}
      </LightVelocityScroll>
    );
  }

  return (
    <Suspense
      fallback={
        <LightVelocityScroll
          numRows={numRows}
          className={className}
          {...props}
        >
          {children}
        </LightVelocityScroll>
      }
    >
      <HeavyVelocityScroll
        defaultVelocity={defaultVelocity}
        numRows={numRows}
        className={className}
        {...props}
      >
        {children}
      </HeavyVelocityScroll>
    </Suspense>
  );
}
