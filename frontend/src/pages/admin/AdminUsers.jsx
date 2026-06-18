import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { HiSearch, HiFilter, HiDotsVertical, HiBan, HiTrash, HiShieldCheck, HiMail } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const roles = ['user', 'admin', 'super_admin'];
const planColors = {
  free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  starter: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  professional: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  enterprise: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
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
        // Use placeholder data
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage all registered users</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-md">
            <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'user', 'admin', 'super_admin'].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={twMerge('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors',
                  roleFilter === r ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800')}>
                {r === 'super_admin' ? 'Super Admin' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Websites</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.map((u, i) => (
                <motion.tr key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none cursor-pointer">
                      {roles.map((r) => (
                        <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={twMerge('px-2.5 py-1 rounded-full text-xs font-medium capitalize', planColors[u.plan] || planColors.free)}>
                      {u.plan || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.websites || 0}</td>
                  <td className="px-6 py-4">
                    <span className={twMerge('px-2.5 py-1 rounded-full text-xs font-medium',
                      u.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500')}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(u.email); toast.success('Email copied'); }}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <HiMail className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRoleChange(u._id, u.role === 'user' ? 'admin' : 'user')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Toggle admin status">
                        <HiShieldCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
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
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Showing {users.length} users</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">Previous</button>
          <button onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
