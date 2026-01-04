
import React, { useState } from 'react';
import { UserCircle, Link as LinkIcon, Eye, Save, Trash2, Plus } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/Button';
import { MOCK_TUTOR } from '../../constants';

export const PortfolioSettingsPage: React.FC = () => {
  const [profile, setProfile] = useState(MOCK_TUTOR);
  const [newSubject, setNewSubject] = useState('');

  const addSubject = () => {
    if (newSubject && !profile.subjects.includes(newSubject)) {
      setProfile({ ...profile, subjects: [...profile.subjects, newSubject] });
      setNewSubject('');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Control how parents and students see your public profile.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex gap-2" onClick={() => window.open(`#/tutor/${profile.slug}`, '_blank')}>
              <Eye size={18} /> Preview
            </Button>
            <Button className="flex gap-2">
              <Save size={18} /> Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          {/* General Information */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCircle size={20} className="text-indigo-600" /> General Info
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional Title</label>
                <input 
                  type="text" 
                  value={profile.title}
                  onChange={(e) => setProfile({...profile, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Short Bio</label>
                <textarea 
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Subjects & Slug */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LinkIcon size={20} className="text-indigo-600" /> Branding & Subjects
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Portfolio URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">chalk.io/tutor/</span>
                  <input 
                    type="text" 
                    value={profile.slug}
                    onChange={(e) => setProfile({...profile, slug: e.target.value})}
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Expertise Subjects</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profile.subjects.map(s => (
                    <span key={s} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-900/50">
                      {s}
                      <button onClick={() => setProfile({...profile, subjects: profile.subjects.filter(sub => sub !== s)})}>
                        <Trash2 size={12} className="hover:text-rose-500" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Add subject (e.g. Physics)"
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                  />
                  <Button variant="outline" size="sm" onClick={addSubject}>
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
