"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function ImageCarousel({
  images,
  alt,
  autoPlay = true,
  interval = 4000,
}: {
  images: string[];
  alt: string;
  autoPlay?: boolean;
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (!autoPlay || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, interval);
    return () => window.clearInterval(id);
  }, [autoPlay, interval, count]);

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl bg-gray-900 shadow-lg ring-1 ring-black/5">
      {/* Slides */}
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`${alt} — photo ${i + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 600px"
          className={`object-cover transition-opacity duration-700 ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          priority={i === 0}
        />
      ))}

      {count > 1 && (
        <>
          {/* Arrows */}
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-all hover:bg-black/70 group-hover:opacity-100 focus:opacity-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-all hover:bg-black/70 group-hover:opacity-100 focus:opacity-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
