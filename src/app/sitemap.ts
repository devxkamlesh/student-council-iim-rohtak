import type { MetadataRoute } from "next";
import { SITE } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/committees",
    "/clubs",
    "/events",
    "/leave",
    "/student-form",
    "/e-learning",
    "/calendar",
    "/terms",
    "/privacy",
    "/disclaimer",
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
