import { HiX } from 'react-icons/hi';
import { useState } from 'react';

export default function AnnouncementBar({ content = {}, branding = {} }) {
  const [dismissed, setDismissed] = useState(false);
  if (!content.text || dismissed) return null;

  return (
    <div
      className="relative px-4 py-2.5 text-center text-sm font-medium"
      style={{ backgroundColor: branding.colors?.primary || '#6366F1', color: '#FFFFFF' }}
    >
      <span>{content.text}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:opacity-80"
        aria-label="Dismiss"
      >
        <HiX className="w-4 h-4" />
      </button>
    </div>
  );
}
