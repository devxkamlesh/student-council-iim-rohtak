import Image from "next/image";
import type { TeamMember } from "@/lib/data";

const MailIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

export default function TeamCard({
  member,
  featured = false,
}: {
  member: TeamMember;
  featured?: boolean;
}) {
  return (
    <article className="group flex flex-col items-center text-center">
      <div
        className={`relative mb-4 overflow-hidden rounded-xl ring-2 ring-gray-200 transition-all duration-300 group-hover:ring-blue-400 group-hover:shadow-xl ${
          featured ? "h-44 w-44" : "h-36 w-36"
        }`}
      >
        <Image
          src={member.image}
          alt={`${member.name} — ${member.position}`}
          fill
          sizes="(max-width: 640px) 144px, 176px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
        {member.name}
      </h3>
      <p className="mb-3 text-xs font-medium text-blue-600 sm:text-sm">
        {member.position}
      </p>
      <div className="flex items-center gap-3">
        <a
          href={`mailto:${member.email}`}
          aria-label={`Email ${member.name}`}
          title={member.email}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-blue-600 hover:text-white"
        >
          <MailIcon />
        </a>
        {member.linkedin && member.linkedin !== "#" && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${member.name} on LinkedIn`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-[#0a66c2] hover:text-white"
          >
            <LinkedInIcon />
          </a>
        )}
      </div>
    </article>
  );
}
