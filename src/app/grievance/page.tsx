import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Grievance Form",
  description:
    "Submit a confidential grievance to the Student Council, IIM Rohtak. All submissions are handled privately.",
  alternates: { canonical: "/grievance" },
};

const GRIEVANCE_FORM_SRC =
  "https://docs.google.com/forms/d/e/1FAIpQLSfOqDo2y6rWZQwzKaDnqNGnw67GCeBBrai7tHYLDwCbepDEnQ/viewform?embedded=true";

export default function GrievancePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] text-white">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-blue-200 ring-1 ring-white/15">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Fully Confidential
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Grievance Form</h1>
            <p className="mx-auto mt-4 max-w-2xl text-blue-200">
              Raise any concern with the Student Council. Your submission stays
              confidential and is reviewed by the council directly.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="bg-gray-50 py-14 sm:py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Reveal direction="up">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <iframe
                  src={GRIEVANCE_FORM_SRC}
                  title="Grievance Form"
                  className="h-[1500px] w-full"
                  style={{ border: 0 }}
                  loading="lazy"
                >
                  Loading…
                </iframe>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
