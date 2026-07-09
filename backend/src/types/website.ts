import { Document, Types } from 'mongoose';

export type WebsiteStatus = 'draft' | 'published' | 'archived';

export interface IWebsite extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  organizationId?: Types.ObjectId;
  businessName: string;
  category: string;
  subCategory?: string;
  location: string;
  description?: string;
  phone: string;
  email: string;
  domain?: string;
  subdomain: string;
  status: WebsiteStatus;
  template: string;
  sections: WebsiteSection[];
  branding: BrandIdentity;
  analytics: WebsiteAnalytics;
  seo: SeoConfig;
  deploymentId?: Types.ObjectId;
  chatbotId?: Types.ObjectId;
  publishedAt?: Date;
  lastGeneratedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

export interface WebsiteSection {
  id: string;
  type: SectionType;
  variant: string;
  visible: boolean;
  order: number;
  data: Record<string, any>;
  background?: SectionBackground;
  padding?: string;
  animation?: string;
}

export type SectionType =
  | 'announcement'
  | 'navbar'
  | 'hero'
  | 'about'
  | 'services'
  | 'features'
  | 'stats'
  | 'portfolio'
  | 'pricing'
  | 'gallery'
  | 'testimonials'
  | 'faq'
  | 'process'
  | 'team'
  | 'cta'
  | 'contact'
  | 'newsletter'
  | 'map'
  | 'footer';

export interface SectionBackground {
  type: 'color' | 'gradient' | 'image' | 'video' | 'none';
  value?: string;
  overlay?: string;
  parallax?: boolean;
}

export interface BrandIdentity {
  logo?: string;
  logoPrompt?: string;
  favicon?: string;
  colors: ColorPalette;
  fonts: FontPair;
  spacing: SpacingConfig;
  borderRadius: string;
  shadows: ShadowConfig;
  animations: AnimationConfig;
  logoStyle: string;
  brandVoice: string;
  tagline: string;
  mission: string;
}

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  accentLight: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textInverse: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  darkMode: {
    background: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface FontPair {
  heading: string;
  body: string;
  headingWeight?: number;
  bodyWeight?: number;
  headingUrl?: string;
  bodyUrl?: string;
}

export interface SpacingConfig {
  sectionPadding: string;
  sectionMargin: string;
  elementGap: string;
  containerWidth: string;
}

export interface ShadowConfig {
  small: string;
  medium: string;
  large: string;
  focus: string;
}

export interface AnimationConfig {
  section: string;
  card: string;
  hover: string;
  hero: string;
  duration: number;
}

export interface WebsiteAnalytics {
  pageViews: number;
  uniqueVisitors: number;
  leads: number;
  avgSessionDuration: number;
}

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
  keywords: string[];
  sitemapIncluded: boolean;
  robotsTxt?: string;
  twitterCard?: string;
  twitterSite?: string;
}

export interface IndustryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: SectionType[];
  suggestedTheme: string;
  imageKeywords: string[];
  colorStrategy: string;
  colorPalette?: { primary: string; secondary: string; accent: string };
  voice: string;
  mission: string;
  hasMenu: boolean;
  hasGallery: boolean;
  hasTeam: boolean;
  hasPricing: boolean;
  hasPortfolio: boolean;
  hasProcess: boolean;
  templateLayout: string[];
  layout?: Record<string, string>;
}

