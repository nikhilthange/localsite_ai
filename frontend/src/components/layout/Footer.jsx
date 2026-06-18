import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiLayout, FiMail, FiGithub, FiTwitter, FiLinkedin, FiSend } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

const productLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Templates', href: '/templates' },
  { label: 'Integrations', href: '/integrations' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/#contact' },
];

const resourceLinks = [
  { label: 'Documentation', href: '/docs' },
  { label: 'API Reference', href: '/api' },
  { label: 'Status', href: '/status' },
  { label: 'Privacy', href: '/privacy' },
];

const socialLinks = [
  { icon: FiGithub, href: '#', label: 'GitHub' },
  { icon: FiTwitter, href: '#', label: 'Twitter' },
  { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FiMail, href: 'mailto:hello@sitecraft.dev', label: 'Email' },
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
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FiLayout className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">SiteCraft</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              Build beautiful, professional websites in minutes. No coding required. AI-powered design that adapts to your brand.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-700 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              &copy; {new Date().getFullYear()} SiteCraft. All rights reserved.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-center space-x-2">
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Subscribe to updates"
                  className="pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-64"
                  required
                />
              </div>
              <button
                type="submit"
                className={twMerge(
                  'p-2 rounded-lg transition-all',
                  subscribed
                    ? 'bg-green-500 text-white'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                )}
              >
                {subscribed ? (
                  <span className="text-xs font-medium px-1">Done!</span>
                ) : (
                  <FiSend className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
