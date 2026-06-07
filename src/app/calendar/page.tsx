import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import GoogleSchedulingButton from "@/components/GoogleSchedulingButton";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Student Council calendar — restricted access.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SCHEDULING_URL =
  "https://calendar.google.com/calendar/appointments/AcZssZ2TWAaOfw0bqut7UophR0uRKyRuR7QP-daJGWU=?gv=true";

const CALENDAR_EMBED_SRC =
  "https://calendar.google.com/calendar/embed?src=student.council%40iimrohtak.ac.in&ctz=Asia%2FKolkata&showPrint=0&src=cGdwMTZjaGF1ZGhhcmltQGlpbXJvaHRhay5hYy5pbg&src=ZW4uaW5kaWFuI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&src=cGdwb2ZmaWNlQGlpbXJvaHRhay5hYy5pbg&src=c3R1ZGVudC5jb3VuY2lsQGlpbXJvaHRhay5hYy5pbg&color=%23039be5&color=%230b8043&color=%234285f4&color=%23f09300";

const COTY_FORM_SRC =
  "https://docs.google.com/forms/d/e/1FAIpQLSdOg4WtqxHel2Xs6cy1ePHZrq_dD0Qt7-Jw7RYUocIkbrJqhg/viewform?embedded=true";

const ACAA_FORM_SRC = "https://forms.gle/3YCojSLxZeUs3tiF9";

export default async function CalendarPage() {
  const user = await getSessionUser();

  // Must be signed in to even consider access.
  if (!user) redirect("/login?next=/calendar");

  // Access requires the special calendar.access permission only.
  const allowed = user.permissions.includes("calendar.access");

  if (!allowed) redirect("/");

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
              Restricted Access
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Calendar</h1>
            <p className="mx-auto mt-4 max-w-2xl text-blue-200">
              Book events, view the schedule, and submit COTY &amp; ACAA points.
            </p>
          </div>
        </section>

        {/* Book an event */}
        <section className="bg-gray-50 py-14 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <Reveal className="mb-8 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Scheduling
              </span>
              <h2 className="fluid-h2 mt-2 font-bold text-gray-900">Book an Event</h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
            </Reveal>

            <Reveal direction="up">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                {/* Important note */}
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-800 ring-1 ring-amber-100">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.5 0l-7.1 12.25A2 2 0 005 19z" />
                  </svg>
                  <p className="text-sm leading-relaxed">
                    Please verify the date and time before booking — once
                    confirmed, <strong>bookings cannot be canceled</strong>. Events
                    can be scheduled at least <strong>24 hours</strong> in advance
                    and up to <strong>7 days</strong> prior.
                  </p>
                </div>

                <div className="mt-6 flex justify-center">
                  <GoogleSchedulingButton url={SCHEDULING_URL} label="Book an event" />
                </div>
              </div>
            </Reveal>

            {/* Embedded Google Calendar */}
            <Reveal direction="up" className="mt-8">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-700">Student Council Calendar</h3>
                </div>
                <iframe
                  src={CALENDAR_EMBED_SRC}
                  title="Student Council Calendar"
                  className="h-[560px] w-full sm:h-[640px]"
                  style={{ border: 0 }}
                  scrolling="no"
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* COTY points */}
        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <Reveal className="mb-8 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Points Submission
              </span>
              <h2 className="fluid-h2 mt-2 font-bold text-gray-900">COTY Points</h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
              <p className="mt-3 text-sm text-gray-500">
                Fill out the form below to submit Club of the Year points.
              </p>
            </Reveal>
            <Reveal direction="up">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <iframe
                  src={COTY_FORM_SRC}
                  title="COTY Points Form"
                  className="h-[800px] w-full"
                  style={{ border: 0 }}
                  loading="lazy"
                >
                  Loading…
                </iframe>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ACAA points */}
        <section className="bg-gray-50 py-14 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <Reveal className="mb-8 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Points Submission
              </span>
              <h2 className="fluid-h2 mt-2 font-bold text-gray-900">ACAA Points</h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
              <p className="mt-3 text-sm text-gray-500">
                Fill out the form below to submit ACAA points.
              </p>
            </Reveal>
            <Reveal direction="up">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <iframe
                  src={ACAA_FORM_SRC}
                  title="ACAA Points Form"
                  className="h-[800px] w-full"
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
