import type { AiGeneratedWebsite } from '../../../../types/website';
import { Logger } from '../../../../core/logging/Logger';

export class FallbackGenerator {
  generateFallback(
    businessName: string,
    category: string,
    location: string,
    phone: string,
    email: string,
    description: string
  ): AiGeneratedWebsite {
    Logger.warn('Generating fallback website template', { businessName, category });
    
    return {
      industry: category,
      theme: 'modern',
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#3b82f6',
        background: '#ffffff',
        surface: '#f3f4f6',
        text: '#111827',
      },
      fonts: {
        heading: 'Inter',
        body: 'Roboto',
      },
      brand: {
        tagline: `Premier ${category} in ${location || 'your area'}`,
        mission: 'To deliver outstanding value and service to every client.',
        logoStyle: 'Clean and Professional',
        logoPrompt: `A professional logo for a ${category} business named ${businessName}`,
      },
      announcement: {
        text: 'Welcome to our new website!',
        enabled: true,
      },
      navbar: {
        logo: businessName,
        links: [
          { label: 'Home', href: '/' },
          { label: 'Services', href: '#services' },
          { label: 'About', href: '#about' },
          { label: 'Contact', href: '#contact' },
        ],
        cta: { text: 'Get Started', href: '#contact' },
        sticky: true,
        variant: 'default',
      },
      hero: {
        title: `Welcome to ${businessName}`,
        subtitle: `Professional ${category} services tailored for you.`,
        ctaPrimary: 'Get Started',
        ctaSecondary: 'Our Services',
        badge: 'Top Rated',
        layout: 'center',
        backgroundType: 'color',
      },
      about: {
        title: 'About Us',
        content: `At ${businessName}, we are passionate about providing the best ${category} services. With years of experience and a commitment to excellence, we strive to exceed your expectations.`,
        image: '',
        stats: [],
        features: [],
        layout: 'default',
      },
      services: {
        title: 'Our Services',
        description: 'What we offer',
        items: [
          { title: 'Professional Service', description: 'High quality professional service tailored to your needs.', icon: 'star', features: [] },
          { title: 'Expert Consultation', description: 'Expert advice and consultation from our experienced team.', icon: 'users', features: [] },
          { title: 'Custom Solutions', description: 'Customized solutions designed specifically for your business.', icon: 'settings', features: [] },
        ],
        layout: 'grid',
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
        title: 'What Our Clients Say',
        description: 'Read our client reviews',
        items: [
          { name: 'Sarah J.', content: 'Absolutely fantastic service! Highly recommended.', role: 'Happy Client', company: '', rating: 5, avatar: '' },
          { name: 'Mike T.', content: 'They exceeded all our expectations.', role: 'Business Owner', company: '', rating: 5, avatar: '' },
          { name: 'Emily R.', content: 'Professional, reliable, and great to work with.', role: 'Local Customer', company: '', rating: 4, avatar: '' },
        ],
        layout: 'grid',
      },
      faq: {
        title: 'Frequently Asked Questions',
        description: 'Find answers to common questions',
        items: [
          { question: 'What areas do you serve?', answer: `We proudly serve ${location || 'the local area'} and surrounding regions.` },
          { question: 'How can I get started?', answer: 'Simply contact us using the form below or give us a call.' },
          { question: 'What are your business hours?', answer: 'We are open Monday through Friday, 9 AM to 5 PM.' },
        ],
        layout: 'default',
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
        title: 'Contact Us',
        description: 'Get in touch with us today. We look forward to hearing from you!',
        phone: phone || '555-0199',
        email: email || 'hello@example.com',
        address: location || 'City, State',
        mapUrl: '',
        socialLinks: [
          { platform: 'facebook', url: '#', icon: 'facebook' }
        ],
        formFields: [
          { label: 'Name', type: 'text', placeholder: 'Your Name', required: true },
          { label: 'Email', type: 'email', placeholder: 'Your Email', required: true },
          { label: 'Message', type: 'textarea', placeholder: 'Your Message', required: true }
        ],
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
        address: location || 'City, State',
      },
      footer: {
        description: `Your premier ${category} provider.`,
        copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
        columns: [
          { title: 'Links', links: [{ label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms of Service', href: '/terms' }] },
        ],
        socialLinks: [],
        showNewsletter: false,
      },
      seo: {
        metaTitle: `${businessName} | Professional ${category}`,
        metaDescription: `Welcome to ${businessName}. We offer professional ${category} services in ${location || 'your area'}. Contact us today!`,
        keywords: [businessName, category, 'professional services', location].filter(Boolean),
        ogImage: '',
        twitterCard: 'summary_large_image',
      },
      layout: []
    };
  }
}
