export type TeamMember = {
  name: string;
  position: string;
  email: string;
  linkedin: string;
  image: string;
};

export const SITE = {
  name: "Student Council, IIM Rohtak",
  shortName: "Student Council IIM Rohtak",
  tagline: "Inspire | Serve | Lead",
  url: "https://studentcounciliimr.in",
  logo: "https://studentcounciliimr.in/wp-content/uploads/2025/09/cropped-sc-logo-1-270x270.jpg",
  banner: "/iim-rohtak-campus.jpg",
  email: "student.council@iimrohtak.ac.in",
  description:
    "The official Student Council of IIM Rohtak. Representing and promoting the interests of the General Student Body through clubs, committees, events, and student welfare initiatives.",
};

export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Committees", href: "/committees" },
  { label: "Clubs", href: "/clubs" },
  { label: "RC's & Events", href: "/events" },
  { label: "Leave & Others", href: "/leave" },
  { label: "Student Form", href: "/student-form" },
  { label: "E-Learning", href: "/e-learning" },
  { label: "Calendar", href: "/calendar" },
];

export const seniorTeam: TeamMember[] = [
  {
    name: "Rishabh Gupta",
    position: "President",
    email: "ipm04rishabhg@iimrohtak.ac.in",
    linkedin: "https://linkedin.com/in/rishabhguptaiim",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/cc30f30f-f6ff-4ea9-8e2b-8e2f081567f2-200x180.jpg",
  },
  {
    name: "Chaudhari Nareshkumar",
    position: "Vice-President",
    email: "pgp16chaudharim@iimrohtak.ac.in",
    linkedin: "https://www.linkedin.com/in/nareshkumar51/",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Naresh-200x186.png",
  },
  {
    name: "Hardik Agarwal",
    position: "Administrative Secretary",
    email: "pgp16hardika@iimrohtak.ac.in",
    linkedin: "https://linkedin.com/in/hardikagarwal2813",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Hardik-200x191.png",
  },
  {
    name: "Girisha",
    position: "Clubs Secretary",
    email: "ipm04girisha@iimrohtak.ac.in",
    linkedin: "https://linkedin.com/in/girisha-5b7762266",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Girisha-200x189.png",
  },
  {
    name: "Gunjit Suri",
    position: "Events Secretary",
    email: "pgp16gunjits@iimrohtak.ac.in",
    linkedin: "https://linkedin.com/in/gunjit-suri-555114170",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Gunjit-200x189.png",
  },
  {
    name: "Harsh Samvedi",
    position: "General Affairs Secretary",
    email: "ipm04harshs@iimrohtak.ac.in",
    linkedin: "https://linkedin.com/in/hsamvedi",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Harsh-200x189.png",
  },
  {
    name: "Manan Bhargav",
    position: "Student Welfare Secretary",
    email: "pgp16mananb@iimrohtak.ac.in",
    linkedin: "https://linkedin.com/in/manan-bhargava-2ba236228",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Manan-Bhargav-200x187.png",
  },
  {
    name: "Ashmit Gothwal",
    position: "Treasury Secretary",
    email: "ipm04ashmitg@iimrohtak.ac.in",
    linkedin: "https://linkedin.com/in/ashmit-gothwal-63695a255",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Ashmit-200x189.png",
  },
];

