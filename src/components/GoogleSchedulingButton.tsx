"use client";

import { useEffect, useRef } from "react";

// Loads Google Calendar's appointment scheduling button script and renders the
// "Book an event" button into a target element.
const SCRIPT_SRC =
  "https://calendar.google.com/calendar/scheduling-button-script.js";
const CSS_HREF =
  "https://calendar.google.com/calendar/scheduling-button-script.css";

export default function GoogleSchedulingButton({
  url,
  label = "Book an event",
  color = "#039BE5",
}: {
  url: string;
  label?: string;
  color?: string;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  // Guards against React StrictMode running the effect twice (which would
  // inject two buttons).
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    // Inject the stylesheet once.
    if (!document.getElementById("gcal-scheduling-css")) {
      const link = document.createElement("link");
      link.id = "gcal-scheduling-css";
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      document.head.appendChild(link);
    }

    function renderButton() {
      const cal = (
        window as unknown as {
          calendar?: { schedulingButton?: { load: (o: unknown) => void } };
        }
      ).calendar;
      if (cal?.schedulingButton && targetRef.current) {
        // Clear any previously injected button to avoid duplicates.
        targetRef.current.innerHTML = "";
        cal.schedulingButton.load({ url, color, label, target: targetRef.current });
      }
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      // Script already on the page — render immediately (or after it loads).
      renderButton();
      existing.addEventListener("load", renderButton);
    } else {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.addEventListener("load", renderButton);
      document.body.appendChild(script);
    }
  }, [url, label, color]);

  return <div ref={targetRef} className="flex justify-center" />;
}
