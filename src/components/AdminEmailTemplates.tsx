'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Plus, Edit3, Trash2, Eye, EyeOff, Save, X, Send,
  Globe, Server, TestTube, Check, AlertTriangle, Code, Palette,
  FileText, RotateCcw, Search, ToggleLeft, ToggleRight
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  key: string;
  subject: string;
  subjectEn: string | null;
  bodyHtml: string;
  bodyHtmlEn: string | null;
  variables: string;
  isActive: boolean;
}

const defaultTemplateDescriptions: Record<string, { ar: string; en: string }> = {
  welcome: { ar: 'ترحيب بمستخدم جديد', en: 'Welcome new user' },
  purchase_confirmation: { ar: 'تأكيد عملية الشراء', en: 'Purchase confirmation' },
  payment_confirmation: { ar: 'تأكيد عملية الدفع', en: 'Payment confirmation' },
  wallet_deposit: { ar: 'إيداع في المحفظة', en: 'Wallet deposit' },
  wallet_withdrawal: { ar: 'سحب من المحفظة', en: 'Wallet withdrawal' },
  referral_commission: { ar: 'عمولة إحالة جديدة', en: 'New referral commission' },
  subscription_activated: { ar: 'تفعيل الاشتراك', en: 'Subscription activated' },
  subscription_cancelled: { ar: 'إلغاء الاشتراك', en: 'Subscription cancelled' },
  password_reset: { ar: 'استعادة كلمة المرور', en: 'Password reset' },
};