export const sc15Team: TeamMember[] = [
  {
    name: "Oshan Rai",
    position: "President",
    email: "ipm03oshanr@iimrohtak.ac.in",
    linkedin: "#",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Screenshot-2025-11-26-194058-200x189.png",
  },
  {
    name: "Shashwat Singh",
    position: "Vice-President",
    email: "ipm03shashwats@iimrohtak.ac.in",
    linkedin: "#",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Screenshot-2025-11-26-194201-200x191.png",
  },
  {
    name: "Aditya Kumar",
    position: "Administrative Secretary",
    email: "ipm03adityak@iimrohtak.ac.in",
    linkedin: "#",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Screenshot-2025-11-26-194118-200x187.png",
  },
  {
    name: "Ayush Asati",
    position: "Clubs Secretary",
    email: "ipm03ayusha@iimrohtak.ac.in",
    linkedin: "#",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Screenshot-2025-11-26-194246-200x191.png",
  },
  {
    name: "Kshitij Dangle",
    position: "Events Secretary",
    email: "ipm03kshitijd@iimrohtak.ac.in",
    linkedin: "#",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Screenshot-2025-11-26-194226-200x190.png",
  },
  {
    name: "Aditi Ojha",
    position: "General Affairs Secretary",
    email: "pgp15aditio@iimrohtak.ac.in",
    linkedin: "#",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Screenshot-2025-11-26-194143-200x188.png",
  },
  {
    name: "Manan Baweja",
    position: "Student Welfare Secretary",
    email: "ipm03mananb@iimrohtak.ac.in",
    linkedin: "#",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Screenshot-2025-11-26-194310-200x189.png",
  },
  {
    name: "Arjun Totawad",
    position: "Treasury Secretary",
    email: "pgp15arjunt@iimrohtak.ac.in",
    linkedin: "#",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/Screenshot-2025-11-26-194334-200x190.png",
  },
];

export type SocialLinks = {
  email?: string;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
};

export type Committee = {
  name: string;
  description: string;
  image: string;
  socials: SocialLinks;
};

const U = "https://studentcounciliimr.in/wp-content/uploads/2025/09";

export const committeesHero =
  "https://studentcounciliimr.in/wp-content/uploads/2025/09/IIM-Rohtak-1.webp";

