'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  walletBalance: number;
  createdAt: string;
}

export default function AdminUsers() {
  const { currentLang } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(d || []); setLoading(false); }).catch(() => {});
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold gradient-text">{t('users', currentLang)}</h1>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="text-start py-3 px-4 text-[#8888A0] font-medium">{t('userName', currentLang)}</th>
                <th className="text-start py-3 px-4 text-[#8888A0] font-medium">{t('userEmail', currentLang)}</th>
                <th className="text-start py-3 px-4 text-[#8888A0] font-medium">{t('userRole', currentLang)}</th>
                <th className="text-start py-3 px-4 text-[#8888A0] font-medium">{t('balance', currentLang)}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white">{u.name || '-'}</td>
                  <td className="py-3 px-4 text-[#B4CDD3]">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-[#F61A5A]/20 text-[#F61A5A]' : 'bg-blue-500/20 text-blue-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">${u.walletBalance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
