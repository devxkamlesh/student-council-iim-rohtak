import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the IIM Rohtak Student Council website collects, uses, and protects the information you provide.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect the information you provide."
    >
      <p>
        This Privacy Policy describes how the IIM Rohtak Student Council Website
        (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses,
        and protects any information that you provide when using this website.
      </p>
      <p>
        The IIM Rohtak Student Council is committed to protecting your privacy.
        Any information collected on this Site will be used only in accordance
        with this statement. This website is developed and managed entirely by the
        Student Council and operates independently from the official IIM Rohtak
        administration or admissions office.
      </p>
      <p>
        We may update this policy periodically by revising this page. Users are
        encouraged to check this page regularly to stay informed about any
        changes.
      </p>

      <h2>Information We Collect</h2>
      <p>We may collect the following information:</p>
      <ul>
        <li>Name and contact details (such as email address)</li>
        <li>
          Demographic information (such as location, preferences, and interests)
        </li>
        <li>Other information relevant to surveys, feedback forms, or events</li>
      </ul>

      <h2>How We Use the Information</h2>
      <p>We use the collected information to:</p>
      <ul>
        <li>Maintain internal records and improve our services</li>
        <li>
          Communicate updates, events, or activities related to the Student
          Council
        </li>
        <li>Personalise the website experience according to user preferences</li>
        <li>Occasionally, reach out for feedback or surveys</li>
      </ul>
      <p>
        We will not use this data for any commercial purpose or share it with
        unauthorised third parties.
      </p>

      <h2>Data Security</h2>
      <p>
        We are committed to ensuring that your data remains secure. To prevent
        unauthorised access or disclosure, we have implemented appropriate
        physical, electronic, and administrative procedures to safeguard the
        information collected online.
      </p>

      <h2>Cookies</h2>
      <p>
        Our website may use cookies to enhance user experience, analyse site
        traffic, and personalise content. Cookies are small files placed on your
        device that help us understand user preferences.
      </p>
      <p>
        You can choose to accept or decline cookies. Most web browsers
        automatically accept cookies, but you can usually modify your browser
        settings to decline them if preferred.
      </p>
      <p>
        We may use analytics tools (such as Google Analytics) and social media
        integrations (Facebook, LinkedIn) that may collect non-personal data to
        improve site performance and engagement.
      </p>

      <h2>Links to Other Websites</h2>
      <p>
        Our website may contain links to external sites for convenience or
        reference. Once you leave our website through such links, we have no
        control over the content, privacy practices, or data collection policies
        of those websites. Please review the privacy policy of any external site
        you visit.
      </p>

      <h2>Social Media Integrations</h2>
      <p>
        Our website may include widgets or embedded features from social media
        platforms such as:
      </p>
      <ul>
        <li>
          LinkedIn (see{" "}
          <a
            href="https://www.linkedin.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn Privacy Policy
          </a>
          )
        </li>
        <li>
          Facebook (see{" "}
          <a
            href="https://www.facebook.com/about/privacy/update"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook Privacy Policy
          </a>
          )
        </li>
        <li>
          Instagram (see{" "}
          <a
            href="https://privacycenter.instagram.com/policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram Privacy Policy
          </a>
          )
        </li>
        <li>
          Gmail / Google Workspace — used for contact or communication purposes
          (see{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Privacy Policy
          </a>
          )
        </li>
      </ul>
      <p>
        These features may collect your IP address, browser details, and
        interaction data in accordance with their respective policies.
      </p>

      <h2>Controlling Your Personal Information</h2>
      <p>You may choose to restrict the collection or use of your personal information by:</p>
      <ul>
        <li>Opting out of any newsletters, communications, or marketing emails</li>
        <li>
          Requesting deletion or correction of your personal data by contacting
          us
        </li>
      </ul>
      <p>
        If you wish to update, access, or delete your information, please email us
        at: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
      <p>
        We will not sell, distribute, or lease your personal information to third
        parties unless required by law or explicitly permitted by you.
      </p>

      <h2>Contact</h2>
      <p>
        For any queries regarding this privacy policy or your data, please reach
        out at: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
      </p>
    </LegalLayout>
  );
}
