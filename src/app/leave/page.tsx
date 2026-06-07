import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { getShuttleTimings, getOtherTimings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Leave & Others",
  description:
    "Outstation leave procedure, HSA office timings, shuttle schedules, parcel room and doctor timings for IIM Rohtak students.",
  alternates: { canonical: "/leave" },
};

export const dynamic = "force-dynamic";

export default async function LeavePage() {
  const [shuttle, otherTimings] = await Promise.all([
    getShuttleTimings(),
    getOtherTimings(),
  ]);
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] text-white">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-blue-200 ring-1 ring-white/15">
              Student Services
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Leave &amp; Others
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-blue-200">
              Everything you need for outstation leave, campus shuttles, and
              essential daily services.
            </p>
          </div>
        </section>

        {/* Outstation Leave */}
        <section className="bg-gray-50 py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <Reveal className="mb-8 text-center">
              <h2 className="fluid-h2 font-bold text-gray-900">
                Outstation Leave Procedure
              </h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
            </Reveal>

            <Reveal direction="up">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800 ring-1 ring-amber-100">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.5 0l-7.1 12.25A2 2 0 005 19z" />
                  </svg>
                  <p className="text-sm">
                    The hard copy of the leave form must be submitted at least{" "}
                    <strong>7 days (1 week)</strong> in advance of your journey.
                  </p>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      HSA Office Timings (Mon–Fri)
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>Morning: 10:00 AM – 11:00 AM</li>
                      <li>Evening: 4:00 PM – 5:00 PM</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                      Emergency Leave Only
                    </h3>
                    <p className="text-sm text-gray-700">
                      Contact the HSA Office at{" "}
                      <a href="tel:+919053002621" className="font-medium text-blue-600 hover:underline">
                        +91-9053002621
                      </a>
                    </p>
                  </div>
                </div>

                <p className="mt-6 text-sm text-gray-500">
                  You can view your approved leave status or download the form
                  below. If your leave is not in the sheet, it has not been
                  approved.
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <a
                    href="https://docs.google.com/spreadsheets/d/1pY3UTn1lUi5OroksWIe1hPahR-JDE3aPeexZmdtwICQ/edit?gid=1400562429#gid=1400562429"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Check Approved Leave Status
                  </a>
                  <a
                    href="https://studentcounciliimr.in/wp-content/uploads/2025/09/leave-form.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Leave Form
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Shuttle Timings */}
        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="mb-10 text-center">
              <h2 className="fluid-h2 font-bold text-gray-900">Shuttle Timings</h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2">
              {shuttle.map((s, i) => (
                <Reveal key={s.day} delay={(i % 2) * 100} direction="up">
                  <div className="h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="bg-[#2c3e50] px-6 py-3">
                      <h3 className="text-lg font-semibold text-white">{s.day}</h3>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-gray-100">
                      <div className="p-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          From IIM Rohtak Campus
                        </p>
                        <ul className="space-y-1.5">
                          {s.campus.map((t) => (
                            <li key={t} className="text-sm font-medium text-gray-700">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          From Rajiv Chowk, Delhi By-Pass
                        </p>
                        <ul className="space-y-1.5">
                          {s.rajiv.map((t) => (
                            <li key={t} className="text-sm font-medium text-gray-700">
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Other Timings */}
        <section className="bg-gray-50 py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <Reveal className="mb-10 text-center">
              <h2 className="fluid-h2 font-bold text-gray-900">Other Timings</h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {otherTimings.map((o, i) => (
                <Reveal key={o.label} delay={(i % 2) * 80} direction="up">
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <span className="text-sm font-medium text-gray-700">{o.label}</span>
                    <span className="text-sm font-semibold text-blue-600">{o.time}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
