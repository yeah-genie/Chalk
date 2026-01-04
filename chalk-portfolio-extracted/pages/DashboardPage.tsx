
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Clock, 
  Video, 
  Users, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { CHART_DATA, MOCK_SESSIONS } from '../constants';

const StatCard: React.FC<{
  label: string;
  value: string;
  change: string;
  isUp: boolean;
  icon: any;
}> = ({ label, value, change, isUp, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
        <Icon size={20} />
      </div>
      <div className={`flex items-center text-xs font-semibold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
        {change}
      </div>
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
  </div>
);

export const DashboardPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Good morning, Alex</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what happened with your tutoring business this week.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Lesson Hours" 
            value="142.5" 
            change="12.5%" 
            isUp={true} 
            icon={Clock} 
          />
          <StatCard 
            label="Sessions This Month" 
            value="38" 
            change="5.2%" 
            isUp={true} 
            icon={Video} 
          />
          <StatCard 
            label="Active Students" 
            value="12" 
            change="2 students" 
            isUp={true} 
            icon={Users} 
          />
          <StatCard 
            label="Avg. Response Time" 
            value="14m" 
            change="3m" 
            isUp={false} 
            icon={Zap} 
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-slate-900 dark:text-white">Weekly Teaching Load</h2>
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium px-3 py-1.5 focus:ring-2 focus:ring-indigo-500">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {CHART_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.hours > 7 ? '#4f46e5' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 dark:text-white">Recent Sessions</h2>
              <button className="text-sm text-indigo-600 font-medium hover:underline">See All</button>
            </div>
            <div className="space-y-6">
              {MOCK_SESSIONS.map((session) => (
                <div key={session.id} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center shrink-0">
                    <Video size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{session.studentName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{session.topic}</p>
                    <p className="text-xs text-indigo-600 font-medium mt-1">{session.duration} mins • {session.date}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              + Log Manual Session
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
