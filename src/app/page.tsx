import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TeamCard from "@/components/TeamCard";
import CollapsibleTeam from "@/components/CollapsibleTeam";
import Reveal from "@/components/Reveal";
import { SITE } from "@/lib/data";
import { getTeamByBatches, getHighlights, getSiteSettings } from "@/lib/queries";

const highlightIcons: Record<string, React.ReactElement> = {
  committees: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a3 3 0 10-3-3" />
    </svg>
  ),
  clubs: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  events: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  leave: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const [batchTeams, highlights, settings] = await Promise.all([
    getTeamByBatches(),
    getHighlights(),
    getSiteSettings(),
  ]);

  const currentBatch = batchTeams.find((b) => b.isCurrent) ?? batchTeams[0] ?? null;
  const previousBatches = batchTeams.filter((b) => b.code !== currentBatch?.code);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] text-white">
          {/* white dotted grid background */}
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
          {/* soft glow blobs */}
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-4 py-12 sm:px-6 md:flex-row md:gap-14 md:py-16">
            <div className="flex-shrink-0 animate-fade-in-up">
              <Image
                src={settings.logoUrl}
                alt="Student Council IIM Rohtak official logo"
                width={300}
                height={300}
                className="h-32 w-32 rounded-full object-cover shadow-2xl ring-4 ring-white/20 transition-transform duration-500 hover:scale-105 sm:h-40 sm:w-40 lg:h-48 lg:w-48"
                priority
              />
            </div>

            <div className="animate-fade-in-up text-center md:text-left" style={{ animationDelay: "120ms" }}>
              <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-blue-200 ring-1 ring-white/15">
                Indian Institute of Management Rohtak
              </p>
              <h1 className="fluid-h1 font-bold">
                Empowering Student Welfare &amp; Engagement
              </h1>
              <p className="mt-4 text-lg font-light tracking-[0.3em] text-blue-200 sm:text-xl lg:text-2xl">
                INSPIRE • SERVE • LEAD
              </p>
            </div>
          </div>
        </section>

        {/* Banner — fixed/contained width, centered */}
        <section className="bg-gray-50 py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-lg sm:aspect-[5/2]">
              <Image
                src={settings.heroBannerUrl}
                alt="IIM Rohtak campus"
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* bottom-up gradient for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f2d3d]/90 via-[#1f2d3d]/30 to-transparent" />
              {/* scanner line — sweeps down on hover (subtle) */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="scanner-line absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              </div>
              {/* overlay text at bottom */}
              <div className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-8 sm:pb-8">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-blue-200 sm:text-sm">
                  Welcome to the Official Website of
                </p>
                <h2 className="text-2xl font-bold leading-tight text-white drop-shadow-lg sm:text-3xl md:text-4xl">
                  Student Council, IIM Rohtak
                </h2>
                <span className="mt-3 block h-1 w-20 rounded bg-blue-400 sm:w-28" />
              </div>
            </div>
          </div>
        </section>



        {/* About */}
        <section id="about" className="scroll-mt-20 bg-white py-16">
          <Reveal className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Who We Are
              </span>
              <h2 className="fluid-h2 mt-2 font-bold text-gray-900">
                About the Student Council
              </h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
            </div>
            <p className="mt-8 text-base leading-relaxed text-gray-600 sm:text-lg text-justify">
              The Student Council serves as the central pillar of the General
              Student Body (GSB), dedicated to representing and promoting the
              interests of all students. We work tirelessly to safeguard
              individual rights while ensuring harmony within the broader
              community. As the head of student administration, we manage and
              resolve matters concerning the GSB, collaborate with the
              administration to uphold discipline, and oversee the functioning of
              clubs, committees, and student interest groups. Our commitment
              extends to organizing key meetings, conducting elections, and
              ensuring democratic processes, all while fostering a balanced and
              vibrant student environment.
            </p>
          </Reveal>
        </section>

        {/* Highlights */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="mb-12 text-center">
              <h2 className="fluid-h2 font-bold text-gray-900">
                What We Do
              </h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item, i) => (
                <Reveal key={item.title} delay={i * 100} direction="up">
                  <Link
                    href={item.href}
                    className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                      {highlightIcons[item.iconKey]}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <div
                      className="rich-content text-sm leading-relaxed text-gray-500"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Current Senior Team (the active batch, shown expanded) */}
        {currentBatch && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <Reveal className="mb-12 text-center">
                <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                  {currentBatch.label} — Current
                </span>
                <h2 className="fluid-h2 mt-2 font-bold text-gray-900">
                  Senior Team
                </h2>
                <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
              </Reveal>

              {/* Leadership */}
              <div className="mb-12 flex flex-wrap justify-center gap-10 sm:gap-16">
                {currentBatch.members.slice(0, 2).map((m, i) => (
                  <Reveal key={m.name} delay={i * 120} direction="zoom">
                    <TeamCard member={m} featured />
                  </Reveal>
                ))}
              </div>

              {/* Secretaries */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
                {currentBatch.members.slice(2).map((m, i) => (
                  <Reveal key={m.name} delay={i * 80} direction="up">
                    <TeamCard member={m} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Previous councils — each batch collapsed ("closed") */}
        {previousBatches.length > 0 && (
          <section className="bg-gray-50 py-16">
            <div className="space-y-8">
              {previousBatches.map((b) => (
                <Reveal key={b.code}>
                  <CollapsibleTeam
                    team={b.members}
                    eyebrow="Previous Council"
                    title={b.label}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-14 text-white">
          <Reveal direction="up" className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Have a concern or grievance?
            </h2>
            <p className="mt-3 text-blue-100">
              Reach out to the Student Council — your voice matters and stays
              confidential.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-6 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-transform hover:scale-105"
            >
              Contact Us
            </a>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
