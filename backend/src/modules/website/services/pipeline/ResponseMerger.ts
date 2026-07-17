import type { AiGeneratedWebsite } from '../../../../types/website';

export class ResponseMerger {
  mergeResponses(responses: Record<string, any>): AiGeneratedWebsite {
    const brand = responses['brand'] || {};
    const navHero = responses['nav_hero'] || {};
    const services = responses['services'] || {};
    const about = responses['about'] || {};
    const testimonials = responses['testimonials'] || {};
    const faq = responses['faq'] || {};
    const contact = responses['contact'] || {};
    const seo = responses['seo'] || {};
    const footer = responses['footer'] || {};

    const brandData = brand.brand || {};
    const navData = navHero.navigation || {};

    return {
      industry: brandData.industry || 'Business',
      theme: brandData.theme || 'modern',
      colors: {
        primary: brandData.colors?.primary || '#2563eb',
        secondary: brandData.colors?.secondary || '#1e40af',
        accent: brandData.colors?.accent || '#3b82f6',
        background: brandData.colors?.background || '#ffffff',
        surface: brandData.colors?.surface || '#f3f4f6',
        text: brandData.colors?.text || '#111827',
      },
      fonts: {
        heading: brandData.typography?.headingFont || 'Inter',
        body: brandData.typography?.bodyFont || 'Roboto',
      },
      brand: {
        tagline: brand.brand?.tagline || 'Your Premier Choice',
        mission: brand.brand?.mission || 'Delivering excellence.',
        logoStyle: brand.brand?.logoStyle || 'Clean and Professional',
        logoPrompt: brand.brand?.logoPrompt || 'A professional logo',
      },
      announcement: {
        text: 'Welcome to our new website!',
        enabled: true,
      },
      navbar: {
        logo: brandData.name || 'Logo',
        links: navData.links || [
          { label: 'Home', href: '/' },
          { label: 'Services', href: '#services' },
          { label: 'About', href: '#about' },
          { label: 'Contact', href: '#contact' },
        ],
        cta: navData.cta || { text: 'Get Started', href: '#contact' },
        sticky: true,
        variant: 'default',
      },
      hero: {
        title: navHero.hero?.title || 'Welcome to our website',
        subtitle: navHero.hero?.subtitle || 'Professional services tailored for you.',
        ctaPrimary: navHero.hero?.ctaPrimary || 'Get Started',
        ctaSecondary: navHero.hero?.ctaSecondary || 'Our Services',
        badge: navHero.hero?.badge || 'Top Rated',
        layout: navHero.hero?.layout || 'center',
        backgroundType: navHero.hero?.backgroundType || 'color',
      },
      about: {
        title: about.about?.title || 'About Us',
        content: about.about?.content || 'We are a dedicated team of professionals.',
        image: about.about?.image || '',
        stats: about.about?.stats || [],
        features: about.about?.features || [],
        layout: about.about?.layout || 'default',
      },
      services: {
        title: services.services?.title || 'Our Services',
        description: services.services?.description || 'What we offer',
        items: services.services?.items || [],
        layout: services.services?.layout || 'grid',
      },
      features: {
        title: 'Why Choose Us',
        description: 'Our core features',
        items: [],
        columns: 3,
      },
      stats: [],
      portfolio: {
        title: 'Our Work',
        description: 'Recent projects',
        items: [],
        layout: 'grid',
      },
      pricing: {
        title: 'Pricing',
        description: 'Simple and transparent pricing',
        items: [],
      },
      gallery: {
        title: 'Gallery',
        description: 'See our work in action',
        images: [],
        layout: 'grid',
      },
      testimonials: {
        title: testimonials.testimonials?.title || 'What Our Clients Say',
        description: testimonials.testimonials?.description || 'Read our client reviews',
        items: testimonials.testimonials?.items || [],
        layout: testimonials.testimonials?.layout || 'grid',
      },
      faq: {
        title: faq.faq?.title || 'Frequently Asked Questions',
        description: faq.faq?.description || 'Find answers to common questions',
        items: faq.faq?.items || [],
        layout: faq.faq?.layout || 'default',
      },
      process: {
        title: 'Our Process',
        description: 'How we work',
        steps: [],
      },
      team: {
        title: 'Our Team',
        description: 'Meet our experts',
        members: [],
      },
      cta: {
        title: 'Ready to get started?',
        subtitle: 'Contact us today.',
        buttonText: 'Contact Us',
        buttonLink: '#contact',
        backgroundType: 'color',
      },
      contact: {
        title: contact.contact?.title || 'Contact Us',
        description: contact.contact?.description || 'Get in touch with us today.',
        phone: contact.contact?.phone || '123-456-7890',
        email: contact.contact?.email || 'hello@example.com',
        address: contact.contact?.address || 'City, State',
        mapUrl: contact.contact?.mapUrl || '',
        socialLinks: contact.contact?.socialLinks || [],
        formFields: contact.contact?.formFields || [],
      },
      newsletter: {
        title: 'Subscribe',
        description: 'Get our latest news',
        placeholder: 'Enter your email',
        buttonText: 'Subscribe',
        enabled: false,
      },
      map: {
        title: 'Find Us',
        address: contact.contact?.address || 'City, State',
      },
      footer: {
        description: footer.footer?.description || 'Your premier provider.',
        copyright: footer.footer?.copyright || '© 2024 All rights reserved.',
        columns: footer.footer?.columns || [],
        socialLinks: footer.footer?.socialLinks || [],
        showNewsletter: false,
      },
      seo: {
        metaTitle: seo.seo?.metaTitle || 'Business Website',
        metaDescription: seo.seo?.metaDescription || 'Welcome to our business website.',
        keywords: seo.seo?.keywords || ['business', 'services'],
        ogImage: seo.seo?.ogImage || '',
        twitterCard: seo.seo?.twitterCard || 'summary_large_image',
      },
      layout: [],
    };
  }
}
