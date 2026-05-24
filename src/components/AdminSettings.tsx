'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect, useRef } from 'react';
import { Settings, Upload, Image, Palette, Globe, Save, Check, RotateCcw, CreditCard, Eye, EyeOff, Zap, AlertTriangle } from 'lucide-react';

export default function AdminSettings() {
  const { currentLang } = useAppStore();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('brand');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Payment state
  const [showPublishableKey, setShowPublishableKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => { setSettings(d || {}); setLoading(false); }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleImageUpload = (key: string) => {
    const input = key === 'siteLogo' ? logoInputRef : iconInputRef;
    input.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSettings(prev => ({ ...prev, [key]: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/payments/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: settings.stripe_secret_key }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: data.error || 'Connection failed' });
      }
    } catch {
      setTestResult({ success: false, message: 'Connection test failed' });
    }
    setTesting(false);
  };

  const isDemoMode = !settings.stripe_secret_key || !settings.stripe_publishable_key;

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  const tabs = [
    { key: 'brand', label: currentLang === 'ar' ? 'الهوية البصرية' : 'Brand Identity', icon: Palette },
    { key: 'general', label: currentLang === 'ar' ? 'عام' : 'General', icon: Globe },
    { key: 'payment', label: t('paymentGateway', currentLang), icon: CreditCard },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {t('settings', currentLang)}
        </h1>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2">
            {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
            {saving ? t('loading', currentLang) : t('save', currentLang)}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-emerald-400 text-sm py-2 px-3 bg-emerald-500/10 rounded-xl">
              <Check className="w-4 h-4" />{t('success', currentLang)}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#F61A5A]/15 text-[#F61A5A] border border-[#F61A5A]/30'
                  : 'text-[#8888A0] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Brand Identity Tab */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <Image className="w-4 h-4 text-[#F61A5A]" />
              {currentLang === 'ar' ? 'الشعار والأيقونة' : 'Logo & Icon'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs text-[#8888A0] font-medium">{t('siteLogo', currentLang)}</label>
                <div className="relative group">
                  <div className="w-full aspect-video rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-[#F61A5A]/30 transition-colors">
                    {settings.siteLogo ? (
                      <img src={settings.siteLogo} alt={t('siteLogo', currentLang)} className="w-full h-full object-contain p-4" />
                    ) : (
                      <div className="text-center space-y-2">
                        <Upload className="w-8 h-8 text-[#8888A0] mx-auto" />
                        <p className="text-xs text-[#8888A0]">{currentLang === 'ar' ? 'اضغط لرفع الشعار' : 'Click to upload logo'}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleImageUpload('siteLogo')}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </button>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'siteLogo')} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs text-[#8888A0] font-medium">{t('siteIcon', currentLang)}</label>
                <div className="relative group">
                  <div className="w-full aspect-video rounded-xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden hover:border-[#F61A5A]/30 transition-colors">
                    {settings.siteIcon ? (
                      <img src={settings.siteIcon} alt={t('siteIcon', currentLang)} className="w-20 h-20 object-contain" />
                    ) : (
                      <div className="text-center space-y-2">
                        <Upload className="w-8 h-8 text-[#8888A0] mx-auto" />
                        <p className="text-xs text-[#8888A0]">{currentLang === 'ar' ? 'اضغط لرفع الأيقونة' : 'Click to upload icon'}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleImageUpload('siteIcon')}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"
                  >
                    <Upload className="w-6 h-6 text-white" />
                  </button>
                  <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'siteIcon')} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#F61A5A]" />
              {currentLang === 'ar' ? 'الألوان' : 'Colors'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">{t('primaryColor', currentLang)}</label>
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <input type="color" value={settings.primaryColor || '#F61A5A'} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-12 h-12 rounded-xl border-0 cursor-pointer bg-transparent" />
                  </div>
                  <input value={settings.primaryColor || '#F61A5A'} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#F61A5A]/50" dir="ltr" />
                  <button onClick={() => setSettings({ ...settings, primaryColor: '#F61A5A' })} className="p-2 rounded-lg hover:bg-white/5 text-[#8888A0] hover:text-white transition-colors" title="Reset">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-2 rounded-full" style={{ background: `linear-gradient(to right, ${settings.primaryColor || '#F61A5A'}, ${settings.primaryColor || '#F61A5A'}88)` }} />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">{t('secondaryColor', currentLang)}</label>
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <input type="color" value={settings.secondaryColor || '#B4CDD3'} onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })} className="w-12 h-12 rounded-xl border-0 cursor-pointer bg-transparent" />
                  </div>
                  <input value={settings.secondaryColor || '#B4CDD3'} onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })} className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#F61A5A]/50" dir="ltr" />
                  <button onClick={() => setSettings({ ...settings, secondaryColor: '#B4CDD3' })} className="p-2 rounded-lg hover:bg-white/5 text-[#8888A0] hover:text-white transition-colors" title="Reset">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-2 rounded-full" style={{ background: `linear-gradient(to right, ${settings.secondaryColor || '#B4CDD3'}, ${settings.secondaryColor || '#B4CDD3'}88)` }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#F61A5A]" />
            {currentLang === 'ar' ? 'المعلومات العامة' : 'General Information'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs text-[#8888A0] font-medium">{t('siteName', currentLang)} (EN)</label>
              <input value={settings.siteName || 'ViralLinkUp'} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#8888A0] font-medium">{t('siteName', currentLang)} ({currentLang === 'ar' ? 'عربي' : 'AR'})</label>
              <input value={settings.siteNameAr || 'فيرال لينك أب'} onChange={(e) => setSettings({ ...settings, siteNameAr: e.target.value })} className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50" dir="rtl" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs text-[#8888A0] font-medium">{t('siteDescription', currentLang)}</label>
              <textarea value={settings.siteDescription || ''} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} rows={3} className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 resize-none" dir={currentLang === 'ar' ? 'rtl' : 'ltr'} />
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Tab */}
      {activeTab === 'payment' && (
        <div className="space-y-6">
          {/* Demo Mode Notice */}
          <div className={`rounded-2xl p-4 border ${isDemoMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
            <div className="flex items-start gap-3">
              {isDemoMode ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-semibold ${isDemoMode ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isDemoMode ? t('demoMode', currentLang) : t('stripeKeys', currentLang)}
                </p>
                <p className="text-xs text-[#8888A0] mt-1">
                  {isDemoMode
                    ? t('demoModeDesc', currentLang)
                    : (currentLang === 'ar' ? 'Stripe مفعل - سيتم معالجة المدفوعات عبر Stripe' : 'Stripe is active - Payments will be processed via Stripe')
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Stripe Mode Toggle */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#F61A5A]" />
              {currentLang === 'ar' ? 'وضع Stripe' : 'Stripe Mode'}
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSettings({ ...settings, stripe_mode: 'test' })}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  (settings.stripe_mode || 'test') === 'test'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-white/5 text-[#8888A0] border border-white/10 hover:border-white/20'
                }`}
              >
                {t('testMode', currentLang)}
              </button>
              <button
                onClick={() => setSettings({ ...settings, stripe_mode: 'live' })}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  settings.stripe_mode === 'live'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-[#8888A0] border border-white/10 hover:border-white/20'
                }`}
              >
                {t('liveMode', currentLang)}
              </button>
            </div>
          </div>

          {/* API Keys */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#F61A5A]" />
              {currentLang === 'ar' ? 'مفاتيح API' : 'API Keys'}
            </h2>
            <div className="space-y-5">
              {/* Publishable Key */}
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">{t('publishableKey', currentLang)}</label>
                <div className="relative">
                  <input
                    type={showPublishableKey ? 'text' : 'password'}
                    value={settings.stripe_publishable_key || ''}
                    onChange={(e) => setSettings({ ...settings, stripe_publishable_key: e.target.value })}
                    placeholder="pk_test_..."
                    className="w-full py-2.5 px-4 pe-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPublishableKey(!showPublishableKey)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-[#8888A0] hover:text-white transition-colors"
                  >
                    {showPublishableKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">{t('secretKey', currentLang)}</label>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    value={settings.stripe_secret_key || ''}
                    onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                    placeholder="sk_test_..."
                    className="w-full py-2.5 px-4 pe-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-[#8888A0] hover:text-white transition-colors"
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Webhook Secret */}
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">{t('webhookSecret', currentLang)}</label>
                <div className="relative">
                  <input
                    type={showWebhookSecret ? 'text' : 'password'}
                    value={settings.stripe_webhook_secret || ''}
                    onChange={(e) => setSettings({ ...settings, stripe_webhook_secret: e.target.value })}
                    placeholder="whsec_..."
                    className="w-full py-2.5 px-4 pe-12 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-[#8888A0] hover:text-white transition-colors"
                  >
                    {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Test Connection */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F61A5A]" />
                  {t('testConnection', currentLang)}
                </h2>
                <p className="text-xs text-[#8888A0] mt-1">
                  {currentLang === 'ar' ? 'تحقق من أن مفاتيح Stripe تعمل بشكل صحيح' : 'Verify your Stripe keys are working correctly'}
                </p>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={testing || !settings.stripe_secret_key}
                className="btn-primary px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {testing ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {testing ? (currentLang === 'ar' ? 'جاري الاختبار...' : 'Testing...') : t('testConnection', currentLang)}
              </button>
            </div>
            {testResult && (
              <div className={`mt-4 rounded-xl p-3 ${testResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <p className="text-sm text-emerald-400">{t('connectionSuccess', currentLang)}</p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <p className="text-sm text-red-400">{t('connectionFailed', currentLang)}: {testResult.message}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Currency */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#F61A5A]" />
              {currentLang === 'ar' ? 'عملة الدفع' : 'Payment Currency'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: 'usd', label: 'USD ($)', flag: '🇺🇸' },
                { value: 'eur', label: 'EUR (€)', flag: '🇪🇺' },
                { value: 'sar', label: 'SAR (﷼)', flag: '🇸🇦' },
                { value: 'aed', label: 'AED (د.إ)', flag: '🇦🇪' },
              ].map(curr => (
                <button
                  key={curr.value}
                  onClick={() => setSettings({ ...settings, payment_currency: curr.value })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    (settings.payment_currency || 'usd') === curr.value
                      ? 'bg-[#F61A5A]/15 text-[#F61A5A] border border-[#F61A5A]/30'
                      : 'bg-white/5 text-[#8888A0] border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{curr.flag}</span>
                  {curr.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
