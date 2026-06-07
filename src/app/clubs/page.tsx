import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SocialIcons from "@/components/SocialIcons";
import { getClubs } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Clubs",
  description:
    "Explore the domain clubs of IIM Rohtak — ArthaShastra, FIC, Humane-R, Marque, Organon, Wazir, and Operations Management Club.",
  alternates: { canonical: "/clubs" },
};

export const dynamic = "force-dynamic";

export default async function ClubsPage() {
  const domainClubs = await getClubs("domain");
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] text-white">
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="mb-3 inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-blue-200 ring-1 ring-white/15">
              General Student Body
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Domain Clubs
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-blue-200">
              Clubs are student organizations of the General Student Body
              responsible for engaging students in various domain-specific
              activities, knowledge-sharing, and career development.
            </p>
          </div>
        </section>

        {/* Clubs Grid */}
        <section className="bg-gray-50 py-14 sm:py-16">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-6 px-4 sm:px-6">
            {domainClubs.map((club, i) => (
              <Reveal
                key={club.name}
                delay={(i % 3) * 100}
                direction="up"
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
              >
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  {/* Logo area */}
                  <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#2c3e50] via-[#34495e] to-[#1f2d3d] p-6">
                    {/* dotted grid overlay (same as hero) */}
                    <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" />
                    <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-white p-2 ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-105">
                      <Image
                        src={club.image}
                        alt={`${club.name} logo`}
                        fill
                        sizes="112px"
                        className="object-contain p-1"
                      />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6 pt-0">
                    <h2 className="mb-1 mt-3 text-center text-lg font-semibold text-gray-900">
                      {club.name}
                    </h2>
                    {/* Decorative curve under heading — full width */}
                    <svg
                      className="mb-3 w-full"
                      height="12"
                      viewBox="0 0 300 12"
                      preserveAspectRatio="none"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 0C75 0 75 10 150 10C225 10 225 0 300 0"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="text-blue-500 transition-colors duration-300 group-hover:text-blue-600"
                      />
                    </svg>
                    <div
                      className="rich-content mb-5 flex-1 text-sm leading-relaxed text-gray-600"
                      dangerouslySetInnerHTML={{ __html: club.description }}
                    />
                    <div className="flex justify-center border-t border-gray-100 pt-4">
                      <SocialIcons socials={club.socials} name={club.name} />
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
