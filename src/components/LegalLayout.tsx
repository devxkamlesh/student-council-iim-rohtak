import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function LegalLayout({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string;
  subtitle?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>
        {/* Page header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] text-white">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">{title}</h1>
            {subtitle && (
              <p className="mx-auto mt-4 max-w-2xl text-blue-200">{subtitle}</p>
            )}
            {updated && (
              <p className="mt-4 text-xs uppercase tracking-widest text-blue-300/80">
                {updated}
              </p>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="bg-white py-12 sm:py-16">
          <Reveal className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="legal-prose space-y-6 text-gray-700">{children}</div>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
