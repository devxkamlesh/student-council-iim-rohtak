import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import TimetableTable from "@/components/TimetableTable";
import { getTimetable } from "@/lib/timetable";

export const metadata: Metadata = {
  title: "Student Form",
  description:
    "Submit a confidential grievance, request a wheelchair, and view the class timetable — IIM Rohtak Student Council.",
  alternates: { canonical: "/student-form" },
};

const GRIEVANCE_FORM_URL = "/grievance";
const WHEELCHAIR_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScCy_2Ien2jSKH1tfhRTfwKUY8fRWLY_nx-lSE0zQcH369bbA/viewform";

const requests = [
  {
    title: "Grievance Form",
    desc: "For all grievances, fill out this form. It is fully confidential with the Student Council.",
    cta: "Fill Grievance Form",
    href: GRIEVANCE_FORM_URL,
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: "Wheelchair Request",
    desc: "For wheelchair requirements, fill out this form. A wheelchair will be allocated by the Student Council and must be returned after use.",
    cta: "Request a Wheelchair",
    href: WHEELCHAIR_FORM_URL,
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <circle cx="9" cy="4" r="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 8v6h5l3 5M9 14a5 5 0 103.5 8.5" />
      </svg>
    ),
  },
];

export const revalidate = 3600;

export default async function StudentFormPage() {
  const timetable = await getTimetable();

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] text-white">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-blue-200 ring-1 ring-white/15">
              We&apos;re Here to Help
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">Student Forms</h1>
            <p className="mx-auto mt-4 max-w-2xl text-blue-200">
              Raise a concern, request support, and check your class schedule.
            </p>
          </div>
        </section>

        {/* Request links */}
        <section className="bg-gray-50 py-14 sm:py-16">
          <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2">
            {requests.map((r, i) => (
              <Reveal key={r.title} delay={i * 100} direction="up">
                <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    {r.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{r.title}</h2>
                  <p className="mt-1 flex-1 text-sm text-gray-600">{r.desc}</p>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    {r.cta}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5m0 0v5m0-5L10 14M9 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-3" />
                    </svg>
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Timetable */}
        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-6 text-center">
              <h2 className="fluid-h2 font-bold text-gray-900">Class Timetable</h2>
              <p className="mt-2 text-sm text-gray-600">
                Filter by day/date or section. Updates automatically from the
                official schedule.
              </p>
            </div>
            {timetable && timetable.rows.length > 0 ? (
              <TimetableTable headers={timetable.headers} rows={timetable.rows} />
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center text-sm text-gray-500">
                The timetable is currently unavailable. Please check back shortly.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