export const committees: Committee[] = [
  {
    name: "Academic Committee",
    description:
      "The Academic Committee serves as a vital link between the administration and students, addressing all academic-related matters and concerns. It coordinates and conducts significant events, including guest lectures, convocations, inductions, and the Foundation Day, while ensuring the smooth operation of academic activities and the timely dissemination of relevant academic information.",
    image: `${U}/Acad.webp`,
    socials: { email: "academic@iimrohtak.ac.in" },
  },
  {
    name: "Student Alumni Committee",
    description:
      "A dedicated body focused on strengthening and nurturing ties between the institute and its alumni. It leads initiatives including the flagship Annual Alumni Meet, Aluminati Chapter Meets, the Kathor Vani podcast series, and a mentorship program. It also assists students through mock interviews, group discussions, and a structured mentorship framework.",
    image: `${U}/alumni.webp`,
    socials: {
      email: "iimrohtak.alumni@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/alumni_iimrohtak",
      linkedin: "https://www.linkedin.com/company/alumni-relations-iim-rohtak/",
      facebook: "https://www.facebook.com/IIMRAlumniAssociation",
    },
  },
  {
    name: "Cultural Committee",
    description:
      "The committee plays a pivotal role in uniting the student community by organising a wide range of events and activities that offer students a platform to showcase their talents, including the Gokul Event for the PGP15 batch and the lively Matki-Phod celebration during Janmashtami.",
    image: `${U}/cultcomm.png`,
    socials: {
      email: "cultural.committee@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/cultcom_iimr/",
      facebook: "https://www.facebook.com/IIMRCultCom",
    },
  },
  {
    name: "Entrepreneurship & Innovation Council",
    description:
      "The Entrepreneurship Cell fosters a dynamic entrepreneurial ecosystem through guest lectures, workshops, business plan competitions, and its flagship event, Udaan. Its business incubator, Bizdome, supports budding entrepreneurs with marketing assistance, mentorship, consultancy, and networking with venture capitalists.",
    image: `${U}/eic.webp`,
    socials: {
      email: "ecell@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/entrepreneurship_iimrohtak/",
      linkedin:
        "https://www.linkedin.com/company/entrepreneurship-innovation-council/",
    },
  },
  {
    name: "Election & Auditing Committee",
    description:
      "ENAC oversees the general body elections at IIM Rohtak and audits committees utilising student-associated funds. Leading by example with integrity, it promotes ethical conduct, manages conflicts, and monitors the activities of various clubs and committees to ensure smooth operations across the institute.",
    image: `${U}/enac.webp`,
    socials: { email: "enac@iimrohtak.ac.in" },
  },
  {
    name: "Hospitality Committee",
    description:
      "The Hospitality Committee manages the mess and hostel facilities, ensuring smooth operations for over 700 students. Acting as a liaison between the student body and the administration, it plays a key role in resolving issues related to accommodation and food services.",
    image: `${U}/Hoscomm.webp`,
    socials: {
      email: "hospitality@iimrohtak.ac.in",
      linkedin:
        "https://www.linkedin.com/company/hospitality-committee-iim-rohtak/",
    },
  },
  {
    name: "Industry Relations and Interaction Cell",
    description:
      "IRIC is dedicated to enhancing the institute™s engagement with the corporate world. The cell simplifies the placement process by crafting a polished image of the batch and bringing top professionals to campus. It also fosters knowledge sharing to help students develop industry-relevant skills.",
    image: `${U}/IRIC.webp`,
    socials: {
      email: "iric.iimrohtak@iimrohtak.ac.in",
      linkedin:
        "https://www.linkedin.com/in/industry-relations-and-interaction-cell-iim-rohtak-15862054/",
    },
  },
  {
    name: "IT Committee",
    description:
      "The IT Committee empowers students with skills essential for the IT Management domain. It provides live internship projects, hosts lectures from tech experts, and collaborates with companies like KPMG. It hosts Knowledge-Sharing Sessions, National Case Study Competitions, Quizzing Events, and e-sports Tournaments.",
    image: `${U}/IT.webp`,
    socials: {
      email: "it.committee@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/itcom_iimr/",
      facebook: "https://www.facebook.com/itcommitteeiimr",
      linkedin:
        "https://www.linkedin.com/in/it-committee-iim-rohtak-b71235193/",
    },
  },
  {
    name: "Placement Committee",
    description:
      "The Placement Committee connects top-tier organizations with our talent pool, working closely with the institute™s Placement Office to ensure a smooth recruitment process. IIM Rohtak is ranked 12th in the NIRF Management Category, accredited by AMBA, and ranked 151+ in the QS World University Rankings 2024.",
    image: `${U}/Screenshot-2025-09-29-at-12.06.33-PM.png`,
    socials: {
      email: "placement@iimrohtak.ac.in",
      linkedin:
        "https://www.linkedin.com/company/placements-committee-iim-rohtak/about/",
    },
  },
  {
    name: "Placement Preparation Committee",
    description:
      "The PPC enables each student to achieve their career goals by anchoring and streamlining the internship and placement process. It focuses solely on the training and development of students, aligning them with industry needs through knowledge-sharing, skill-building, and personality development.",
    image: `${U}/ppc.webp`,
    socials: {
      email: "placementpreparation@iimrohtak.ac.in",
      linkedin:
        "https://www.linkedin.com/company/placement-preparation-committee-iim-rohtak/",
      facebook:
        "https://www.facebook.com/PlacementPreparationCommitteeIIMRohtak",
    },
  },
  {
    name: "Public Relations Cell",
    description:
      "The PR Cell promotes the institute™s values, achievements, and brand identity. Serving as the face of IIM Rohtak, it enhances visibility through various media platforms, manages the institute™s image, and fosters strong relationships with internal and external stakeholders.",
    image: `${U}/PR-Cell.webp`,
    socials: {
      email: "public.relations@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/iimrohtak/",
      linkedin: "https://www.linkedin.com/school/iim-rohtak/",
      facebook: "https://www.facebook.com/IndianInstituteOfManagementRohtak",
    },
  },
  {
    name: "Sports Committee",
    description:
      "The Sports Committee fosters a vibrant sports culture that promotes physical well-being and teamwork among students. By organizing various sports events and activities, it provides a refreshing break from the academic schedule while encouraging a healthy, competitive spirit and camaraderie within IIM Rohtak.",
    image: `${U}/SPORTSCOM-LOGO-01-2-1024x1024.png`,
    socials: {
      email: "sports@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/sportscomiimr/",
      linkedin: "https://www.linkedin.com/company/sports-committee-iim-rohtak/",
      facebook: "https://www.facebook.com/watch/sports.iimrohtak/",
    },
  },
];

