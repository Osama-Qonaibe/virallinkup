'use client';

import { useAppStore, type PageName } from '@/lib/store';
import { t } from '@/lib/translations';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, ShoppingBag, CreditCard, Wallet, Users, Star, Download, AlertCircle, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  titleEn: string | null;
  message: string;
  messageEn: string | null;
  type: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'PURCHASE': return ShoppingBag;
    case 'PAYMENT': case 'WALLET_DEPOSIT': case 'WALLET_WITHDRAW': return CreditCard;
    case 'REFERRAL': return Users;
    case 'SUBSCRIPTION': return Star;
    case 'DOWNLOAD': return Download;
    case 'PASSWORD_RESET': return AlertCircle;
    default: return Info;
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case 'PURCHASE': return 'text-emerald-400 bg-emerald-500/15';
    case 'PAYMENT': case 'WALLET_DEPOSIT': return 'text-[#F61A5A] bg-[#F61A5A]/15';
    case 'WALLET_WITHDRAW': return 'text-amber-400 bg-amber-500/15';
    case 'REFERRAL': return 'text-blue-400 bg-blue-500/15';
    case 'SUBSCRIPTION': return 'text-purple-400 bg-purple-500/15';
    case 'DOWNLOAD': return 'text-cyan-400 bg-cyan-500/15';
    case 'PASSWORD_RESET': return 'text-orange-400 bg-orange-500/15';
    case 'SUBSCRIPTION_CANCEL': return 'text-red-400 bg-red-500/15';
    default: return 'text-[#B4CDD3] bg-[#B4CDD3]/15';
  }
}

function formatTime(dateStr: string, lang: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (lang === 'ar') {
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
    if (diffHour < 24) return `منذ ${diffHour} ساعة`;
    if (diffDay < 7) return `منذ ${diffDay} يوم`;
    return date.toLocaleDateString('ar-SA');
  }
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US');
}

export default function NotificationBell() {
  const { currentLang, user, setCurrentPage } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isRTL = currentLang === 'ar';

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications/unread');
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch {}
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=15');
      const data = await res.json();
      setNotifications(data.notifications || []);
      fetchUnreadCount();
    } catch {}
    setLoading(false);
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (isOpen && user) fetchNotifications();
  }, [isOpen, user, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) handleMarkRead(notification.id);
    if (notification.link) {
      setCurrentPage(notification.link as PageName);
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/5 transition-colors text-[#B4CDD3] hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#F61A5A] text-white text-[10px] font-bold animate-pulse-glow">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 rounded-2xl bg-[#1A1A2E] border border-white/10 shadow-2xl overflow-hidden z-50`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#F61A5A]" />
                {currentLang === 'ar' ? 'الإشعارات' : 'Notifications'}
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#F61A5A]/15 text-[#F61A5A] text-[11px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-[#B4CDD3] hover:bg-white/5 transition-colors"
                    title={currentLang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{currentLang === 'ar' ? 'قراءة الكل' : 'Read all'}</span>
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-[#8888A0]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin w-5 h-5 border-2 border-[#F61A5A] border-t-transparent rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Bell className="w-8 h-8 text-[#8888A0]/40 mx-auto mb-2" />
                  <p className="text-sm text-[#8888A0]">{currentLang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  const title = currentLang === 'en' && notification.titleEn ? notification.titleEn : notification.title;
                  const message = currentLang === 'en' && notification.messageEn ? notification.messageEn : notification.message;

                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-white/5 border-b border-white/3 ${
                        !notification.isRead ? 'bg-[#F61A5A]/5' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium truncate ${notification.isRead ? 'text-[#8888A0]' : 'text-white'}`}>
                            {title}
                          </p>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#F61A5A] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-[#8888A0] line-clamp-2 mt-0.5">{message}</p>
                        <p className="text-[10px] text-[#8888A0]/60 mt-1">
                          {formatTime(notification.createdAt, currentLang)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(notification.id); }}
                          className="p-1 rounded hover:bg-white/5 text-[#8888A0] hover:text-white shrink-0 mt-0.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
