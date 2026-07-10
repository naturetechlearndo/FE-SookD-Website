export interface FeatureSection {
  id: string;
  heading: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface NavLink {
  label: string;
  href: string;
  page?: string;
}

export interface ExperienceCard {
  id: string;
  image: string;
  imageColor: string;
  discount: number;
  discountNote: string;
  title: string;
  tags: string[];
  duration: string;
  price: number;
  description: string;
}

export interface JourneyCard {
  id: string;       // used as image filename: /img/{id}.jpg
  title: string;
  href: string;
  page?: string;
}

// export interface ImpactStat {
//   id: string;
//   value: string;
//   label: string;
//   description: string;
// }

export interface ImpactStat {
  id: string;
  value: string;
  label: string;
  description: string;
}

export interface SocialImpactContent {
  heading: string;
  subheading: string;
  stats: ImpactStat[];
}

export interface ContactItem {
  icon: string;     // emoji or svg string
  label: string;
  href: string;
}

export interface FooterData {
  brand: {
    name: string;
    tagline: string;
  };
  address: {
    lines: string[];
  };
  contact: {
    items: ContactItem[];
  };
  copyright: string;
}

export interface SiteContent {
  navLinks: NavLink[];
  experiences: {
    hero: { heading: string; subheading: string };
    cards: ExperienceCard[];
  };
  hero: {
    TH: {
      heading: string;
      subheading: string;
    };
    ENG: {
      heading: string;
      subheading: string;
    }
  };
  journey: {
    heading: string;
    cards: JourneyCard[];
  };
  natureQuote: {
    heading: string;
    subtext: string;
  };
  pursuit: {
    TH: {
      heading: string;
      body: string;
      ctaLabel: string;
      ctaHref: string;
    };
    ENG: {
      heading: string;
      body: string;
      ctaLabel: string;
      ctaHref: string;
    };
  };
  luxury: {
    TH: {
      heading: string;
      body: string;
    };
    ENG: {
      heading: string;
      body: string;
    };
  };
  socialImpact: {
    TH: SocialImpactContent;
    ENG: SocialImpactContent;
  };
  footer: {
    TH: FooterData;
    ENG: FooterData;
  };
}
