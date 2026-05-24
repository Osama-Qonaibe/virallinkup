'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  titleEn: string | null;
  price: number;
  category: string | null;
  licenseType: string;
  isActive: boolean;
  downloads: number;
  thumbnailUrl: string | null;
}

export default function AdminProducts() {
  const { currentLang } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState<{ slug: string; name: string; nameEn: string | null }[]>([]);

  const [form, setForm] = useState({
    title: '', titleEn: '', description: '', descriptionEn: '', price: '',
    category: '', licenseType: 'PERSONAL', features: '[]', isActive: true,
  });

  useEffect(() => {
    fetch('/api/admin/products').then(r => r.json()).then(d => { setProducts(d || []); setLoading(false); }).catch(() => {});
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d || [])).catch(() => {});
  }, []);

  const handleSave = async () => {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
    });
    if (res.ok) {
      const d = await res.json();
      if (editing) {
        setProducts(prev => prev.map(p => p.id === d.id ? d : p));
      } else {
        setProducts(prev => [d, ...prev]);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ title: '', titleEn: '', description: '', descriptionEn: '', price: '', category: '', licenseType: 'PERSONAL', features: '[]', isActive: true });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm', currentLang))) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const editProduct = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title, titleEn: p.titleEn || '', description: '', descriptionEn: '',
      price: String(p.price), category: p.category || '', licenseType: p.licenseType,
      features: '[]', isActive: p.isActive,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold gradient-text">{t('products', currentLang)}</h1>
        <button onClick={() => { setEditing(null); setForm({ title: '', titleEn: '', description: '', descriptionEn: '', price: '', category: '', licenseType: 'PERSONAL', features: '[]', isActive: true }); setShowForm(true); }} className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />{t('addProduct', currentLang)}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{editing ? t('editProduct', currentLang) : t('addProduct', currentLang)}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#8888A0] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('productTitle', currentLang)} className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50" />
              <input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} placeholder={t('productTitleEn', currentLang)} dir="ltr" className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50" />
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" placeholder={t('productPrice', currentLang)} dir="ltr" className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50">
                <option value="">{currentLang === 'ar' ? 'بدون تصنيف' : 'No category'}</option>
                {categories.map(c => <option key={c.slug} value={c.slug} className="bg-[#1A1A2E]">{currentLang === 'ar' ? c.name : (c.nameEn || c.name)}</option>)}
              </select>
              <select value={form.licenseType} onChange={(e) => setForm({ ...form, licenseType: e.target.value })} className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50">
                {['PERSONAL', 'COMMERCIAL', 'EXTENDED', 'RESELLER', 'ENTERPRISE', 'PLR'].map(l => <option key={l} value={l} className="bg-[#1A1A2E]">{l}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Check className="w-4 h-4" />{t('save', currentLang)}</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10">{t('cancel', currentLang)}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {products.map((p) => (
            <div key={p.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
              <img src={p.thumbnailUrl || '/slider1.png'} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">{currentLang === 'ar' ? p.title : (p.titleEn || p.title)}</h3>
                <p className="text-xs text-[#8888A0]">${p.price} • {p.licenseType} • {p.downloads} downloads</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {p.isActive ? t('active', currentLang) : t('inactive', currentLang)}
              </span>
              <div className="flex gap-1">
                <button onClick={() => editProduct(p)} className="p-2 rounded-lg hover:bg-white/5 text-[#8888A0] hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-[#8888A0] hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
