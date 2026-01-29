"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TickerProps {
  items: Array<{
    name: string;
    logo?: string;
    href?: string;
  }>;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}

export function Ticker({
  items,
  speed = 50,
  direction = "left",
  className,
}: TickerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={cn("overflow-hidden py-8", className)}>
        <div className="flex gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="flex-shrink-0">
              {item.logo ? (
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={120}
                  height={60}
                  className="object-contain opacity-60"
                />
              ) : (
                <span className="text-muted-foreground text-sm">{item.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const duplicatedItems = [...items, ...items];
  const animationName = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <>
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
      <div className={cn("overflow-hidden py-8 border-y", className)}>
        <div
          className="flex gap-8 w-fit"
          style={{
            animation: `${animationName} ${speed}s linear infinite`,
          }}
        >
          {duplicatedItems.map((item, idx) => (
            <div key={idx} className="flex-shrink-0">
              {item.logo ? (
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={120}
                  height={60}
                  className="object-contain opacity-60 hover:opacity-100 transition-all"
                />
              ) : (
                <span className="text-muted-foreground text-sm whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

