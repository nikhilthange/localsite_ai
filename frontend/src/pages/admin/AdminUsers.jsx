import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiSearch, HiFilter, HiDotsVertical, HiBan, HiTrash, HiShieldCheck, HiMail } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const roles = ['user', 'admin', 'super_admin'];
const planColors = {
  free: 'badge-neutral',
  starter: 'badge-primary',
  professional: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  enterprise: 'badge-success',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users', { params: { page, limit: 20, search, role: roleFilter !== 'all' ? roleFilter : undefined } });
        setUsers(data.users || data.data || []);
      } catch {
        setUsers([
          { _id: '1', name: 'John Smith', email: 'john@example.com', role: 'user', plan: 'professional', status: 'active', websites: 5, createdAt: '2026-01-15' },
          { _id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'admin', plan: 'enterprise', status: 'active', websites: 12, createdAt: '2026-02-20' },
          { _id: '3', name: 'Mike Brown', email: 'mike@example.com', role: 'user', plan: 'free', status: 'active', websites: 1, createdAt: '2026-03-10' },
          { _id: '4', name: 'Emily Davis', email: 'emily@example.com', role: 'user', plan: 'starter', status: 'inactive', websites: 3, createdAt: '2026-03-22' },
          { _id: '5', name: 'Alex Wilson', email: 'alex@example.com', role: 'user', plan: 'professional', status: 'active', websites: 8, createdAt: '2026-04-01' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--color-text))]">User Management</h1>
        <p className="text-sm text-[rgb(var(--color-text-muted))]">Manage all registered users</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 card">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-muted))]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
              className="input-field pl-10" />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'user', 'admin', 'super_admin'].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={twMerge('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                  roleFilter === r ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface))]')}>
                {r === 'super_admin' ? 'Super Admin' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]">
                <th className="text-left px-6 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">Websites</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-[rgb(var(--color-text-muted))] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--color-border))]">
              {users.map((u, i) => (
                <motion.tr key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-[rgb(var(--color-surface))] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--color-text))]">{u.name}</p>
                        <p className="text-xs text-[rgb(var(--color-text-muted))]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="text-sm bg-transparent border border-[rgb(var(--color-border))] rounded-lg px-2.5 py-1.5 text-[rgb(var(--color-text-secondary))] focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer">
                      {roles.map((r) => (
                        <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={twMerge('capitalize', planColors[u.plan] || planColors.free)}>
                      {u.plan || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[rgb(var(--color-text-secondary))]">{u.websites || 0}</td>
                  <td className="px-6 py-4">
                    <span className={twMerge('badge',
                      u.status === 'active' ? 'badge-success' : 'badge-neutral')}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[rgb(var(--color-text-muted))]">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '\u2014'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(u.email); toast.success('Email copied'); }}
                        className="p-2 rounded-lg hover:bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))] transition-colors">
                        <HiMail className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRoleChange(u._id, u.role === 'user' ? 'admin' : 'user')}
                        className="p-2 rounded-lg hover:bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))] transition-colors"
                        title="Toggle admin status">
                        <HiShieldCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-[rgb(var(--color-text-muted))] hover:text-red-500 transition-colors">
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[rgb(var(--color-text-muted))]">No users found</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[rgb(var(--color-text-muted))]">Showing {users.length} users</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-outline btn-sm">Previous</button>
          <button onClick={() => setPage((p) => p + 1)}
            className="btn-outline btn-sm">Next</button>
        </div>
      </div>
    </div>
  );
}
