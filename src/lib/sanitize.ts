import "server-only";
import sanitizeHtml from "sanitize-html";

// Allowlist of formatting tags the rich-text editor can produce. Anything else
// (scripts, event handlers, styles, etc.) is stripped to prevent XSS.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "b", "strong", "i", "em", "u", "s", "strike",
    "h2", "h3", "h4", "ul", "ol", "li", "a", "blockquote", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["style"],
    p: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
    li: ["style"],
    strong: ["style"],
    em: ["style"],
  },
  // Only allow a `color` style, with safe value formats (hex / rgb / named).
  allowedStyles: {
    "*": {
      color: [
        /^#(0x)?[0-9a-f]+$/i,
        /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i,
        /^[a-z]+$/i,
      ],
    },
  },
  // Keep legacy <font color> too, normalized by browsers.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    // Force links to open safely in a new tab.
    a: (tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      },
    }),
  },
};

/** Clean rich-text HTML coming from the admin editor before storing it. */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, OPTIONS).trim();
}
