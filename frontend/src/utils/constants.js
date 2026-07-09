export const BUSINESS_CATEGORIES = [
  { value: 'restaurant', label: 'Restaurant & Cafe' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'healthcare', label: 'Healthcare & Wellness' },
  { value: 'education', label: 'Education & Tutoring' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'fitness', label: 'Fitness & Gym' },
  { value: 'beauty', label: 'Beauty & Salon' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'travel', label: 'Travel & Hospitality' },
  { value: 'photography', label: 'Photography' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'nonprofit', label: 'Nonprofit & Charity' },
  { value: 'technology', label: 'Technology & IT' },
  { value: 'construction', label: 'Construction & Trades' },
  { value: 'entertainment', label: 'Entertainment & Events' },
  { value: 'legal', label: 'Legal Services' },
  { value: 'other', label: 'Other' },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '1 website',
      'Basic templates',
      'Custom domain',
      '5GB storage',
      'Community support',
    ],
    limitations: {
      websites: 1,
      storage: 5,
      teamMembers: 0,
      customDomain: true,
      analytics: false,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    currency: 'USD',
    interval: 'month',
    features: [
      '5 websites',
      'All templates',
      'Custom domain',
      '50GB storage',
      'Basic analytics',
      'Email support',
    ],
    limitations: {
      websites: 5,
      storage: 50,
      teamMembers: 2,
      customDomain: true,
      analytics: true,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited websites',
      'All templates + premium',
      'Custom domain + SSL',
      '250GB storage',
      'Advanced analytics',
      'Priority support',
      'Team members (5)',
    ],
    limitations: {
      websites: -1,
      storage: 250,
      teamMembers: 5,
      customDomain: true,
      analytics: true,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited everything',
      'White-label option',
      'Dedicated server',
      '1TB storage',
      'Custom analytics',
      '24/7 phone support',
      'Unlimited team members',
      'API access',
    ],
    limitations: {
      websites: -1,
      storage: 1000,
      teamMembers: -1,
      customDomain: true,
      analytics: true,
    },
  },
];

export const WEBSITE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'generating', label: 'Generating', color: 'yellow' },
  { value: 'generated', label: 'Generated', color: 'blue' },
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
];

export const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'qualified', label: 'Qualified', color: 'green' },
  { value: 'converted', label: 'Converted', color: 'emerald' },
  { value: 'lost', label: 'Lost', color: 'red' },
];

export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_EMAIL_TOKEN: '/verify-email/:token',
  PRICING: '/pricing',
  CONTACT: '/contact',
  DASHBOARD: '/dashboard',
  WEBSITES: '/websites',
  WEBSITES_GENERATE: '/websites/generate',
  WEBSITES_DETAIL: '/websites/:id',
  WEBSITES_EDIT: '/websites/:id/edit',
  SETTINGS: '/settings',
  ANALYTICS: '/analytics',
  LEADS: '/leads',
  BILLING: '/billing',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  GROWTH: '/growth',
};

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const FEATURES = [
  {
    id: 'ai-generator',
    name: 'AI Website Generator',
    description: 'Generate complete websites using AI',
    icon: 'Sparkles',
  },
  {
    id: 'custom-domain',
    name: 'Custom Domain',
    description: 'Connect your own domain name',
    icon: 'Globe',
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Track visitors and engagement',
    icon: 'BarChart',
  },
  {
    id: 'seo-tools',
    name: 'SEO Tools',
    description: 'Optimize for search engines',
    icon: 'Search',
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description: 'Built-in contact forms and lead management',
    icon: 'Users',
  },
  {
    id: 'responsive',
    name: 'Responsive Design',
    description: 'Looks great on all devices',
    icon: 'Smartphone',
  },
  {
    id: 'custom-templates',
    name: 'Custom Templates',
    description: 'Professionally designed templates',
    icon: 'Layout',
  },
  {
    id: 'payment-integration',
    name: 'Payment Integration',
    description: 'Accept payments online',
    icon: 'CreditCard',
  },
];