export default function AdminEmailTemplates() {
  const { currentLang } = useAppStore();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'test'>('templates');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewLang, setPreviewLang] = useState<'ar' | 'en'>('ar');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  // Settings state
  const [emailSettings, setEmailSettings] = useState<Record<string, string>>({});
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Test email state
  const [testTo, setTestTo] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Editor form state
  const [editorKey, setEditorKey] = useState('');
  const [editorSubjectAr, setEditorSubjectAr] = useState('');
  const [editorSubjectEn, setEditorSubjectEn] = useState('');
  const [editorBodyAr, setEditorBodyAr] = useState('');
  const [editorBodyEn, setEditorBodyEn] = useState('');
  const [editorActive, setEditorActive] = useState(true);

  useEffect(() => {
    fetchTemplates();
    fetchEmailSettings();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/email-templates');
      const data = await res.json();
      setTemplates(data || []);
    } catch {}
    setLoading(false);
  };

  const fetchEmailSettings = async () => {
    try {
      const res = await fetch('/api/admin/email-settings');
      const data = await res.json();
      setEmailSettings(data || {});
    } catch {}
  };

  const openCreateEditor = () => {
    setEditingTemplate(null);
    setEditorKey('');
    setEditorSubjectAr('');
    setEditorSubjectEn('');
    setEditorBodyAr('');
    setEditorBodyEn('');
    setEditorActive(true);
    setShowEditor(true);
  };

  const openEditEditor = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditorKey(template.key);
    setEditorSubjectAr(template.subject);
    setEditorSubjectEn(template.subjectEn || '');
    setEditorBodyAr(template.bodyHtml);
    setEditorBodyEn(template.bodyHtmlEn || '');
    setEditorActive(template.isActive);
    setShowEditor(true);
  };

  const handleSaveTemplate = async () => {
    if (!editorKey.trim() || !editorBodyAr.trim()) return;
    setSaving(true);

    const body = {
      key: editorKey.trim(),
      subject: editorSubjectAr,
      subjectEn: editorSubjectEn || null,
      bodyHtml: editorBodyAr,
      bodyHtmlEn: editorBodyEn || null,
      isActive: editorActive,
    };

    try {
      if (editingTemplate) {
        const res = await fetch(`/api/admin/email-templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          fetchTemplates();
          setShowEditor(false);
        }
      } else {
        const res = await fetch('/api/admin/email-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          fetchTemplates();
          setShowEditor(false);
        }
      }
    } catch {}
    setSaving(false);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm(currentLang === 'ar' ? 'هل أنت متأكد من حذف هذا القالب؟' : 'Are you sure you want to delete this template?')) return;
    try {
      await fetch(`/api/admin/email-templates/${id}`, { method: 'DELETE' });
      fetchTemplates();
    } catch {}
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      await fetch(`/api/admin/email-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      fetchTemplates();
    } catch {}
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await fetch('/api/admin/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch {}
    setSavingSettings(false);
  };

  const handleTestEmail = async () => {
    if (!testTo) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/email-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testTo, subject: testSubject || 'Test Email', message: testMessage }),
      });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.success ? (currentLang === 'ar' ? 'تم الإرسال بنجاح' : 'Sent successfully') : data.error });
    } catch {
      setTestResult({ success: false, message: 'Failed to send test email' });
    }
    setSendingTest(false);
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewLang(currentLang === 'ar' ? 'ar' : 'en');
    const html = previewLang === 'en' && template.bodyHtmlEn ? template.bodyHtmlEn : template.bodyHtml;
    setPreviewHtml(html);
    setShowPreview(true);
  };

  const filteredTemplates = templates.filter(tpl =>
    tpl.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tpl.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-[#F61A5A] border-t-transparent rounded-full" /></div>;

  const tabs = [
    { key: 'templates' as const, label: currentLang === 'ar' ? 'قوالب البريد' : 'Email Templates', icon: FileText },
    { key: 'settings' as const, label: currentLang === 'ar' ? 'إعدادات SMTP' : 'SMTP Settings', icon: Server },
    { key: 'test' as const, label: currentLang === 'ar' ? 'اختبار البريد' : 'Test Email', icon: TestTube },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {currentLang === 'ar' ? 'البريد الإلكتروني والقوالب' : 'Email & Templates'}
        </h1>
        <div className="flex gap-2">
          {activeTab === 'templates' && (
            <button onClick={openCreateEditor} className="btn-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {currentLang === 'ar' ? 'إنشاء قالب' : 'Create Template'}
            </button>
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

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-[#8888A0]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLang === 'ar' ? 'بحث في القوالب...' : 'Search templates...'}
              className="w-full py-2.5 ps-10 pe-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
            />
          </div>

          {/* Template Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const desc = defaultTemplateDescriptions[template.key];
              return (
                <div
                  key={template.id}
                  className={`glass-card rounded-2xl p-5 transition-all hover:border-[#F61A5A]/20 ${!template.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Code className="w-3.5 h-3.5 text-[#F61A5A] shrink-0" />
                        <p className="text-sm font-semibold text-white truncate" dir="ltr">{template.key}</p>
                      </div>
                      <p className="text-xs text-[#8888A0]">
                        {desc ? (currentLang === 'ar' ? desc.ar : desc.en) : template.subject}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(template)}
                      className="shrink-0 ms-2"
                      title={template.isActive ? (currentLang === 'ar' ? 'معطل' : 'Disable') : (currentLang === 'ar' ? 'مفعّل' : 'Enable')}
                    >
                      {template.isActive
                        ? <ToggleRight className="w-6 h-6 text-[#F61A5A]" />
                        : <ToggleLeft className="w-6 h-6 text-[#8888A0]" />
                      }
                    </button>
                  </div>

                  {/* Bilingual subject preview */}
                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-[#B4CDD3] truncate" dir="rtl">{template.subject}</p>
                    {template.subjectEn && (
                      <p className="text-xs text-[#B4CDD3]/60 truncate" dir="ltr">{template.subjectEn}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => openEditEditor(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#B4CDD3] hover:bg-white/5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {t('edit', currentLang)}
                    </button>
                    <button
                      onClick={() => handlePreview(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#B4CDD3] hover:bg-white/5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {t('view', currentLang)}
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-[#8888A0]">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{currentLang === 'ar' ? 'لا توجد قوالب' : 'No templates found'}</p>
            </div>
          )}
        </div>
      )}

      {/* SMTP Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <Server className="w-4 h-4 text-[#F61A5A]" />
              {currentLang === 'ar' ? 'إعدادات خادم SMTP' : 'SMTP Server Settings'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">SMTP Host</label>
                <input
                  value={emailSettings.smtp_host || ''}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">SMTP Port</label>
                <input
                  value={emailSettings.smtp_port || '587'}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                  placeholder="587"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">{currentLang === 'ar' ? 'البريد الإلكتروني المرسل' : 'From Email'}</label>
                <input
                  value={emailSettings.smtp_user || ''}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtp_user: e.target.value })}
                  placeholder="user@gmail.com"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">{currentLang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                <div className="relative">
                  <input
                    type={showSmtpPass ? 'text' : 'password'}
                    value={emailSettings.smtp_pass || ''}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_pass: e.target.value })}
                    placeholder="••••••••"
                    className="w-full py-2.5 px-4 pe-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                    dir="ltr"
                  />
                  <button onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute top-1/2 -translate-y-1/2 end-3 text-[#8888A0] hover:text-white">
                    {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">{currentLang === 'ar' ? 'اسم المرسل' : 'From Name'}</label>
                <input
                  value={emailSettings.email_from_name || ''}
                  onChange={(e) => setEmailSettings({ ...emailSettings, email_from_name: e.target.value })}
                  placeholder="ViralLinkUp"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#8888A0] font-medium">{currentLang === 'ar' ? 'بريد الرد' : 'Reply-To Email'}</label>
                <input
                  value={emailSettings.email_from || ''}
                  onChange={(e) => setEmailSettings({ ...emailSettings, email_from: e.target.value })}
                  placeholder="support@virallinkup.com"
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  onClick={() => setEmailSettings({ ...emailSettings, smtp_secure: emailSettings.smtp_secure === 'true' ? 'false' : 'true' })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    emailSettings.smtp_secure === 'true'
                      ? 'bg-[#F61A5A]/15 text-[#F61A5A] border border-[#F61A5A]/30'
                      : 'bg-white/5 text-[#8888A0] border border-white/10'
                  }`}
                >
                  {emailSettings.smtp_secure === 'true'
                    ? (currentLang === 'ar' ? 'TLS/SSL مفعّل' : 'TLS/SSL Enabled')
                    : (currentLang === 'ar' ? 'TLS/SSL معطل' : 'TLS/SSL Disabled')
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button onClick={handleSaveSettings} disabled={savingSettings} className="btn-primary px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                {savingSettings ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                {savingSettings ? t('loading', currentLang) : t('save', currentLang)}
              </button>
              {settingsSaved && (
                <span className="flex items-center gap-1 text-emerald-400 text-sm">
                  <Check className="w-4 h-4" />{t('success', currentLang)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Email Tab */}
      {activeTab === 'test' && (
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TestTube className="w-4 h-4 text-[#F61A5A]" />
            {currentLang === 'ar' ? 'اختبار إرسال البريد' : 'Send Test Email'}
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-[#8888A0] font-medium">{currentLang === 'ar' ? 'إرسال إلى' : 'Send To'}</label>
              <input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="user@example.com"
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#8888A0] font-medium">{currentLang === 'ar' ? 'الموضوع' : 'Subject'}</label>
              <input
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                placeholder={currentLang === 'ar' ? 'اختبار من فيرال لينك أب' : 'Test from ViralLinkUp'}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-[#8888A0] font-medium">{currentLang === 'ar' ? 'الرسالة' : 'Message'}</label>
              <textarea
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder={currentLang === 'ar' ? 'محتوى الرسالة التجريبية...' : 'Test message content...'}
                rows={4}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50 resize-none"
              />
            </div>
          </div>
          <button
            onClick={handleTestEmail}
            disabled={sendingTest || !testTo}
            className="btn-primary px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {sendingTest ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Send className="w-4 h-4" />}
            {sendingTest ? t('sending', currentLang) : (currentLang === 'ar' ? 'إرسال اختباري' : 'Send Test')}
          </button>
          {testResult && (
            <div className={`rounded-xl p-3 ${testResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <div className="flex items-center gap-2">
                {testResult.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                <p className={`text-sm ${testResult.success ? 'text-emerald-400' : 'text-red-400'}`}>{testResult.message}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Template Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#1A1A2E] z-10 rounded-t-2xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#F61A5A]" />
                  {editingTemplate ? (currentLang === 'ar' ? 'تعديل القالب' : 'Edit Template') : (currentLang === 'ar' ? 'إنشاء قالب جديد' : 'Create New Template')}
                </h3>
                <button onClick={() => setShowEditor(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#8888A0]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Key */}
                <div className="space-y-2">
                  <label className="text-xs text-[#8888A0] font-medium">Template Key</label>
                  <input
                    value={editorKey}
                    onChange={(e) => setEditorKey(e.target.value)}
                    placeholder="e.g., welcome, order_confirmation"
                    disabled={!!editingTemplate}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50 disabled:opacity-50 font-mono"
                    dir="ltr"
                  />
                </div>

                {/* Arabic Subject */}
                <div className="space-y-2">
                  <label className="text-xs text-[#8888A0] font-medium flex items-center gap-1">
                    {t('productTitle', currentLang)} (AR) <Globe className="w-3 h-3" />
                  </label>
                  <input
                    value={editorSubjectAr}
                    onChange={(e) => setEditorSubjectAr(e.target.value)}
                    placeholder={currentLang === 'ar' ? 'موضوع البريد بالعربية' : 'Email subject in Arabic'}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                    dir="rtl"
                  />
                </div>

                {/* English Subject */}
                <div className="space-y-2">
                  <label className="text-xs text-[#8888A0] font-medium flex items-center gap-1">
                    Subject (EN) <Globe className="w-3 h-3" />
                  </label>
                  <input
                    value={editorSubjectEn}
                    onChange={(e) => setEditorSubjectEn(e.target.value)}
                    placeholder="Email subject in English"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50"
                    dir="ltr"
                  />
                </div>

                {/* Arabic Body */}
                <div className="space-y-2">
                  <label className="text-xs text-[#8888A0] font-medium flex items-center gap-1">
                    Body HTML (AR) <Globe className="w-3 h-3" />
                  </label>
                  <textarea
                    value={editorBodyAr}
                    onChange={(e) => setEditorBodyAr(e.target.value)}
                    placeholder='<h2 style="color:#F61A5A;">مرحباً {{name}}</h2><p style="color:#E8E8F0;">أهلاً بك في منصتنا</p>'
                    rows={8}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50 font-mono resize-none"
                    dir="ltr"
                  />
                </div>

                {/* English Body */}
                <div className="space-y-2">
                  <label className="text-xs text-[#8888A0] font-medium flex items-center gap-1">
                    Body HTML (EN) <Globe className="w-3 h-3" />
                  </label>
                  <textarea
                    value={editorBodyEn}
                    onChange={(e) => setEditorBodyEn(e.target.value)}
                    placeholder='<h2 style="color:#F61A5A;">Hello {{name}}</h2><p style="color:#E8E8F0;">Welcome to our platform</p>'
                    rows={8}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#F61A5A]/50 placeholder:text-[#8888A0]/50 font-mono resize-none"
                    dir="ltr"
                  />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditorActive(!editorActive)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      background: editorActive ? 'rgba(246,26,90,0.15)' : 'rgba(255,255,255,0.05)',
                      borderColor: editorActive ? 'rgba(246,26,90,0.3)' : 'rgba(255,255,255,0.1)',
                      color: editorActive ? '#F61A5A' : '#8888A0',
                    }}
                  >
                    {editorActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    {editorActive ? (currentLang === 'ar' ? 'مفعّل' : 'Active') : (currentLang === 'ar' ? 'معطل' : 'Inactive')}
                  </button>
                </div>

                {/* Variables hint */}
                <div className="rounded-xl p-3 bg-[#B4CDD3]/5 border border-[#B4CDD3]/20">
                  <p className="text-xs text-[#B4CDD3] font-medium mb-1">
                    {currentLang === 'ar' ? 'المتغيرات المتاحة:' : 'Available variables:'}
                  </p>
                  <p className="text-xs text-[#8888A0] font-mono" dir="ltr">
                    {'{{name}}, {{email}}, {{amount}}, {{productName}}, {{plan}}, {{commission}}, {{referredName}}'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={handleSaveTemplate} disabled={saving || !editorKey.trim() || !editorBodyAr.trim()} className="btn-primary px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                    {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                    {t('save', currentLang)}
                  </button>
                  <button onClick={() => setShowEditor(false)} className="px-5 py-2 rounded-xl text-sm font-medium text-[#8888A0] hover:bg-white/5 transition-colors">
                    {t('cancel', currentLang)}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-[#F61A5A]" />
                  <span className="text-sm font-semibold text-white">{currentLang === 'ar' ? 'معاينة القالب' : 'Template Preview'}</span>
                  <div className="flex gap-1">
                    {(['ar', 'en'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => setPreviewLang(l)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          previewLang === l ? 'bg-[#F61A5A]/15 text-[#F61A5A]' : 'bg-white/5 text-[#8888A0]'
                        }`}
                      >
                        {l === 'ar' ? 'العربية' : 'English'}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-[#8888A0]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
