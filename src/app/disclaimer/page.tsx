import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Website disclaimer for the IIM Rohtak Student Council site, including external links and affiliates disclaimers.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalLayout
      title="Disclaimer"
      subtitle="Important information about the use of this website and its content."
    >
      <h2>Website Disclaimer</h2>
      <p>
        The information provided by the IIM Rohtak Student Council Website
        (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) on this website
        (the &ldquo;Site&rdquo;) is intended for general informational purposes
        only. All content on the Site is published in good faith; however, we
        make no representation or warranty of any kind, express or implied,
        regarding the accuracy, adequacy, validity, reliability, availability, or
        completeness of any information presented.
      </p>
      <p>
        Under no circumstances shall we be liable for any loss or damage of any
        kind incurred as a result of using the Site or relying on any information
        provided. Your use of the Site and your reliance on any information
        available on it are entirely at your own risk.
      </p>
      <p>
        This website is created, managed, and maintained solely by the Student
        Council of IIM Rohtak. It is not an official website of the Indian
        Institute of Management Rohtak, nor is it affiliated with the
        Institute&apos;s administration, faculty, or admissions office in any
        capacity.
      </p>

      <h2>External Links Disclaimer</h2>
      <p>
        The Site may include links to external websites or content belonging to
        or originating from third parties, or links contained in banners or other
        advertising. Such external links are not monitored, verified, or checked
        for accuracy, reliability, or completeness by us.
      </p>
      <p>
        We do not warrant, endorse, or assume responsibility for the accuracy or
        reliability of any information offered by third-party websites linked
        through the Site. We are not responsible for any transactions,
        communications, or dealings between you and third-party providers of
        products or services accessed through these links.
      </p>

      <h2>Affiliates Disclaimer</h2>
      <p>
        The Site may contain links to affiliate or partner websites. The Student
        Council of IIM Rohtak does not receive any commission, compensation, or
        benefit from such links and bears no responsibility for any actions or
        purchases made by you through those websites.
      </p>
    </LegalLayout>
  );
}