export type Club = {
  name: string;
  description: string;
  image: string;
  socials: SocialLinks;
};

export const domainClubs: Club[] = [
  {
    name: "ArthaShastra",
    description:
      "The youngest domain club dedicated to cultivating a strong foundation in economics and public policy. Fosters discussions on socio-economic and financial topics, connects students with professionals, and hosts workshops, games, and lectures.",
    image: `${U}/Artha-1.webp`,
    socials: {
      email: "economicssig@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/arthashastra_iimrohtak",
    },
  },
  {
    name: "Finance and Investment Club (FIC)",
    description:
      "A student-led initiative building a vibrant finance community. Focuses on cultivating interest in finance, deepening knowledge, nurturing talent, and creating career advancement opportunities. Empowers future finance leaders through inclusive learning and impactful experiences.",
    image: `${U}/FIC-2.webp`,
    socials: {
      email: "fi@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/fic_iimr",
    },
  },
  {
    name: "Humane-R",
    description:
      "Provides students with holistic knowledge of Human Resource Management. Delivers insightful events, knowledge sessions, and HR-focused competitions to enhance management abilities while keeping up with the latest developments in the field.",
    image: `${U}/HumaneR-1.webp`,
    socials: {
      email: "humane.r@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/humane.r_iimrohtak",
    },
  },
  {
    name: "Marque",
    description:
      "IIM Rohtak's Marketing club that fosters and strives to build the marketing acumen of the batch. Creates a community of marketers through live projects, industry sessions, offline events, and provides the latest updates in marketing.",
    image: `${U}/Marque-1.webp`,
    socials: {
      email: "marketingclub@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/marque_iimrohtak",
    },
  },
  {
    name: "Organon",
    description:
      "Aimed at fostering interest and expertise in analytics. Helps students develop critical skills through seminars, webinars, and hands-on events including Certification Drives, Competency Builder Events, Case Study Competitions, Quiz Competitions, and Online Treasure Hunts.",
    image: `${U}/Organon.webp`,
    socials: {
      email: "analyticsclub@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/analyticsclub_iimr",
    },
  },
  {
    name: "Wazir",
    description:
      "The Strategy and Consulting Club of IIM Rohtak. Aims to empower students with consulting industry knowledge and skills. Has six verticals, over 250 publications and 100+ events, bridging academia and industry through partnerships and innovative initiatives.",
    image: `${U}/Wazir.webp`,
    socials: {
      email: "snc@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/wazir_iimrohtak",
    },
  },
  {
    name: "Operations Management Club",
    description:
      "Seeks to help IIM-R students have a deeper awareness of the prospects, career pathways, and contemporary topics within Supply Chain and Operations Management. Leverages member-driven events and engaging activities to pique students' interest.",
    image: `${U}/opsentrix.webp`,
    socials: {
      email: "operationsclub@iimrohtak.ac.in",
      instagram: "https://www.instagram.com/opscentrix_iimrohtak",
    },
  },
];

const E = "https://studentcounciliimr.in/wp-content/uploads/2025/11";

export type FlagshipEvent = {
  name: string;
  description: string;
  images: string[];
};

export type RecClub = {
  name: string;
  description: string;
  image: string;
};

