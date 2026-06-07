import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and Conditions for using the IIM Rohtak Student Council website — rules, intellectual property, user content, and liability.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="The rules and regulations for the use of the Student Council, IIM Rohtak website."
    >
      <p>Welcome to the IIM Rohtak Student Council Website!</p>
      <p>
        These Terms and Conditions outline the rules and regulations for the use
        of the Student Council, IIM Rohtak&apos;s website.
      </p>
      <p>
        By accessing this website, you agree to be bound by these Terms and
        Conditions. If you do not agree with any part of these terms, please
        refrain from using the website.
      </p>
      <p>
        This website is created, managed, and maintained solely by the Student
        Council of IIM Rohtak. It is not an official website of IIM Rohtak and
        has no association with the Institute&apos;s administration, admissions
        office, or faculty.
      </p>

      <h2>1. Definitions</h2>
      <p>In these Terms and Conditions:</p>
      <ul>
        <li>
          &ldquo;You&rdquo;, &ldquo;Your&rdquo;, and &ldquo;User&rdquo; refer to
          the individual accessing or using the website.
        </li>
        <li>
          &ldquo;We&rdquo;, &ldquo;Us&rdquo;, and &ldquo;Our&rdquo; refer to the
          Student Council, IIM Rohtak.
        </li>
        <li>
          &ldquo;Website&rdquo; refers to the IIM Rohtak Student Council
          website.
        </li>
      </ul>

      <h2>2. Cookies</h2>
      <p>
        We use cookies to improve user experience and functionality. By using
        this website, you consent to the use of cookies in accordance with our
        Privacy Policy.
      </p>
      <p>
        Cookies help us analyse web traffic and tailor our content to user
        preferences. Some of our analytics or social media partners (like Google
        Analytics or Facebook) may also use cookies.
      </p>

      <h2>3. Intellectual Property</h2>
      <p>
        Unless otherwise stated, all content, materials, and intellectual
        property on this website are owned by the Student Council, IIM Rohtak.
        All rights are reserved.
      </p>
      <p>
        You may view and use content from this website for personal,
        non-commercial purposes only, subject to the following restrictions. You
        must not:
      </p>
      <ul>
        <li>Republish material from this website</li>
        <li>Sell, rent, or sub-license website content</li>
        <li>Reproduce or copy material for commercial purposes</li>
        <li>Redistribute website content on any other platform</li>
      </ul>

      <h2>4. User-Generated Content</h2>
      <p>
        Certain sections of this website may allow users to post comments,
        opinions, or feedback. The Student Council, IIM Rohtak does not
        pre-screen, edit, or review such content before it appears. Comments
        reflect the views of the individual posting them, not the Student
        Council.
      </p>
      <p>
        We reserve the right to remove any comments that are inappropriate,
        offensive, or violate these Terms.
      </p>
      <p>By posting content on our website, you confirm that:</p>
      <ul>
        <li>You own or have permission to post such content.</li>
        <li>Your comments do not infringe upon any third-party rights.</li>
        <li>
          Your comments do not contain defamatory, obscene, or unlawful
          material.
        </li>
        <li>Your content will not be used for commercial or illegal purposes.</li>
      </ul>
      <p>
        You grant the Student Council, IIM Rohtak a non-exclusive right to use,
        reproduce, or edit your submitted content for display purposes on this
        site.
      </p>

      <h2>5. Hyperlinking to Our Content</h2>
      <p>
        The following organisations may link to our website without prior written
        approval:
      </p>
      <ul>
        <li>Government agencies</li>
        <li>Search engines</li>
        <li>News organizations</li>
        <li>Educational institutions and student bodies</li>
      </ul>
      <p>
        These organisations may link to our homepage or public pages, provided
        that the link:
      </p>
      <ul>
        <li>Is not misleading or deceptive</li>
        <li>Does not falsely imply endorsement or affiliation</li>
        <li>Fits appropriately within the linking site&apos;s context</li>
      </ul>
      <p>
        For other organizations seeking to link, please contact us at{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with your website
        details and purpose. We will review and respond within 2–3 weeks.
      </p>

      <h2>6. iFrames</h2>
      <p>
        Without prior written permission, you may not create frames around our
        web pages that alter the visual presentation or appearance of our
        website.
      </p>

      <h2>7. Content Liability</h2>
      <p>
        We are not responsible for any content that appears on external websites
        linked from ours. By linking to our site, you agree to defend and
        indemnify us against any claims related to your website.
      </p>
      <p>
        No link should appear on any page that may be interpreted as defamatory,
        obscene, unlawful, or infringing on third-party rights.
      </p>

      <h2>8. Reservation of Rights</h2>
      <p>
        We reserve the right to request the removal of any link to our website or
        to amend these Terms and Conditions at any time. By continuing to use or
        link to our website, you agree to be bound by the most recent version of
        these Terms.
      </p>

      <h2>9. Removal of Links</h2>
      <p>
        If you find any link on our website that you believe is inappropriate or
        offensive, you may contact us. We will review your request, but we are
        not obligated to remove the link or respond directly.
      </p>

      <h2>10. Disclaimer</h2>
      <p>
        To the fullest extent permitted by law, we exclude all warranties,
        representations, and conditions relating to this website and its content.
        Nothing in this disclaimer shall:
      </p>
      <ul>
        <li>
          Limit or exclude liability for death or personal injury caused by
          negligence
        </li>
        <li>Limit or exclude liability for fraud or misrepresentation</li>
        <li>Limit liabilities that cannot be limited under applicable law</li>
      </ul>
      <p>
        As long as the website and its information are provided free of charge,
        the Student Council, IIM Rohtak will not be liable for any loss or damage
        of any nature arising from its use.
      </p>
    </LegalLayout>
  );
}
