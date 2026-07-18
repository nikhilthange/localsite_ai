import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { HiSearch, HiMail, HiPhone, HiStar, HiTag, HiX, HiCheck, HiBan, HiDownload, HiViewList, HiViewBoards } from 'react-icons/hi';
import { FiUsers, FiUserPlus, FiMoreVertical } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { leadService } from '@/services/leadService';
import { useWebsites } from '@/hooks/useWebsite';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: HiStar },
  contacted: { label: 'Contacted', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: HiMail },
  qualified: { label: 'Qualified', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: HiCheck },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: HiCheck },
  lost: { label: 'Lost', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: HiBan },
};

const scoreColors = {
  high: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  medium: 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  low: 'text-surface-600 bg-surface-100 dark:bg-surface-800 dark:text-surface-300',
};

function getScoreLevel(score) {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return <span className={cn('px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider', config.color)}>{config.label}</span>;
}

function LeadDetail({ lead, onClose, onStatusChange }) {
  if (!lead) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
       <Card className="p-6 sticky top-6">
         <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md">
               {lead.name?.charAt(0) || '?'}
             </div>
             <div>
               <h3 className="text-xl font-display font-bold text-surface-900 dark:text-white">{lead.name}</h3>
               <p className="text-sm text-surface-500 font-medium">{lead.company || 'No company'}</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 transition-colors">
             <HiX className="w-5 h-5" />
           </button>
         </div>

         <div className="space-y-4 mb-8">
           <div className="flex items-center gap-3 text-sm">
             <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
               <HiMail className="w-4 h-4 text-surface-500" />
             </div>
             <a href={`mailto:${lead.email}`} className="text-primary-600 dark:text-primary-400 hover:underline font-medium">{lead.email}</a>
           </div>
           {lead.phone && (
             <div className="flex items-center gap-3 text-sm">
               <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                 <HiPhone className="w-4 h-4 text-surface-500" />
               </div>
               <a href={`tel:${lead.phone}`} className="text-surface-600 dark:text-surface-300 font-medium">{lead.phone}</a>
             </div>
           )}
           {lead.source && (
             <div className="flex items-center gap-3 text-sm">
               <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                 <HiTag className="w-4 h-4 text-surface-500" />
               </div>
               <span className="text-surface-600 dark:text-surface-300">Source: <span className="font-bold text-surface-900 dark:text-white capitalize">{lead.source}</span></span>
             </div>
           )}
           <div className="flex items-center gap-3 text-sm">
             <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
               <HiStar className="w-4 h-4 text-surface-500" />
             </div>
             <span className="text-surface-600 dark:text-surface-300">Lead Score: <span className={cn('font-bold px-2.5 py-0.5 rounded-full text-xs ml-1', scoreColors[getScoreLevel(lead.score || 0)])}>{lead.score || 0}</span></span>
           </div>
         </div>

         <div className="mb-8">
           <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-3">Lead Status</label>
           <div className="flex flex-wrap gap-2">
             {Object.entries(STATUS_CONFIG).map(([key, config]) => (
               <button key={key} onClick={() => onStatusChange(lead._id, key)}
                 className={cn('px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-transparent',
                   lead.status === key ? cn(config.color, 'border-current shadow-sm scale-105') : 'text-surface-500 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700')}>
                 {config.label}
               </button>
             ))}
           </div>
         </div>

         <div className="mb-8">
           <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-3">Initial Message</label>
           <div className="bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl p-4 shadow-inner">
              <p className="text-sm text-surface-600 dark:text-surface-300 italic">{lead.message || 'No message provided'}</p>
           </div>
         </div>

         <div className="flex gap-3 pt-6 border-t border-surface-200 dark:border-surface-800">
           <Button variant="primary" size="lg" className="flex-1 shadow-glow" onClick={() => { window.location.href = `mailto:${lead.email}`; }}>
             <HiMail className="w-5 h-5 mr-2" /> Email Lead
           </Button>
           <Button variant="outline" size="lg">Add Note</Button>
         </div>
       </Card>
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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'

  useEffect(() => { fetchWebsites(); }, [fetchWebsites]);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const { data } = await leadService.getLeads({
          page, limit: 100, search: search || undefined,
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
      toast.success(`Lead moved to ${STATUS_CONFIG[status].label}`);
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
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <FiUsers className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-surface-950 dark:text-white">CRM & Leads</h1>
            <p className="text-surface-500 mt-1">Manage, track, and convert your incoming leads</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-900 p-1 rounded-xl border border-surface-200 dark:border-surface-800 mr-2">
             <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-white dark:bg-surface-800 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500')}>
                <HiViewList className="w-5 h-5" />
             </button>
             <button onClick={() => setViewMode('board')} className={cn('p-2 rounded-lg transition-all', viewMode === 'board' ? 'bg-white dark:bg-surface-800 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500')}>
                <HiViewBoards className="w-5 h-5" />
             </button>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <HiDownload className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="primary" size="sm" className="shadow-glow">
            <FiUserPlus className="w-4 h-4 mr-2" /> Add Lead
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-col lg:flex-row items-start lg:items-center gap-4 border-surface-200 dark:border-surface-800">
        <div className="flex-1 w-full relative">
           <Input
             type="text"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search leads by name or email..."
             leftIcon={<HiSearch className="w-5 h-5" />}
           />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-surface-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/20">
             <option value="all">All Statuses</option>
             {Object.keys(STATUS_CONFIG).map((s) => (
               <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
             ))}
          </select>
          <select value={websiteFilter} onChange={(e) => setWebsiteFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-surface-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/20">
            <option value="">All Websites</option>
            {websiteList.map((w) => (
              <option key={w._id || w.id} value={w._id || w.id}>{w.name || w.businessName}</option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-950 text-surface-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500/20">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="score">Highest Score</option>
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={cn(selectedLead ? 'lg:col-span-2' : 'lg:col-span-3')}>
          
          {viewMode === 'list' ? (
             <Card className="p-0 overflow-hidden border-surface-200 dark:border-surface-800">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
                       <th className="w-12 px-6 py-4">
                         <input type="checkbox" onChange={() => selectedIds.length === filtered.length ? setSelectedIds([]) : setSelectedIds(filtered.map((l) => l._id))}
                           checked={selectedIds.length === filtered.length && filtered.length > 0}
                           className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                       </th>
                       <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Lead</th>
                       <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Contact</th>
                       <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Score</th>
                       <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Status</th>
                       <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                     {filtered.map((lead, i) => (
                       <motion.tr key={lead._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                         onClick={() => setSelectedLead(lead)}
                         className={cn('hover:bg-surface-50 dark:hover:bg-surface-900/30 transition-colors cursor-pointer group',
                           selectedLead?._id === lead._id && 'bg-primary-50/50 dark:bg-primary-900/10')}>
                         <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                           <input type="checkbox" checked={selectedIds.includes(lead._id)} onChange={() => toggleSelect(lead._id)}
                             className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                               {lead.name?.charAt(0) || '?'}
                             </div>
                             <div>
                               <p className="font-bold text-surface-900 dark:text-white">{lead.name}</p>
                               {lead.company && <p className="text-xs text-surface-500 font-medium">{lead.company}</p>}
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className="space-y-1">
                             <a href={`mailto:${lead.email}`} className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 block truncate max-w-[200px]">{lead.email}</a>
                             {lead.phone && <span className="text-xs text-surface-400 block">{lead.phone}</span>}
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', scoreColors[getScoreLevel(lead.score || 0)])}>
                             {lead.score || 0}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           <StatusBadge status={lead.status} />
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all opacity-0 group-hover:opacity-100">
                               <FiMoreVertical className="w-5 h-5" />
                            </button>
                         </td>
                       </motion.tr>
                     ))}
                   </tbody>
                 </table>
                 {filtered.length === 0 && !loading && (
                   <div className="text-center py-16">
                     <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiUsers className="w-8 h-8 text-surface-400" />
                     </div>
                     <h3 className="text-lg font-display font-bold text-surface-900 dark:text-white">No leads found</h3>
                     <p className="text-surface-500 max-w-sm mx-auto mt-2">Adjust your filters or search terms to find what you're looking for.</p>
                   </div>
                 )}
               </div>
             </Card>
          ) : (
             /* Kanban Board View */
             <div className="flex gap-4 overflow-x-auto pb-4 snap-x min-h-[600px]">
                {Object.keys(STATUS_CONFIG).map((status) => {
                   const columnLeads = filtered.filter(l => l.status === status);
                   const config = STATUS_CONFIG[status];
                   const Icon = config.icon;
                   return (
                      <div key={status} className="w-[320px] shrink-0 snap-center flex flex-col bg-surface-50 dark:bg-surface-950/50 rounded-2xl p-4 border border-surface-200 dark:border-surface-800">
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", config.color)}>
                                  <Icon className="w-4 h-4" />
                               </div>
                               <h3 className="font-display font-bold text-surface-900 dark:text-white uppercase tracking-wider text-sm">{config.label}</h3>
                            </div>
                            <span className="bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                               {columnLeads.length}
                            </span>
                         </div>
                         <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
                            {columnLeads.map(lead => (
                               <Card key={lead._id} className="p-4 cursor-pointer hover:border-primary-500 hover:shadow-lg transition-all" onClick={() => setSelectedLead(lead)}>
                                  <div className="flex justify-between items-start mb-3">
                                     <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider', scoreColors[getScoreLevel(lead.score || 0)])}>
                                        Score: {lead.score || 0}
                                     </span>
                                     <span className="text-xs text-surface-400 font-medium">{new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                                  </div>
                                  <h4 className="font-bold text-surface-900 dark:text-white mb-1">{lead.name}</h4>
                                  <p className="text-xs text-surface-500 font-medium truncate mb-3">{lead.company || lead.email}</p>
                                  <div className="flex items-center gap-2 text-xs text-surface-400">
                                     <HiTag className="w-3 h-3" />
                                     <span className="capitalize">{lead.source || 'Website'}</span>
                                  </div>
                               </Card>
                            ))}
                            {columnLeads.length === 0 && (
                               <div className="h-24 border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-xl flex items-center justify-center text-xs text-surface-400 font-medium">
                                  No leads in {config.label}
                               </div>
                            )}
                         </div>
                      </div>
                   )
                })}
             </div>
          )}
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