export const flagshipEvents: FlagshipEvent[] = [
  {
    name: "Infusion",
    description:
      "IIM Rohtak's flagship annual techno-cultural-management fest with a management legacy spanning 15 years. One of North India's most prestigious B-school festivals, attracting an annual footfall of over 12,000+ people from 100+ participating colleges competing in more than 75 captivating events. The multi-day event features case competitions, creative marketing challenges, AI innovation challenge, Comedy Night, EDM Night, and headline performances by renowned artists.",
    images: [
      `${E}/WhatsApp-Image-2025-11-26-at-8.05.15-PM-1.jpeg`,
      `${E}/WhatsApp-Image-2025-11-26-at-8.05.14-PM-1.jpeg`,
      `${E}/WhatsApp-Image-2025-11-26-at-8.05.16-PM-1.jpeg`,
    ],
  },
  {
    name: "TEDxIIMRohtak",
    description:
      "An independently organised TED event dedicated to spreading Ideas worth spreading. Since its inception in 2015, it has become a premier campus event with a legacy of 9 successful editions. The platform has hosted over 48 diverse speakers, including scientists, artists, and entrepreneurs, and engaged more than 1000+ participants. A dedicated student team manages all aspects, from curating speakers to handling design, logistics, and PR.",
    images: [
      `${E}/WhatsApp-Image-2025-11-26-at-8.05.15-PM-1-1.jpeg`,
    ],
  },
];

export const recreationalClubs: RecClub[] = [
  {
    name: "Competition Cell",
    description:
      "Dedicated to fostering excellence through competitions and cultivating a vibrant case study culture. Bridges the gap between classroom theory and real-world action. Helps students gain industry readiness and secure PPIs/PPOs through skill development workshops and alumni interactions.",
    image: `${E}/competition-cell-logo-1.webp`,
  },
  {
    name: "Every Child In School (ECIS)",
    description:
      "A non-domain club under the Social Development Cell with the vision to build a nation where no child remains uneducated. Extends education to underprivileged children through offline and online sessions, provides study material, and promotes value-based education through storytelling and role-play.",
    image: `${E}/eics-1.webp`,
  },
  {
    name: "Explor Club",
    description:
      "The Film, Media, and Photography Club that promotes creativity and visual storytelling on campus. Hosts Movie Nights, Cartoon Screenings, Dumb Charades, CineQuest (Movie Dialogue Quiz Challenge), and Sketch-A-Thon.",
    image: `${E}/exploR-logo.webp`,
  },
  {
    name: "Readers and Writers Club",
    description:
      "Dedicated to cultivating a rich culture of reading and writing. Publishes thought-provoking newsletters, hosts literary events, and provides a platform for creative expression. Aims to inspire curiosity and build a vibrant community of book lovers and storytellers.",
    image: `${E}/RnW-logo.webp`,
  },
  {
    name: "Sparsh ï¿½' Social Development Cell",
    description:
      "Focused on bridging the gap between privilege and need in society, one initiative at a time. Creates change through donation drives, awareness campaigns (education, gender equality), cleanliness drives, and NGO collaborations. Flagship event: Daan Utsav.",
    image: `${E}/sparsh-logo-1.webp`,
  },
  {
    name: "Spirituality, Health & Wellness Club",
    description:
      "Established in 2018, focused on fostering mental and spiritual well-being amidst academic life. Provides guided meditation sessions, stress-management workshops like Zumba and Yoga, and insightful guest sessions with spiritual leaders.",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/WhatsApp_Image_2025-11-26_at_5.55.54_PM-removebg-preview.png",
  },
  {
    name: "The Inquizire Club",
    description:
      "The official Quizzing Club where Knowledge Meets Fun. Hosts various online and offline quizzes (Movie, Music, Food, Travel Quizzes), publishes a Newsletter, and runs a 'Question of the Day' on social media. Enhances analytical and problem-solving skills for placements.",
    image:
      "https://studentcounciliimr.in/wp-content/uploads/2025/11/unnamed.webp",
  },
  {
    name: "Voice ï¿½' Public Speaking Club",
    description:
      "Focused on helping you discover and unleash your voice. Enhances public speaking, fluency, confidence, writing, and design skills through Open Mic Nights, Unstop Events, and the flagship competition 'Voice of the Year.'",
    image: `${E}/voice-logo.webp`,
  },
];
