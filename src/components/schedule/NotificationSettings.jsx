import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, BellOff, Mail, MailCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings({ user, onUserUpdated }) {
  const [browserPerm, setBrowserPerm] = useState(Notification?.permission || 'default');
  const [savingEmail, setSavingEmail] = useState(false);
  const emailEnabled = user?.email_notifications !== false; // default true

  const requestBrowserNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications are not supported.');
      return;
    }
    const result = await Notification.requestPermission();
    setBrowserPerm(result);
    if (result === 'granted') toast.success('Browser notifications enabled!');
    else toast.error('Permission denied.');
  };

  const toggleEmailNotifications = async () => {
    setSavingEmail(true);
    await base44.auth.updateMe({ email_notifications: !emailEnabled });
    setSavingEmail(false);
    onUserUpdated();
    toast.success(`Email notifications ${!emailEnabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
      <h3 className="text-sm font-semibold text-[#1B4332] mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4" /> Notification Settings
      </h3>
      <div className="space-y-3">
        {/* Browser notifications */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Browser Notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">Get alerted in-browser when care tasks are due</p>
          </div>
          {browserPerm === 'granted' ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg">
              <Bell className="w-3.5 h-3.5" /> Enabled
            </span>
          ) : browserPerm === 'denied' ? (
            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium bg-red-50 px-3 py-1.5 rounded-lg">
              <BellOff className="w-3.5 h-3.5" /> Blocked in browser
            </span>
          ) : (
            <button
              onClick={requestBrowserNotifications}
              className="flex items-center gap-1.5 text-xs text-[#1B4332] font-medium bg-[#1B4332]/10 hover:bg-[#1B4332]/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Bell className="w-3.5 h-3.5" /> Enable
            </button>
          )}
        </div>

        {/* Email notifications */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Email Notifications</p>
            <p className="text-xs text-gray-400 mt-0.5">Daily email summary of due care tasks</p>
          </div>
          <button
            onClick={toggleEmailNotifications}
            disabled={savingEmail}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              emailEnabled
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {savingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : emailEnabled ? <MailCheck className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
            {emailEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
}