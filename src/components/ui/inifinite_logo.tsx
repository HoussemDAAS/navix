"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";

export const InfiniteMovingLogos = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    logo: string;
    name: string;
    link?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  useEffect(() => {
    addAnimation();
  });
  const [start, setStart] = useState(false);
  
  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      const durations = {
        fast: "20s",
        normal: "40s",
        slow: "100s"
      };
      containerRef.current.style.setProperty("--animation-duration", durations[speed]);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
      dir="ltr"
      style={{ direction: 'ltr' }}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        dir="ltr"
        style={{ direction: 'ltr' }}
      >
        {items.map((item) => (
          <li
            className="flex items-center flex-shrink-0 px-8"
            key={item.name}
            dir="ltr"
            style={{ direction: 'ltr' }}
          >
            <div className="w-40 md:w-40 flex items-center justify-center" dir="ltr" style={{ direction: 'ltr' }}>
              {item.link ? (
                <Link
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full hover:scale-105 transition-transform"
                >
                  <Image
                    src={urlFor(item.logo).url()}
                    alt={item.name}
                    width={160}
                    height={80}
                    loading="lazy"
                    sizes="(max-width: 768px) 120px, 160px"
                    className="w-full h-full object-contain"
                  />
                </Link>
              ) : (
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={160}
                  height={80}
                  loading="lazy"
                  sizes="(max-width: 768px) 120px, 160px"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};