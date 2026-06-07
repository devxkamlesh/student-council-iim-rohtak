import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ImageCarousel from "@/components/ImageCarousel";
import TedxCarousel, { type TedxVideo } from "@/components/TedxCarousel";
import { getClubs, getFlagshipEvents } from "@/lib/queries";

export const metadata: Metadata = {
  title: "RC's & Events",
  description:
    "Flagship events Infusion and TEDxIIMRohtak, plus recreational clubs — Competition Cell, ECIS, Explor, Readers & Writers, Sparsh, Wellness, Inquizire, and Voice.",
  alternates: { canonical: "/events" },
};

export const dynamic = "force-dynamic";

// TEDxIIMRohtak talks shown in the horizontal video carousel.
// Add more talks by appending their YouTube video IDs here.
const tedxVideos: TedxVideo[] = [
  { id: "4lTGqYR0yUI", title: "TEDxIIMRohtak" },
  { id: "6LZ7QqoY_1w", title: "TEDxIIMRohtak" },
  { id: "xeLr2SxzT0g", title: "TEDxIIMRohtak" },
];

export default async function EventsPage() {
  const [recreationalClubs, flagshipEvents] = await Promise.all([
    getClubs("recreational"),
    getFlagshipEvents(),
  ]);
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] text-white">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              RC&apos;s &amp; Events
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-blue-200">
              From North India&apos;s most prestigious B-school fest to vibrant
              recreational clubs — there&apos;s always something happening at IIM
              Rohtak.
            </p>
          </div>
        </section>

        {/* Recreational Clubs */}
        <section className="bg-gray-50 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="mb-12 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Beyond Academics
              </span>
              <h2 className="fluid-h2 mt-2 font-bold text-gray-900">
                Recreational Clubs
              </h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recreationalClubs.map((club, i) => (
                <Reveal key={club.name} delay={(i % 4) * 80} direction="up">
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                    <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] p-5">
                      <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
                      <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-white ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110">
                        <Image
                          src={club.image}
                          alt={`${club.name} logo`}
                          fill
                          sizes="96px"
                          className="object-contain p-2"
                        />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5 pt-2">
                      <h3 className="mb-2 mt-3 text-center text-sm font-semibold text-gray-900 sm:text-base">
                        {club.name}
                      </h3>
                      <div
                        className="rich-content flex-1 text-xs leading-relaxed text-gray-600 sm:text-sm"
                        dangerouslySetInnerHTML={{ __html: club.description }}
                      />
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Flagship Events */}
        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="mb-12 text-center">
              <span className="text-sm font-semibold uppercase tracking-widest text-blue-600">
                Marquee Events
              </span>
              <h2 className="fluid-h2 mt-2 font-bold text-gray-900">
                Flagship Events
              </h2>
              <div className="mx-auto mt-4 h-1 w-20 rounded bg-blue-600" />
            </Reveal>

            <div className="space-y-12">
              {flagshipEvents.map((event, idx) => (
                <Reveal key={event.name} direction={idx % 2 === 0 ? "left" : "right"}>
                  <article
                    className={`flex flex-col gap-8 lg:items-center lg:gap-12 ${
                      idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                    }`}
                  >
                    {/* Carousel */}
                    <div className="w-full lg:w-1/2">
                      <ImageCarousel images={event.images} alt={event.name} />
                    </div>
                    {/* Text */}
                    <div className="w-full lg:w-1/2">
                      <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                        Flagship Event
                      </span>
                      <h3 className="mb-4 mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                        {event.name}
                      </h3>
                      <div
                        className="rich-content text-sm leading-relaxed text-gray-600 sm:text-base"
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TEDx Section */}
        <section className="relative overflow-hidden bg-[#0a0a0a] py-16 sm:py-20">
          {/* topographic contour lines */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.10]"
            preserveAspectRatio="none"
            viewBox="0 0 1200 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              <path
                key={i}
                d={`M0 ${80 + i * 48} C 250 ${20 + i * 48}, 450 ${160 + i * 48}, 700 ${90 + i * 48} S 1100 ${30 + i * 48}, 1200 ${110 + i * 48}`}
                stroke="#eb0028"
                strokeWidth="1"
              />
            ))}
          </svg>
          {/* ambient red glows */}
          <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-red-600/20 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-80 w-80 translate-x-1/2 rounded-full bg-red-600/10 blur-[120px]" />

          <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6">
            {/* Header row: big title + description (aligned to video frame width) */}
            <div className="mb-10 grid items-center gap-8 px-[60px] sm:px-20 lg:mb-14 lg:grid-cols-2 lg:gap-12">
              <Reveal direction="left">
                <h2 className="font-serif leading-[0.95] text-white">
                  <span className="block text-5xl font-bold sm:text-6xl md:text-7xl">
                    <span className="text-[#eb0028]">TED</span>
                    <sup className="top-[-0.5em] text-3xl sm:text-4xl md:text-5xl">x</sup>
                  </span>
                  <span className="mt-1 block text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                    IIM ROHTAK
                  </span>
                </h2>
              </Reveal>

              <Reveal direction="right" className="lg:pl-6">
                <p className="max-w-md text-sm leading-relaxed text-gray-300 sm:text-base">
                  TEDx IIM Rohtak is an independently organized TED event that
                  brings diverse speakers to campus, inspiring students with
                  powerful ideas on leadership, resilience, innovation, and
                  personal growth.
                </p>
                <a
                  href="https://www.youtube.com/results?search_query=TEDxIIMRohtak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-block rounded-sm border border-white/40 px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-[#eb0028] hover:bg-[#eb0028]"
                >
                  Read More
                </a>
              </Reveal>
            </div>

            {/* Video carousel */}
            <Reveal direction="zoom">
              <TedxCarousel videos={tedxVideos} />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
