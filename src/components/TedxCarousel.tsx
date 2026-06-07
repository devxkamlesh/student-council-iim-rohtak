"use client";

import { useState } from "react";

export type TedxVideo = {
  id: string; // YouTube video ID
  title: string;
  speaker?: string;
};

export default function TedxCarousel({ videos }: { videos: TedxVideo[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const count = videos.length;

  function go(d: 1 | -1) {
    setDir(d);
    setIndex((i) => (i + d + count) % count);
  }

  function jumpTo(i: number) {
    setDir(i >= index ? 1 : -1);
    setIndex(i);
  }

  const current = videos[index];

  return (
    <div className="relative">
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Prev */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous video"
          disabled={count < 2}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 sm:h-14 sm:w-14"
        >
          <svg className="h-7 w-7 sm:h-9 sm:w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>

        {/* Video */}
        <div className="min-w-0 flex-1">
          <div
            key={index}
            className={`relative aspect-video overflow-hidden rounded-lg ring-1 ring-white/10 shadow-[0_0_80px_-20px_rgba(235,0,40,0.55)] ${
              dir === 1 ? "animate-slide-right" : "animate-slide-left"
            }`}
          >
            <iframe
              key={current.id}
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${current.id}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`}
              title={current.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

        {/* Next */}
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next video"
          disabled={count < 2}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white/80 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 sm:h-14 sm:w-14"
        >
          <svg className="h-7 w-7 sm:h-9 sm:w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots */}
      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {videos.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => jumpTo(i)}
              aria-label={`Go to video ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-[#eb0028]" : "w-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
