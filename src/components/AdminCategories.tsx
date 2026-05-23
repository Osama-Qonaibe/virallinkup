'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  icon: string | null;
}

export default function AdminCategories() {
  const { currentLang } = useAppStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', nameEn: '', slug: '', icon: 'Layout' });

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { setCategories(d || []); setLoading(false); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      setCategories(prev => [...prev, d]);
      setShowForm(false);
      setForm({ name: '', nameEn: '', slug: '', icon: 'Layout' });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold gradient-text">{t('categoriesManage', currentLang)}</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />{currentLang === 'ar' ? 'إضافة تصنيف' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{currentLang === 'ar' ? 'إضافة تصنيف' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#8888A0] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={currentLang === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50" />
              <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Name (English)" dir="ltr" className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50" />
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" dir="ltr" className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50" />
              <button onClick={handleSave} className="w-full btn-primary py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Check className="w-4 h-4" />{t('save', currentLang)}</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{currentLang === 'ar' ? c.name : (c.nameEn || c.name)}</p>
              <p className="text-xs text-[#8888A0]">{c.slug}</p>
            </div>
            <Trash2 className="w-4 h-4 text-[#8888A0] hover:text-red-400 cursor-pointer transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
