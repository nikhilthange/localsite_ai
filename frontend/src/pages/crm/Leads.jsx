import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiSearch, HiFilter, HiMail, HiPhone, HiStar, HiTag, HiChevronDown, HiChevronUp, HiX, HiCheck, HiBan, HiDownload } from 'react-icons/hi';
import { FiUsers, FiPlus, FiMessageSquare, FiUserPlus } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { leadService } from '@/services/leadService';
import { useWebsites } from '@/context/WebsiteContext';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: HiStar },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: HiMail },
  qualified: { label: 'Qualified', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: HiCheck },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: HiCheck },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: HiBan },
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
  return <span className={twMerge('px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>{config.label}</span>;
}

function LeadDetail({ lead, onClose, onStatusChange }) {
  if (!lead) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
            {lead.name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{lead.name}</h3>
            <p className="text-sm text-gray-500">{lead.company || 'No company'}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
          <HiX className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <HiMail className="w-4 h-4 text-gray-400" />
          <a href={`mailto:${lead.email}`} className="text-violet-600 dark:text-violet-400 hover:underline">{lead.email}</a>
        </div>
        {lead.phone && (
          <div className="flex items-center gap-3 text-sm">
            <HiPhone className="w-4 h-4 text-gray-400" />
            <a href={`tel:${lead.phone}`} className="text-gray-700 dark:text-gray-300">{lead.phone}</a>
          </div>
        )}
        {lead.source && (
          <div className="flex items-center gap-3 text-sm">
            <HiTag className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Source: <span className="font-medium text-gray-900 dark:text-white capitalize">{lead.source}</span></span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <HiStar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Score: <span className={twMerge('font-medium px-2 py-0.5 rounded-full text-xs', scoreColors[getScoreLevel(lead.score || 0)])}>{lead.score || 0}</span></span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
        <div className="flex gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <button key={key} onClick={() => onStatusChange(lead._id, key)}
              className={twMerge('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                lead.status === key ? config.color : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-50 dark:bg-gray-800')}>
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">{lead.message || 'No message'}</p>
      </div>

      {lead.notes?.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes ({lead.notes.length})</label>
          <div className="space-y-2">
            {lead.notes.map((note, i) => (
              <div key={i} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p>{note.content}</p>
                {note.addedAt && <p className="text-xs text-gray-400 mt-1">{new Date(note.addedAt).toLocaleString()}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button variant="primary" size="sm" className="rounded-lg" onClick={() => { window.location.href = `mailto:${lead.email}`; }}>
          <HiMail className="w-4 h-4 mr-1" /> Send Email
        </Button>
        <Button variant="outline" size="sm" className="rounded-lg">Add Note</Button>
      </div>
    </motion.div>
  );
}

export default function Leads() {
  const { websites, fetchWebsites } = useWebsites();
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
        setLeads([
          { _id: '1', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1-555-0123', company: 'Tech Corp', source: 'website', status: 'new', score: 85, message: 'Interested in your services!', createdAt: '2026-06-11T10:30:00Z' },
          { _id: '2', name: 'Bob Smith', email: 'bob@example.com', phone: '+1-555-0456', company: 'Design Studio', source: 'referral', status: 'contacted', score: 62, message: 'Would like a quote for redesign', createdAt: '2026-06-10T14:20:00Z' },
          { _id: '3', name: 'Carol White', email: 'carol@example.com', company: 'Local Bakery', source: 'website', status: 'qualified', score: 78, message: 'Need a website for my new bakery', createdAt: '2026-06-09T09:15:00Z' },
          { _id: '4', name: 'David Brown', email: 'david@example.com', phone: '+1-555-0789', company: 'Realty Group', source: 'social', status: 'converted', score: 92, message: 'Looking for a real estate platform', createdAt: '2026-06-08T16:45:00Z' },
          { _id: '5', name: 'Emma Davis', email: 'emma@example.com', company: 'Fitness Hub', source: 'website', status: 'lost', score: 25, message: 'Budget too high', createdAt: '2026-06-07T11:00:00Z' },
          { _id: '6', name: 'Frank Wilson', email: 'frank@example.com', source: 'direct', status: 'new', score: 45, message: 'Quick question about pricing', createdAt: '2026-06-06T08:30:00Z' },
          { _id: '7', name: 'Grace Lee', email: 'grace@example.com', phone: '+1-555-0321', company: 'Health Clinic', source: 'referral', status: 'contacted', score: 71, message: 'Interested in the Professional plan', createdAt: '2026-06-05T13:10:00Z' },
        ]);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM & Leads</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track your leads from all sources</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg">
            <HiDownload className="w-4 h-4 mr-1" /> Export
          </Button>
          <Button variant="primary" size="sm" className="rounded-lg">
            <FiUserPlus className="w-4 h-4 mr-1" /> Add Lead
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 outline-none transition-colors" />
        </div>
        <select value={websiteFilter} onChange={(e) => setWebsiteFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none">
          <option value="">All Websites</option>
          {(websites || []).map((w) => (
            <option key={w._id || w.id} value={w._id || w.id}>{w.name || w.businessName}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {['all', 'new', 'contacted', 'qualified', 'converted', 'lost'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={twMerge('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                statusFilter === s ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')}>
              {s}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="score">Highest Score</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={twMerge('lg:col-span-2', selectedLead ? 'lg:col-span-2' : 'lg:col-span-3')}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="w-10 px-4 py-4">
                      <input type="checkbox" onChange={() => selectedIds.length === leads.length ? setSelectedIds([]) : setSelectedIds(leads.map((l) => l._id))}
                        checked={selectedIds.length === leads.length && leads.length > 0}
                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                    </th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filtered.map((lead, i) => (
                    <motion.tr key={lead._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      onClick={() => setSelectedLead(lead)}
                      className={twMerge('hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer',
                        selectedLead?._id === lead._id && 'bg-violet-50 dark:bg-violet-900/10')}>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.includes(lead._id)} onChange={() => toggleSelect(lead._id)}
                          className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                            {lead.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</p>
                            {lead.company && <p className="text-xs text-gray-500">{lead.company}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <a href={`mailto:${lead.email}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 block truncate max-w-[180px]">{lead.email}</a>
                          {lead.phone && <span className="text-xs text-gray-500 block">{lead.phone}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 capitalize">{lead.source || '—'}</td>
                      <td className="px-4 py-4">
                        <span className={twMerge('px-2 py-0.5 rounded-full text-xs font-medium', scoreColors[getScoreLevel(lead.score || 0)])}>
                          {lead.score || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <select value={lead.status} onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className="text-xs bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer">
                          {Object.keys(STATUS_CONFIG).map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12">
                <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No leads found</p>
              </div>
            )}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500">{filtered.length} lead{filtered.length !== 1 ? 's' : ''}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">Previous</button>
                <button onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Next</button>
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
