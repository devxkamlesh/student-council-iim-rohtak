import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/data";
import { ATTRIBUTION, personJsonLd } from "@/lib/attribution";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Student Council, IIM Rohtak | Inspire. Serve. Lead.",
    template: "%s | Student Council, IIM Rohtak",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "Student Council IIM Rohtak",
    "IIM Rohtak",
    "General Student Body",
    "GSB",
    "IIM Rohtak clubs",
    "IIM Rohtak committees",
    "student welfare",
    "IIM Rohtak events",
    "Infusion IIM Rohtak",
    "TEDx IIM Rohtak",
  ],
  authors: [{ name: ATTRIBUTION.name, url: ATTRIBUTION.url }],
  creator: `${ATTRIBUTION.name} — ${ATTRIBUTION.url.replace("https://", "")}`,
  publisher: "Student Council, IIM Rohtak",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: SITE.logo, type: "image/jpeg" },
    ],
    apple: [{ url: SITE.logo }],
    shortcut: [{ url: SITE.logo }],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: "Student Council, IIM Rohtak | Inspire. Serve. Lead.",
    description: SITE.description,
    images: [
      {
        url: SITE.banner,
        width: 1024,
        height: 576,
        alt: "Welcome to the Official Website of Student Council, IIM Rohtak",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Council, IIM Rohtak | Inspire. Serve. Lead.",
    description: SITE.description,
    images: [SITE.banner],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "education",
  other: {
    "designed-by": `${ATTRIBUTION.name} (${ATTRIBUTION.url})`,
    generator: `Next.js — built by ${ATTRIBUTION.url.replace("https://", "")}`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  alternateName: "SC IIM Rohtak",
  url: SITE.url,
  logo: SITE.logo,
  description: SITE.description,
  email: SITE.email,
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "Indian Institute of Management Rohtak",
    url: "https://iimrohtak.ac.in",
  },
  creator: {
    "@type": "Person",
    name: ATTRIBUTION.name,
    url: ATTRIBUTION.url,
    sameAs: ATTRIBUTION.sameAs,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Rohtak",
    addressRegion: "Haryana",
    addressCountry: "IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased scroll-smooth`}>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Y9S9LV44KJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y9S9LV44KJ');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Developer identity (reused identically across all sites) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
        <link rel="author" type="text/plain" href="/humans.txt" />
      </head>
      <body className="flex min-h-full flex-col bg-white font-sans text-gray-800">
        {children}
      </body>
    </html>
  );
}
