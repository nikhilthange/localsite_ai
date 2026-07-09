import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiSearch, HiFilter, HiMail, HiPhone, HiStar, HiTag, HiChevronDown, HiChevronUp, HiX, HiCheck, HiBan, HiDownload } from 'react-icons/hi';
import { FiUsers, FiPlus, FiMessageSquare, FiUserPlus } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { leadService } from '@/services/leadService';
import { useWebsites } from '@/hooks/useWebsite';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  new: { label: 'New', color: 'badge-primary', icon: HiStar },
  contacted: { label: 'Contacted', color: 'badge-warning', icon: HiMail },
  qualified: { label: 'Qualified', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: HiCheck },
  converted: { label: 'Converted', color: 'badge-success', icon: HiCheck },
  lost: { label: 'Lost', color: 'badge-error', icon: HiBan },
};

const scoreColors = {
  high: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  low: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
};

function getScoreLevel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return <span className={config.color}>{config.label}</span>;
}

function LeadDetail({ lead, onClose, onStatusChange }) {
  if (!lead) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
            {lead.name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--color-text))]">{lead.name}</h3>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">{lead.company || 'No company'}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface))]">
          <HiX className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <HiMail className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />
          <a href={`mailto:${lead.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">{lead.email}</a>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-3 text-sm">
            <HiPhone className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />
            <a href={`tel:${lead.phone}`} className="text-[rgb(var(--color-text-secondary))]">{lead.phone}</a>
          </div>
        )}
        {lead.source && (
          <div className="flex items-center gap-3 text-sm">
            <HiTag className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />
            <span className="text-[rgb(var(--color-text-secondary))]">Source: <span className="font-medium text-[rgb(var(--color-text))] capitalize">{lead.source}</span></span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <HiStar className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />
          <span className="text-sm text-[rgb(var(--color-text-secondary))]">Score: <span className={twMerge('font-medium px-2 py-0.5 rounded-full text-xs', scoreColors[getScoreLevel(lead.score || 0)])}>{lead.score || 0}</span></span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Status</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button key={key} onClick={() => onStatusChange(lead._id, key)}
              className={twMerge('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                lead.status === key ? config.color : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface))]')}>
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Message</label>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface))] rounded-xl p-4">{lead.message || 'No message'}</p>
      </div>

      {lead.notes?.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">Notes ({lead.notes.length})</label>
          <div className="space-y-2">
            {lead.notes.map((note, i) => (
              <div key={i} className="text-sm text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-surface))] rounded-xl p-3">
                <p>{note.content}</p>
                {note.addedAt && <p className="text-xs text-[rgb(var(--color-text-muted))] mt-1">{new Date(note.addedAt).toLocaleString()}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-6 pt-4 border-t border-[rgb(var(--color-border))]">
        <Button variant="primary" size="sm" onClick={() => { window.location.href = `mailto:${lead.email}`; }}>
          <HiMail className="w-4 h-4 mr-1" /> Send Email
        </Button>
        <Button variant="outline" size="sm">Add Note</Button>
      </div>
    </motion.div>
  );
}

export default function Leads() {
  const { websites, fetchWebsites } = useWebsites();
  const websiteList = Array.isArray(websites) ? websites : [];
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedLead, setSelectedLead] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const { data } = await leadService.getLeads({
          page, limit: 20, search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          websiteId: websiteFilter || undefined,
          sort: sortBy,
        });
        setLeads(data.leads || data.data || []);
      } catch {
        toast.error('Failed to load leads');
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [page, search, statusFilter, websiteFilter, sortBy]);

  const handleStatusChange = async (id, status) => {
    try {
      await leadService.updateLeadStatus(id, status);
      setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
      if (selectedLead?._id === id) setSelectedLead((prev) => ({ ...prev, status }));
      toast.success(`Lead marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = leads.filter((l) => {
    const nameMatch = l.name?.toLowerCase().includes(search.toLowerCase());
    const emailMatch = l.email?.toLowerCase().includes(search.toLowerCase());
    return nameMatch || emailMatch;
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <FiUsers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">CRM & Leads</h1>
            <p className="text-sm text-[rgb(var(--color-text-muted))]">Manage and track your leads from all sources</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <HiDownload className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button variant="primary" size="sm">
            <FiUserPlus className="w-4 h-4 mr-1" /> Add Lead
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 p-4 card">
        <div className="relative flex-1 w-full">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-muted))]" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..."
            className="input-field pl-10" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all', 'new', 'contacted', 'qualified', 'converted', 'lost'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={twMerge('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                statusFilter === s ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))]')}>
              {s}
            </button>
          ))}
        </div>
        <select value={websiteFilter} onChange={(e) => setWebsiteFilter(e.target.value)}
          className="input-field w-auto min-w-[140px]">
          <option value="">All Websites</option>
          {websiteList.map((w) => (
            <option key={w._id || w.id} value={w._id || w.id}>{w.name || w.businessName}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="input-field w-auto min-w-[140px]">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="score">Highest Score</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={twMerge(selectedLead ? 'lg:col-span-2' : 'lg:col-span-3')}>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                    <th className="w-10 px-4 py-4">
                      <input type="checkbox" onChange={() => selectedIds.length === leads.length ? setSelectedIds([]) : setSelectedIds(leads.map((l) => l._id))}
                        checked={selectedIds.length === leads.length && leads.length > 0}
                        className="w-4 h-4 rounded border-[rgb(var(--color-border))] text-primary-600 focus:ring-primary-500" />
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Name</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Contact</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Source</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Score</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Status</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgb(var(--color-border))]">
                  {filtered.map((lead, i) => (
                    <motion.tr key={lead._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      onClick={() => setSelectedLead(lead)}
                      className={twMerge('hover:bg-[rgb(var(--color-surface))] transition-colors cursor-pointer',
                        selectedLead?._id === lead._id && 'bg-primary-50 dark:bg-primary-900/10')}>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.includes(lead._id)} onChange={() => toggleSelect(lead._id)}
                          className="w-4 h-4 rounded border-[rgb(var(--color-border))] text-primary-600 focus:ring-primary-500" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                            {lead.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[rgb(var(--color-text))]">{lead.name}</p>
                            {lead.company && <p className="text-xs text-[rgb(var(--color-text-muted))]">{lead.company}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <a href={`mailto:${lead.email}`} className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-primary-600 dark:hover:text-primary-400 block truncate max-w-[180px]">{lead.email}</a>
                          {lead.phone && <span className="text-xs text-[rgb(var(--color-text-muted))] block">{lead.phone}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[rgb(var(--color-text-muted))] capitalize">{lead.source || '\u2014'}</td>
                      <td className="px-4 py-4">
                        <span className={twMerge('px-2 py-0.5 rounded-full text-xs font-medium', scoreColors[getScoreLevel(lead.score || 0)])}>
                          {lead.score || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <select value={lead.status} onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className="text-xs bg-transparent border border-[rgb(var(--color-border))] rounded-lg px-2 py-1 text-[rgb(var(--color-text-secondary))] focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer">
                          {Object.keys(STATUS_CONFIG).map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-sm text-[rgb(var(--color-text-muted))] whitespace-nowrap">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '\u2014'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12">
                <FiUsers className="w-12 h-12 text-[rgb(var(--color-text-muted))] mx-auto mb-4" />
                <p className="text-[rgb(var(--color-text-muted))]">No leads found</p>
              </div>
            )}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[rgb(var(--color-border))]">
              <p className="text-sm text-[rgb(var(--color-text-muted))]">{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-outline btn-sm">Previous</button>
                <button onClick={() => setPage((p) => p + 1)}
                  className="btn-outline btn-sm">Next</button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedLead && (
            <div className="lg:col-span-1">
              <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} onStatusChange={handleStatusChange} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
