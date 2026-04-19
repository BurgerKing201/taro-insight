"use client";

import React, { useMemo } from "react";

interface Star {
  left: string;
  top: string;
  opacity: number;
  animation: string;
  animationDelay: string;
}

// Generate stable stars once per component instance using a seeded sequence
// so positions don't change on every render (no hydration mismatch).
function generateStars(count: number): Star[] {
  // Simple LCG pseudo-random to avoid Math.random() in render
  let seed = 0x9e3779b9;
  const rand = () => {
    seed = (seed ^ (seed << 13)) >>> 0;
    seed = (seed ^ (seed >> 17)) >>> 0;
    seed = (seed ^ (seed << 5)) >>> 0;
    return (seed >>> 0) / 0xffffffff;
  };

  return Array.from({ length: count }, () => ({
    left: `${rand() * 100}%`,
    top: `${rand() * 100}%`,
    opacity: 0.2 + rand() * 0.5,
    animation: `twinkle ${2 + rand() * 4}s ease-in-out infinite`,
    animationDelay: `${rand() * 3}s`,
  }));
}

export function StarField({ count = 40 }: { count?: number }) {
  const stars = useMemo(() => generateStars(count), [count]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute w-[2px] h-[2px] bg-white rounded-full"
          style={star}
        />
      ))}
    </div>
  );
}
