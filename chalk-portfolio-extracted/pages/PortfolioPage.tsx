
import React from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  MapPin, 
  GraduationCap, 
  Clock, 
  History,
  Mail,
  Share2
} from 'lucide-react';
import { Badges, MOCK_TUTOR } from '../constants';
import { Button } from '../components/Button';

export const PortfolioPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-indigo-600 to-violet-700 relative">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 pb-20 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <div className="relative inline-block mb-4">
                <img 
                  src="https://picsum.photos/seed/tutor/200/200" 
                  alt={MOCK_TUTOR.name}
                  className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-800 object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-lg shadow-lg">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              <h1 className="text-2xl font-bold dark:text-white">{MOCK_TUTOR.name}</h1>
              <p className="text-indigo-600 font-semibold mb-4">{MOCK_TUTOR.title}</p>
              
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={16} /> <span>Palo Alto, CA (Online)</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} /> <span>Stanford University</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {MOCK_TUTOR.subjects.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700">
                    {s}
                  </span>
                ))}
              </div>

              <div className="space-y-3">
                <Button fullWidth>Inquire for Lessons</Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="flex gap-2">
                    <Mail size={16} /> Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex gap-2">
                    <Share2 size={16} /> Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Verified Badges Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Verified Reputation</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Badges.QuickResponse />
                  <div>
                    <p className="text-sm font-bold dark:text-white">Quick Response</p>
                    <p className="text-xs text-slate-500">Replies in &lt; 15 mins</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Badges.Consistent />
                  <div>
                    <p className="text-sm font-bold dark:text-white">Consistent</p>
                    <p className="text-xs text-slate-500">20+ sessions/month avg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Badges.Detailed />
                  <div>
                    <p className="text-sm font-bold dark:text-white">Detailed</p>
                    <p className="text-xs text-slate-500">High report quality score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Sessions</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{MOCK_TUTOR.stats.totalSessions}+</p>
              </div>
              <div className="text-center border-x border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Retention</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{MOCK_TUTOR.stats.longTermRate}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Experience</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">10 yrs</p>
              </div>
            </div>

            {/* About */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold mb-4 dark:text-white">About My Approach</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {MOCK_TUTOR.bio}
                <br /><br />
                My philosophy centers on diagnostic-driven instruction. Every lesson is preceded by an automated analysis of past performance, ensuring we never waste a minute on concepts already mastered. I specialize in high-stakes testing where every point matters for Ivy League and top-tier admissions.
              </p>
            </div>

            {/* Student Progress Timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold dark:text-white">Verified Session Activity</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time Feed</span>
              </div>
              
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
                
                {[
                  { student: "S.K.", result: "Completed Diagnostic", time: "2 hours ago", details: "Diagnostic Test: 1540 Mock Score" },
                  { student: "M.J.", result: "Weekly Strategy Review", time: "5 hours ago", details: "Calculus BC: Optimization Problems" },
                  { student: "D.L.", result: "Vocabulary Expansion", time: "Yesterday", details: "Digital SAT English Module 2" },
                  { student: "A.R.", result: "Practice Set Review", time: "2 days ago", details: "ACT Science: Interpretation of Data" }
                ].map((event, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    {/* Dot */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <History size={16} />
                    </div>
                    {/* Content */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-bold text-slate-900 dark:text-white">{event.student} • {event.result}</div>
                        <time className="font-medium text-indigo-500 text-xs">{event.time}</time>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-sm italic">{event.details}</div>
                    </div>
                  </div>
                ))}

              </div>
              <div className="mt-8 text-center">
                <p className="text-xs text-slate-500">
                  Privacy Note: Student identities are anonymized. All data points are verified via automated Zoom/Google Calendar logs.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
