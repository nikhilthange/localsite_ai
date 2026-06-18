import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { clsx } from 'clsx';

export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatRelativeDate(date) {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function truncateText(text, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '...';
}

export function generateAvatar(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getStatusColor(status) {
  const statusColors = {
    draft: 'text-gray-500 bg-gray-100',
    generating: 'text-yellow-600 bg-yellow-100',
    generated: 'text-blue-600 bg-blue-100',
    published: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    new: 'text-blue-600 bg-blue-100',
    contacted: 'text-yellow-600 bg-yellow-100',
    qualified: 'text-green-600 bg-green-100',
    converted: 'text-emerald-600 bg-emerald-100',
    lost: 'text-red-600 bg-red-100',
    pending: 'text-yellow-600 bg-yellow-100',
    completed: 'text-green-600 bg-green-100',
    refunded: 'text-gray-600 bg-gray-100',
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    cancelled: 'text-red-600 bg-red-100',
  };

  return statusColors[status] || 'text-gray-600 bg-gray-100';
}

export function classNames(...classes) {
  return clsx(classes);
}

export function validateEmail(email) {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email address';
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return '';
}

export function validatePhone(phone) {
  if (!phone) return 'Phone number is required';
  const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
  if (!phoneRegex.test(phone)) return 'Invalid phone number';
  return '';
}
