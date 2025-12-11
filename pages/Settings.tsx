import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell, User, LogOut, Settings as SettingsIcon, Globe, Palette, Download, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

type SettingsSection = 'account' | 'integrations' | 'appearance';

const Settings: React.FC = () => {
    const { currentUser, ideas } = useAppContext();
    const [activeSection, setActiveSection] = useState<SettingsSection>('account');
    const [emailNotif, setEmailNotif] = useState(currentUser?.notification_email ?? true);
    const [slackNotif, setSlackNotif] = useState(false);
    const [darkMode] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [slackConnected, setSlackConnected] = useState(!!localStorage.getItem('cryo_slack_connected'));

    const handleSignOut = async () => {
        localStorage.removeItem('cryo_onboarding_completed');
        localStorage.removeItem('cryo_slack_connected');
        await supabase.auth.signOut();
        toast.success('Signed out');
        window.location.href = '/';
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSaving(false);
        setHasUnsavedChanges(false);
        toast.success('Settings saved!');
    };

    const handleExportCSV = () => {
        const csvContent = [
            ['Title', 'Description', 'Status', 'Priority', 'Category', 'Created At'].join(','),
            ...ideas.map(idea => [
                `"${idea.title.replace(/"/g, '""')}"`,
                `"${(idea.description || '').replace(/"/g, '""')}"`,
                idea.status,
                idea.priority,
                idea.category,
                idea.created_at
            ].join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cryo-ideas-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Exported to CSV!');
    };

    const menuItems = [
        { id: 'account' as const, label: 'Account', icon: User },
        { id: 'integrations' as const, label: 'Integrations', icon: Globe },
        { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    ];

    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
        <button onClick={onChange} className="w-10 h-5 rounded-full transition-all relative" style={{ background: enabled ? 'var(--accent)' : 'var(--bg-tertiary)' }}>
            <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm" style={{ left: enabled ? '22px' : '2px' }}></div>
        </button>
    );

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <PageHeader icon={SettingsIcon} title="Settings" description="Manage your account" />
            <div className="flex-1 flex min-h-0 gap-6">
                <div className="w-48 flex-shrink-0">
                    <nav className="space-y-1">
                        {menuItems.map(item => (
                            <button key={item.id} onClick={() => setActiveSection(item.id)}
                                className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all"
                                style={{ background: activeSection === item.id ? 'var(--bg-tertiary)' : 'transparent', color: activeSection === item.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                <item.icon className="w-4 h-4" style={{ color: activeSection === item.id ? 'var(--accent)' : 'var(--text-muted)' }} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                    <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                        <button onClick={handleSignOut} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-all">
                            <LogOut className="w-4 h-4" /> Sign out
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <div className="max-w-xl">
                        {activeSection === 'account' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Account</h2>

                                <div className="glass rounded-xl p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)', color: 'var(--bg-primary)' }}>
                                            {currentUser?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentUser?.name || 'User'}</div>
                                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass rounded-xl p-5">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Bell className="w-4 h-4" /> Notifications</h3>
                                    <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Email notifications</div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Weekly digest</div>
                                        </div>
                                        <Toggle enabled={emailNotif} onChange={() => { setEmailNotif(!emailNotif); setHasUnsavedChanges(true); }} />
                                    </div>
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Slack notifications</div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Wake alerts in Slack</div>
                                        </div>
                                        <Toggle enabled={slackNotif} onChange={() => { setSlackNotif(!slackNotif); setHasUnsavedChanges(true); }} />
                                    </div>
                                    {hasUnsavedChanges && (
                                        <div className="mt-4 pt-4 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                                            <button onClick={handleSaveSettings} disabled={isSaving} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
                                                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="glass rounded-xl p-5">
                                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Download className="w-4 h-4" /> Export</h3>
                                    <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>Download all your ideas as CSV.</p>
                                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                                        <Download className="w-4 h-4" /> Export CSV
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'integrations' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Integrations</h2>

                                <div className="glass rounded-xl p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(224, 30, 90, 0.1)' }}>
                                            <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" /><path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" /><path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" /><path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Slack</div>
                                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Capture ideas with ❄️ emoji</div>
                                        </div>
                                        {slackConnected ? (
                                            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--accent)' }}>Connected</span>
                                        ) : (
                                            <button onClick={() => { setSlackConnected(true); localStorage.setItem('cryo_slack_connected', 'true'); toast.success('Slack connected!'); }} className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>Connect</button>
                                        )}
                                    </div>
                                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>React with ❄️ on any message to freeze it as an idea. The bot will confirm in a thread.</p>
                                    </div>
                                </div>

                                <div className="glass rounded-xl p-5 opacity-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(129, 140, 248, 0.1)' }}>
                                            <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#818CF8" d="M3.184 12.924a.5.5 0 0 1 0-.707l8.633-8.633a.5.5 0 0 1 .707.707L3.89 12.924a.5.5 0 0 1-.707 0z" /></svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Linear</div>
                                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Coming soon</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'appearance' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
                                <div className="glass rounded-xl p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dark mode</div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Always enabled</div>
                                        </div>
                                        <Toggle enabled={darkMode} onChange={() => { }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
