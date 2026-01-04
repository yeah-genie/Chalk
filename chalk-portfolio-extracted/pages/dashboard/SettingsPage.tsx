
import React from 'react';
import { Settings, Zap, Mail, Video, Calendar, Shield, CreditCard } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/Button';

export const SettingsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your account, integrations, and billing preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Integrations */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap size={20} className="text-indigo-600" /> Zero-Action Integrations
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg flex items-center justify-center">
                    <Video size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Zoom Account</p>
                    <p className="text-sm text-slate-500">Auto-transcribe and log sessions.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Connected</span>
                  <Button variant="outline" size="sm">Disconnect</Button>
                </div>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-lg flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Gmail Analysis</p>
                    <p className="text-sm text-slate-500">Analyze student/parent correspondence.</p>
                  </div>
                </div>
                <Button size="sm">Connect</Button>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Google Calendar</p>
                    <p className="text-sm text-slate-500">Sync lesson scheduling automatically.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">Connected</span>
                  <Button variant="outline" size="sm">Disconnect</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security & Billing */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield size={18} className="text-indigo-600" /> Security
              </h3>
              <p className="text-sm text-slate-500">Manage your password and authentication methods.</p>
              <Button variant="outline" size="sm" fullWidth>Change Password</Button>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard size={18} className="text-indigo-600" /> Subscription
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-600">Pro Plan</span>
                <span className="text-sm text-slate-500">$29/mo</span>
              </div>
              <Button variant="outline" size="sm" fullWidth>Manage Billing</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
