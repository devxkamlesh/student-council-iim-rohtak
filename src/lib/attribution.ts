// Developer attribution. The credit values are stored base64-encoded and
// assembled at runtime so they don't appear as plain strings in the source —
// a light deterrent against casual removal (not unremovable by design).
//
// REUSE: copy this file as-is into any project to keep a single, consistent
// developer identity. Keep the `sameAs` URLs identical across all sites — that
// is what lets Google merge them into one developer entity.

const _p = {
  n: "S2FtbGVzaCBDaG91ZGhhcnk=", // name -> "Kamlesh Choudhary"
  h: "QGRldnhrYW1sZXNo", // handle -> "@devxkamlesh"
  u: "aHR0cHM6Ly9kZXZ4a2FtbGVzaC5jb20=", // url -> "https://devxkamlesh.com"
  g: "aHR0cHM6Ly9naXRodWIuY29tL2RldnhrYW1sZXNo", // github
  l: "aHR0cHM6Ly9saW5rZWRpbi5jb20vaW4vZGV2eGthbWxlc2g=", // linkedin
  x: "aHR0cHM6Ly94LmNvbS9kZXZ4a2FtbGVzaA==", // x / twitter
  r: "RnVsbCBTdGFjayBEZXZlbG9wZXI=", // role -> "Full Stack Developer"
};

function dec(s: string): string {
  if (typeof atob === "function") return atob(s);
  return Buffer.from(s, "base64").toString("utf8");
}

export const ATTRIBUTION = {
  get name() {
    return dec(_p.n);
  },
  get handle() {
    return dec(_p.h);
  },
  get url() {
    return dec(_p.u);
  },
  get github() {
    return dec(_p.g);
  },
  get linkedin() {
    return dec(_p.l);
  },
  get twitter() {
    return dec(_p.x);
  },
  get role() {
    return dec(_p.r);
  },
  /** Stable list of profile URLs — keep identical on every site for SEO. */
  get sameAs() {
    return [dec(_p.u), dec(_p.g), dec(_p.l), dec(_p.x)];
  },
};

/** Person / ProfilePage JSON-LD — reuse on every site you build. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: ATTRIBUTION.name,
    alternateName: ATTRIBUTION.handle.replace("@", ""),
    url: ATTRIBUTION.url,
    jobTitle: ATTRIBUTION.role,
    sameAs: ATTRIBUTION.sameAs,
  };
}

/** Standard `_meta` watermark added to every public API response. */
export function apiMeta() {
  return {
    built_by: ATTRIBUTION.name,
    handle: ATTRIBUTION.handle,
    portfolio: ATTRIBUTION.url,
    github: ATTRIBUTION.github,
    tech_stack: "Next.js 16 · MySQL · Cloudinary",
    version: "2.0.0",
    generated_at: new Date().toISOString(),
  };
}
