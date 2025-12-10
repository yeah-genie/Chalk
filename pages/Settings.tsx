import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell, User, Briefcase, Shield, Check, LogOut, Settings as SettingsIcon, Globe, Key, Users, CreditCard, Palette, Link2, X, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import toast from 'react-hot-toast';

type SettingsSection = 'account' | 'workspace' | 'members' | 'integrations' | 'billing' | 'appearance';

interface Integration {
    name: string;
    desc: string;
    connected: boolean;
    icon: string;
    status: string | null;
    oauthUrl: string | null;
    features: string[];
    webhookUrl?: string;
}

const getStoredIntegrations = (): Record<string, { connected: boolean; webhookUrl?: string }> => {
    const stored = localStorage.getItem('cryo_integrations');
    return stored ? JSON.parse(stored) : {};
};

const saveIntegration = (name: string, data: { connected: boolean; webhookUrl?: string }) => {
    const current = getStoredIntegrations();
    current[name] = data;
    localStorage.setItem('cryo_integrations', JSON.stringify(current));
};

const Settings: React.FC = () => {
    const { currentUser, currentWorkspace, simulateSlackIncoming } = useAppContext();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<SettingsSection>('account');
    const [emailNotif, setEmailNotif] = useState(currentUser?.notification_email ?? true);
    const [slackNotif, setSlackNotif] = useState(false);
    const [testMessage, setTestMessage] = useState('');
    const [darkMode] = useState(true);
    const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || 'My Workspace');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [storedIntegrations, setStoredIntegrations] = useState(getStoredIntegrations());
    const [showWebhookModal, setShowWebhookModal] = useState<string | null>(null);
    const [webhookInput, setWebhookInput] = useState('');

    const handleSlackTest = () => {
        if (!testMessage) return;
        simulateSlackIncoming();
        setTestMessage('');
    };

    const handleSignOut = async () => {
        localStorage.removeItem('cryo_onboarding_completed');
        localStorage.removeItem('cryo_pending_ideas');
        localStorage.removeItem('cryo_integrations');
        localStorage.removeItem('cryo_demo_ideas');
        localStorage.removeItem('cryo_demo_decisions');
        localStorage.removeItem('cryo_demo_wiki');
        localStorage.removeItem('cryo_demo_activities');
        localStorage.removeItem('cryo_demo_metrics');
        await supabase.auth.signOut();
        toast.success('Signed out successfully');
        window.location.href = '/';
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSaving(false);
        setHasUnsavedChanges(false);
        toast.success('Settings saved successfully!');
    };

    const handleEmailNotifChange = () => { setEmailNotif(!emailNotif); setHasUnsavedChanges(true); };
    const handleSlackNotifChange = () => { setSlackNotif(!slackNotif); setHasUnsavedChanges(true); };
    const handleWorkspaceNameChange = (value: string) => { setWorkspaceName(value); setHasUnsavedChanges(true); };

    const handleConnect = (integrationName: string) => {
        // Open Nango Connect UI for OAuth
        const nangoIntegrationId = integrationName.toLowerCase();
        const connectionId = `user_${Date.now()}`; // Unique connection ID
        const nangoConnectUrl = `https://api.nango.dev/oauth/connect/${nangoIntegrationId}?connection_id=${connectionId}`;
        window.open(nangoConnectUrl, '_blank', 'width=600,height=700');
        toast.success(`Connecting to ${integrationName}...`);
    };

    const handleDisconnect = (integrationName: string) => {
        saveIntegration(integrationName, { connected: false, webhookUrl: undefined });
        setStoredIntegrations(getStoredIntegrations());
        toast.success(`${integrationName} disconnected`);
    };

    const getIntegrationConfig = (name: string) => {
        const configs: Record<string, { placeholder: string; prefix: string; label: string }> = {
            'Slack': { placeholder: 'https://hooks.slack.com/services/...', prefix: 'https://hooks.slack.com/', label: 'Webhook URL' },
            'Linear': { placeholder: 'lin_api_...', prefix: 'lin_api_', label: 'API Key' },
            'Notion': { placeholder: 'secret_...', prefix: 'secret_', label: 'Integration Token' },
            'Google Analytics': { placeholder: 'G-XXXXXXXXXX', prefix: 'G-', label: 'Measurement ID' }
        };
        return configs[name] || { placeholder: '', prefix: '', label: 'API Key' };
    };

    const handleSaveIntegration = () => {
        const config = getIntegrationConfig(showWebhookModal || '');
        if (!webhookInput.trim()) { toast.error(`Please enter ${config.label}`); return; }
        if (!webhookInput.startsWith(config.prefix)) { toast.error(`Invalid ${config.label} format`); return; }
        saveIntegration(showWebhookModal!, { connected: true, webhookUrl: webhookInput });
        setStoredIntegrations(getStoredIntegrations());
        setShowWebhookModal(null);
        toast.success(`${showWebhookModal} connected!`);
    };

    const menuItems = [
        { id: 'account' as const, label: 'My Account', icon: User },
        { id: 'workspace' as const, label: 'Workspace', icon: Briefcase },
        { id: 'members' as const, label: 'Members', icon: Users },
        { id: 'integrations' as const, label: 'Integrations', icon: Globe },
        { id: 'billing' as const, label: 'Billing', icon: CreditCard },
        { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    ];

    const integrationLogos: Record<string, React.ReactNode> = {
        'Slack': <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" /><path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" /><path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" /><path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" /></svg>,
        'Linear': <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#818CF8" d="M3.184 12.924a.5.5 0 0 1 0-.707l8.633-8.633a.5.5 0 0 1 .707.707L3.89 12.924a.5.5 0 0 1-.707 0zm.354 2.475a.5.5 0 0 1 0-.707l10.96-10.96a.5.5 0 1 1 .708.707L4.245 15.399a.5.5 0 0 1-.707 0zm.707 2.829a.5.5 0 0 1 0-.707l12.728-12.728a.5.5 0 1 1 .707.707L4.952 18.228a.5.5 0 0 1-.707 0zm2.122 2.121a.5.5 0 0 1 0-.707l12.02-12.02a.5.5 0 1 1 .708.707l-12.02 12.02a.5.5 0 0 1-.708 0zm2.828 1.768a.5.5 0 0 1 0-.708l9.9-9.9a.5.5 0 0 1 .706.708l-9.9 9.9a.5.5 0 0 1-.706 0zm3.182 1.414a.5.5 0 0 1 0-.707l7.07-7.071a.5.5 0 1 1 .708.707l-7.07 7.071a.5.5 0 0 1-.708 0zm3.535 1.061a.5.5 0 0 1 0-.707l3.889-3.889a.5.5 0 1 1 .707.707l-3.89 3.89a.5.5 0 0 1-.706 0z" /></svg>,
        'Notion': <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#FFFFFF" d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.84-.046.933-.56.933-1.167V6.354c0-.606-.233-.933-.746-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.7c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.746 0-.933-.234-1.493-.933l-4.577-7.186v6.952l1.449.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.746-.933zM2.778 1.268l13.588-.934c1.68-.14 2.1-.046 3.149.7l4.343 3.033c.7.513.933.653.933 1.212v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.895c0-.84.374-1.54 1.009-1.627z" /></svg>,
        'Google Analytics': <svg viewBox="0 0 24 24" className="w-6 h-6"><path fill="#F9AB00" d="M22.84 2.998v17.998a2.005 2.005 0 0 1-4.01 0V2.998a2.005 2.005 0 1 1 4.01 0z" /><path fill="#E37400" d="M14.02 7.998v13a2 2 0 0 1-4 0v-13a2 2 0 1 1 4 0z" /><path fill="#F9AB00" d="M5.17 14.998v6a2 2 0 1 1-4 0v-6a2 2 0 1 1 4 0z" /></svg>
    };

    const integrations: Integration[] = [
        { name: 'Slack', desc: 'Capture ideas from channels', connected: storedIntegrations['Slack']?.connected || false, icon: '', status: storedIntegrations['Slack']?.connected ? 'Connected' : null, oauthUrl: null, features: ['Auto-capture from #ideas', 'DM @cryo to freeze', 'Wake notifications'] },
        { name: 'Linear', desc: 'Push ideas to projects', connected: storedIntegrations['Linear']?.connected || false, icon: '', status: storedIntegrations['Linear']?.connected ? 'Connected' : null, oauthUrl: null, features: ['Create issues', 'Sync status', 'Link decisions'] },
        { name: 'Notion', desc: 'Sync with databases', connected: storedIntegrations['Notion']?.connected || false, icon: '', status: storedIntegrations['Notion']?.connected ? 'Connected' : null, oauthUrl: null, features: ['Import databases', 'Export history', 'Wiki sync'] },
        { name: 'Google Analytics', desc: 'Metric triggers', connected: storedIntegrations['Google Analytics']?.connected || false, icon: '', status: storedIntegrations['Google Analytics']?.connected ? 'Connected' : null, oauthUrl: null, features: ['DAU/MAU triggers', 'Conversion alerts', 'Real-time metrics'] },
    ];

    const SettingRow = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
        <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</div>
                {description && <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</div>}
            </div>
            {children}
        </div>
    );

    const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
        <button onClick={onChange} className="w-10 h-5 rounded-full transition-all relative" style={{ background: enabled ? 'var(--accent)' : 'var(--bg-tertiary)' }}>
            <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm" style={{ left: enabled ? '22px' : '2px' }}></div>
        </button>
    );

    return (
        <div className="h-full flex flex-col gap-4 overflow-hidden">
            <PageHeader icon={SettingsIcon} title="Settings" description="Manage your account and workspace" />
            <div className="flex-1 flex min-h-0 gap-6">
                <div className="w-56 flex-shrink-0">
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
                    <div className="max-w-2xl">
                        {activeSection === 'account' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>My Account</h2>
                                <div className="glass rounded-xl p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)', color: 'var(--bg-primary)' }}>
                                            {currentUser?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentUser?.name || 'User'}</div>
                                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                                        </div>
                                        <button className="text-sm font-medium px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Edit</button>
                                    </div>
                                </div>
                                <div className="glass rounded-xl p-5">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Bell className="w-4 h-4" /> Notifications</h3>
                                    <SettingRow label="Email notifications" description="Weekly digest and alerts"><Toggle enabled={emailNotif} onChange={handleEmailNotifChange} /></SettingRow>
                                    <SettingRow label="Slack notifications" description="Smart thaw in Slack"><Toggle enabled={slackNotif} onChange={handleSlackNotifChange} /></SettingRow>
                                    {hasUnsavedChanges && (
                                        <div className="mt-4 pt-4 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                                            <button onClick={handleSaveSettings} disabled={isSaving} className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>
                                                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="glass rounded-xl p-5">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Key className="w-4 h-4" /> Security</h3>
                                    <SettingRow label="Password" description="Set via Google OAuth"><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Google SSO</span></SettingRow>
                                </div>
                            </div>
                        )}

                        {activeSection === 'workspace' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Workspace</h2>
                                <div className="glass rounded-xl p-5">
                                    <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)', color: 'var(--bg-primary)' }}>C</div>
                                        <div>
                                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{currentWorkspace?.name || 'My Workspace'}</div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentWorkspace?.member_count || 1} members</div>
                                        </div>
                                    </div>
                                    <SettingRow label="Workspace name">
                                        <input type="text" value={workspaceName} onChange={(e) => handleWorkspaceNameChange(e.target.value)} className="text-sm rounded-lg px-3 py-1.5 outline-none w-48 text-right" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                                    </SettingRow>
                                    {hasUnsavedChanges && (
                                        <div className="mt-4 pt-4 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                                            <button onClick={handleSaveSettings} disabled={isSaving} className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                                        </div>
                                    )}
                                </div>
                                <div className="glass rounded-xl p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                            <div>
                                                <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Pro Plan</div>
                                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Unlimited ideas</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'members' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Members</h2>
                                    <button className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>Invite</button>
                                </div>
                                <div className="glass rounded-xl overflow-hidden">
                                    <div className="p-4 flex items-center gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)', color: 'var(--bg-primary)' }}>{currentUser?.name?.charAt(0) || 'U'}</div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                                        </div>
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Owner</span>
                                    </div>
                                    <div className="p-6 text-center">
                                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: 'var(--text-muted)' }} />
                                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Invite your team to collaborate</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'integrations' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Integrations</h2>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Connect your tools to Cryo</p>
                                </div>
                                <div className="space-y-3">
                                    {integrations.map(item => (
                                        <div key={item.name} className="glass rounded-xl overflow-hidden">
                                            <div className="p-4 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>{integrationLogos[item.name]}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                                                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                                                </div>
                                                {item.connected ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Check className="w-3 h-3" /> {item.status}</span>
                                                        <button onClick={() => handleDisconnect(item.name)} className="text-xs px-2 py-1 rounded-lg font-medium transition-all hover:bg-red-500/20" style={{ color: 'var(--text-muted)' }}>Disconnect</button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => handleConnect(item.name)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>Connect</button>
                                                )}
                                            </div>
                                            <div className="px-4 py-3" style={{ background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border)' }}>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.features.map((feature, i) => (<span key={i} className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>{feature}</span>))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="glass rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>Dev Tool</span>
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Slack Bot Simulator</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Type a mock message..." className="flex-1 text-sm rounded-lg px-3 py-2 outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} value={testMessage} onChange={e => setTestMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSlackTest()} />
                                        <button onClick={handleSlackTest} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>Send</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'billing' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Billing</h2>
                                <div className="glass rounded-xl p-5">
                                    <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Current Plan</div>
                                            <div className="text-2xl font-bold mt-1" style={{ color: 'var(--accent)' }}>Pro</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>$12</div>
                                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>per user/month</div>
                                        </div>
                                    </div>
                                    <div className="pt-4 grid grid-cols-3 gap-4 text-center">
                                        <div><div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>∞</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Ideas</div></div>
                                        <div><div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>5</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Integrations</div></div>
                                        <div><div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>10</div><div className="text-xs" style={{ color: 'var(--text-muted)' }}>Members</div></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'appearance' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
                                <div className="glass rounded-xl p-5">
                                    <SettingRow label="Dark mode" description="Use dark theme"><Toggle enabled={darkMode} onChange={() => { }} /></SettingRow>
                                    <SettingRow label="Accent color" description="Primary UI color">
                                        <div className="flex gap-2">{['#22d3ee', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'].map(color => (<button key={color} className="w-6 h-6 rounded-full" style={{ background: color, border: color === '#22d3ee' ? '2px solid white' : 'none' }} />))}</div>
                                    </SettingRow>
                                    <SettingRow label="Compact mode" description="Reduce spacing"><Toggle enabled={false} onChange={() => { }} /></SettingRow>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showWebhookModal && (() => {
                const config = getIntegrationConfig(showWebhookModal);
                const helpTexts: Record<string, string> = { 'Slack': 'Get your webhook URL from Slack App settings', 'Linear': 'Get your API key from Linear Settings', 'Notion': 'Get your integration token from notion.so/my-integrations', 'Google Analytics': 'Get your Measurement ID from GA4' };
                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }}>
                        <div className="relative w-full max-w-md mx-4 rounded-2xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <button onClick={() => setShowWebhookModal(null)} className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 flex items-center justify-center">{integrationLogos[showWebhookModal]}</div>
                                <div>
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Connect {showWebhookModal}</h3>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Enter your {config.label}</p>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>{config.label}</label>
                                <input type="text" value={webhookInput} onChange={(e) => setWebhookInput(e.target.value)} placeholder={config.placeholder} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{helpTexts[showWebhookModal]}</p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setShowWebhookModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Cancel</button>
                                <button onClick={handleSaveIntegration} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--accent)', color: 'var(--bg-primary)' }}>Save & Connect</button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default Settings;
