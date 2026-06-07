"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** delay in ms before the animation starts */
  delay?: number;
  /** animation direction */
  direction?: "up" | "down" | "left" | "right" | "zoom";
  className?: string;
  /** render as a different wrapper tag */
  as?: "div" | "section" | "li";
};

const hiddenMap: Record<NonNullable<RevealProps["direction"]>, string> = {
  up: "translate-y-8 opacity-0",
  down: "-translate-y-8 opacity-0",
  left: "translate-x-8 opacity-0",
  right: "-translate-x-8 opacity-0",
  zoom: "scale-95 opacity-0",
};

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect reduced-motion preferences — show immediately, no animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      // Fires immediately for anything already on screen (e.g. the hero area),
      // and as soon as ~12% of a below-the-fold section scrolls into view.
      { threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement>}
      className={`transition-all duration-700 ease-out will-change-transform ${
        visible ? "translate-x-0 translate-y-0 scale-100 opacity-100" : hiddenMap[direction]
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
