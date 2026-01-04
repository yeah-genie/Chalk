
import React from 'react';
import { Video, Calendar, Clock, Tag, ExternalLink } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { MOCK_SESSIONS } from '../../constants';

export const SessionsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sessions</h1>
          <p className="text-slate-500 dark:text-slate-400">Chronological history of your automated session tracking.</p>
        </div>

        <div className="space-y-4">
          {MOCK_SESSIONS.map((session) => (
            <div key={session.id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${
                  session.platform === 'Zoom' 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                }`}>
                  <Video size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {session.studentName}
                    <span className="text-xs font-normal px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">
                      {session.platform}
                    </span>
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{session.topic}</p>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {session.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {session.duration} minutes</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                <button className="flex-1 md:flex-none text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-2 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/50">
                  View Transcript
                </button>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};