export interface AiGeneratedWebsite {
  industry: string;
  theme: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceAlt?: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  brand: {
    tagline: string;
    mission: string;
    logoStyle: string;
    logoPrompt: string;
  };
  announcement: {
    text: string;
    enabled: boolean;
  };
  navbar: {
    logo: string;
    links: Array<{ label: string; href: string }>;
    cta: { text: string; href: string } | null;
    sticky: boolean;
    variant: string;
  };
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    badge: string;
    layout: string;
    backgroundType: string;
  };
  about: {
    title: string;
    content: string;
    image: string;
    stats: Array<{ value: string; label: string }>;
    features: string[];
    layout: string;
  };
  services: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
      features: string[];
      price?: string;
      period?: string;
      featured?: boolean;
      cta?: string;
    }>;
    layout: string;
  };
  features: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    columns: number;
  };
  stats: Array<{
    value: string;
    label: string;
    icon: string;
  }>;
  portfolio: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      category: string;
      image: string;
      link?: string;
    }>;
    layout: string;
  };
  pricing: {
    title: string;
    description: string;
    items: Array<{
      title: string;
      price: string;
      period: string;
      description: string;
      features: string[];
      cta: string;
      featured: boolean;
      icon: string;
    }>;
  };
  gallery: {
    title: string;
    description: string;
    images: Array<{ src: string; alt: string; caption?: string }>;
    layout: string;
  };
  testimonials: {
    title: string;
    description: string;
    items: Array<{
      name: string;
      role: string;
      company: string;
      content: string;
      rating: number;
      avatar: string;
    }>;
    layout: string;
  };
  faq: {
    title: string;
    description: string;
    items: Array<{ question: string; answer: string }>;
    layout: string;
  };
  process: {
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  team: {
    title: string;
    description: string;
    members: Array<{
      name: string;
      role: string;
      bio: string;
      avatar: string;
    }>;
  };
  cta: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    backgroundType: string;
  };
  contact: {
    title: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    mapUrl: string;
    socialLinks: Array<{ platform: string; url: string; icon: string }>;
    formFields: Array<{
      label: string;
      type: string;
      placeholder: string;
      required: boolean;
    }>;
  };
  newsletter: {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    enabled: boolean;
  };
  map: {
    title: string;
    address: string;
    lat?: number;
    lng?: number;
    zoom?: number;
  };
  footer: {
    description: string;
    copyright: string;
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    socialLinks: Array<{ platform: string; url: string; icon: string }>;
    showNewsletter: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage: string;
    twitterCard: string;
  };
  layout: Array<{ type: string; variant: string }>;
}

export interface ImageMap {
  [industry: string]: {
    hero: string[];
    about: string[];
    services: string[];
    gallery: string[];
    team: string[];
    portfolio: string[];
    cta: string[];
  };
}

export interface GenerateWebsiteInput {
  businessName: string;
  category: string;
  location: string;
  description?: string;
  phone: string;
  email: string;
  theme?: string;
}

export interface GenerateResponse {
  website: IWebsite;
  generationId: string;
}

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  fonts: { heading: string; body: string };
  borderRadius: string;
  shadow: string;
  animation: string;
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundImage: string;
}

export interface NavbarContent {
  links: Array<{ label: string; href: string }>;
  cta: { text: string; href: string } | null;
}

export interface AboutContent {
  title: string;
  content: string;
  image: string;
  stats: Array<{ value: string; label: string }>;
}

export interface ServiceItem {
  title: string;
  description: string;
  icon: string;
  image: string;
  price?: string;
  features?: string[];
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface TestimonialItem {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContactContent {
  phone: string;
  email: string;
  address: string;
  mapUrl: string;
  socialLinks: Array<{ platform: string; url: string; icon: string }>;
}

export interface FooterContent {
  description: string;
  copyright: string;
  links: Array<{ label: string; href: string }>;
}

export interface HoursContent {
  [day: string]: { open: string; close: string } | null;
}

export interface SeoContent {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface GeneratedContent {
  businessName: string;
  tagline: string;
  mission: string;
  description: string;
  hero: HeroContent;
  navbar: NavbarContent;
  about: AboutContent;
  services: ServiceItem[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  faq: FaqItem[];
  contact: ContactContent;
  footer: FooterContent;
  hours: HoursContent;
  seo: SeoContent;
}

export interface ITemplate extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: string;
  subCategory?: string;
  industries: string[];
  thumbnail: string;
  previewUrl: string;
  screenshots: string[];
  demoUrl?: string;
  isPremium: boolean;
  price?: number;
  discountPrice?: number;
  features: string[];
  sections: string[];
  colorSchemes: Array<{ name: string; primary: string; secondary: string; accent: string }>;
  fonts: string[];
  structure: Record<string, any>;
  popularity: number;
  usageCount: number;
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}
