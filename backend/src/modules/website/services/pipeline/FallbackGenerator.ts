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
      brand: {
        description: description || `Welcome to ${businessName}, the premier ${category} provider in ${location || 'your area'}.`,
        colors: {
          primary: '#2563eb',
          secondary: '#ffffff',
          accent: '#1e40af',
        },
        typography: {
          headingFont: 'Inter',
          bodyFont: 'Roboto',
        },
        logoText: businessName,
        designStyle: 'Clean and Professional',
      },
      navigation: {
        links: [
          { label: 'Home', url: '/' },
          { label: 'Services', url: '#services' },
          { label: 'About', url: '#about' },
          { label: 'Contact', url: '#contact' },
        ],
      },
      hero: {
        headline: `Welcome to ${businessName}`,
        subheadline: `Professional ${category} services tailored for you.`,
        primaryButton: { text: 'Get Started', url: '#contact' },
        secondaryButton: { text: 'Our Services', url: '#services' },
        imageDescription: `A high-quality image representing ${category}`,
        imageUrl: '',
      },
      services: {
        title: 'Our Services',
        subtitle: 'What we offer',
        items: [
          { name: 'Professional Service', description: 'High quality professional service tailored to your needs.', icon: 'star' },
          { name: 'Expert Consultation', description: 'Expert advice and consultation from our experienced team.', icon: 'users' },
          { name: 'Custom Solutions', description: 'Customized solutions designed specifically for your business.', icon: 'settings' },
        ],
      },
      about: {
        title: 'About Us',
        content: `At ${businessName}, we are passionate about providing the best ${category} services. With years of experience and a commitment to excellence, we strive to exceed your expectations.`,
        mission: 'To deliver outstanding value and service to every client.',
        imageDescription: 'Our professional team',
        imageUrl: '',
      },
      testimonials: {
        title: 'What Our Clients Say',
        items: [
          { quote: 'Absolutely fantastic service! Highly recommended.', author: 'Sarah J.', role: 'Happy Client' },
          { quote: 'They exceeded all our expectations.', author: 'Mike T.', role: 'Business Owner' },
          { quote: 'Professional, reliable, and great to work with.', author: 'Emily R.', role: 'Local Customer' },
        ],
      },
      faq: {
        title: 'Frequently Asked Questions',
        questions: [
          { question: 'What areas do you serve?', answer: `We proudly serve ${location || 'the local area'} and surrounding regions.` },
          { question: 'How can I get started?', answer: 'Simply contact us using the form below or give us a call.' },
          { question: 'What are your business hours?', answer: 'We are open Monday through Friday, 9 AM to 5 PM.' },
          { question: 'Do you offer consultations?', answer: 'Yes, we offer initial consultations to understand your needs.' },
        ],
      },
      contact: {
        title: 'Contact Us',
        description: 'Get in touch with us today. We look forward to hearing from you!',
        email: email || 'hello@example.com',
        phone: phone || '555-0199',
        address: location || 'City, State',
        socialLinks: { facebook: '#', twitter: '#', instagram: '#' },
      },
      seo: {
        title: `${businessName} | Professional ${category}`,
        description: `Welcome to ${businessName}. We offer professional ${category} services in ${location || 'your area'}. Contact us today!`,
        keywords: [businessName, category, 'professional services', location].filter(Boolean),
      },
      footer: {
        copyright: `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`,
        links: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Service', url: '/terms' },
        ],
      },
    };
  }
}
