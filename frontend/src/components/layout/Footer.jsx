import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiLayout, FiMail, FiGithub, FiTwitter, FiLinkedin, FiSend, FiCheck } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Templates', href: '/templates' },
    { label: 'Integrations', href: '/integrations' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'API Reference', href: '/api' },
    { label: 'Status', href: '/status' },
    { label: 'Privacy', href: '/privacy' },
  ],
};

const socialLinks = [
  { icon: FiGithub, href: '#', label: 'GitHub' },
  { icon: FiTwitter, href: '#', label: 'Twitter' },
  { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FiMail, href: 'mailto:hello@localsite.ai', label: 'Email' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-[rgb(var(--color-surface))] border-t border-[rgb(var(--color-border))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-16">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center group-hover:shadow-md transition-shadow">
                <FiLayout className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-[rgb(var(--color-text))]">
                LocalSite<span className="text-primary-500">AI</span>
              </span>
            </Link>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mb-6 max-w-sm leading-relaxed">
              Build beautiful, AI-powered websites in minutes. No coding required. Professional templates, custom domains, and powerful SEO tools.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 border border-[rgb(var(--color-border))] flex items-center justify-center text-[rgb(var(--color-text-muted))] hover:text-primary-500 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold text-[rgb(var(--color-text))] uppercase tracking-widest mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text))] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-[rgb(var(--color-border))] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[rgb(var(--color-text-muted))]">
            &copy; {new Date().getFullYear()} LocalSite AI. All rights reserved.
          </p>
          <form onSubmit={handleSubscribe} className="flex items-center gap-2">
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-muted))]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Subscribe to updates"
                className="pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-surface-800 border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text))] placeholder:text-[rgb(var(--color-text-muted))] focus:outline-none focus:ring-2 focus:ring-primary-500/30 w-56"
                required
                aria-label="Email for newsletter"
              />
            </div>
            <button
              type="submit"
              className={twMerge(
                'p-2.5 rounded-xl transition-all duration-200',
                subscribed
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              )}
              aria-label={subscribed ? 'Subscribed' : 'Subscribe'}
            >
              {subscribed ? <FiCheck className="w-4 h-4" /> : <FiSend className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
