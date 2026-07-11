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

    return {
      brand: {
        description: brand.brand?.description || 'A great business.',
        colors: {
          primary: brand.brand?.colors?.primary || '#000000',
          secondary: brand.brand?.colors?.secondary || '#ffffff',
          accent: brand.brand?.colors?.accent || '#cccccc',
        },
        typography: {
          headingFont: brand.brand?.typography?.headingFont || 'Inter',
          bodyFont: brand.brand?.typography?.bodyFont || 'Roboto',
        },
        logoText: brand.brand?.logoText || 'Logo',
        designStyle: brand.brand?.designStyle || 'Modern Minimalist',
      },
      navigation: {
        links: navHero.navigation?.links || [
          { label: 'Home', url: '/' },
          { label: 'Services', url: '#services' },
          { label: 'Contact', url: '#contact' },
        ],
      },
      hero: {
        headline: navHero.hero?.headline || 'Welcome to our website',
        subheadline: navHero.hero?.subheadline || 'We provide excellent services.',
        primaryButton: navHero.hero?.primaryButton || { text: 'Get Started', url: '#contact' },
        secondaryButton: navHero.hero?.secondaryButton || { text: 'Learn More', url: '#about' },
        imageDescription: navHero.hero?.imageDescription || 'A professional hero image',
        imageUrl: '',
      },
      services: {
        title: services.services?.title || 'Our Services',
        subtitle: services.services?.subtitle || 'What we offer',
        items: services.services?.items || [
          { name: 'Service 1', description: 'Description 1', icon: 'star' }
        ],
      },
      about: {
        title: about.about?.title || 'About Us',
        content: about.about?.content || 'We are a dedicated team of professionals.',
        mission: about.about?.mission || 'To deliver excellence.',
        imageDescription: about.about?.imageDescription || 'Team working together',
        imageUrl: '',
      },
      testimonials: {
        title: testimonials.testimonials?.title || 'What Our Clients Say',
        items: testimonials.testimonials?.items || [
          { quote: 'Great service!', author: 'John Doe', role: 'Customer' }
        ],
      },
      faq: {
        title: faq.faq?.title || 'Frequently Asked Questions',
        questions: faq.faq?.questions || [
          { question: 'How can I get started?', answer: 'Contact us today.' }
        ],
      },
      contact: {
        title: contact.contact?.title || 'Contact Us',
        description: contact.contact?.description || 'Reach out to us for any queries.',
        email: contact.contact?.email || 'hello@example.com',
        phone: contact.contact?.phone || '123-456-7890',
        address: contact.contact?.address || 'City, State',
        socialLinks: contact.contact?.socialLinks || { facebook: '', twitter: '', instagram: '' },
      },
      seo: {
        title: seo.seo?.title || 'Business Website',
        description: seo.seo?.description || 'Welcome to our business website.',
        keywords: seo.seo?.keywords || ['business', 'services'],
      },
      footer: {
        copyright: footer.footer?.copyright || '© 2024 All rights reserved.',
        links: footer.footer?.links || [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Service', url: '/terms' },
        ],
      },
    };
  }
}
