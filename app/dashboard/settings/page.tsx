import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";

export default async function SettingsPage() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[SettingsPage] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="ml-64 p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-[#71717a] mt-2">Manage your account and platform preferences.</p>
                    </header>

                    <div className="grid gap-6">
                        {/* Profile Section */}
                        <section className="p-6 rounded-2xl bg-[#18181b] border border-[#27272a]">
                            <h2 className="text-xl font-semibold mb-4">Profile</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#71717a] mb-1.5">Display Name</label>
                                    <div className="px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white">
                                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Tutor'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#71717a] mb-1.5">Email Address</label>
                                    <div className="px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white">
                                        {user.email || 'Not available'}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Integration Section */}
                        <section className="p-6 rounded-2xl bg-[#18181b] border border-[#27272a]">
                            <h2 className="text-xl font-semibold mb-4">Integrations</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-[#71717a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Google Calendar</p>
                                            <p className="text-xs text-[#71717a]">Sync sessions automatically</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1.5 bg-[#27272a] rounded-lg text-xs font-medium text-[#71717a]">
                                        Coming Soon
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-[#71717a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium">Speech-to-Text</p>
                                            <p className="text-xs text-[#71717a]">Auto-transcribe session recordings</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1.5 bg-[#27272a] rounded-lg text-xs font-medium text-[#71717a]">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="p-6 rounded-2xl bg-[#18181b] border border-red-900/30">
                            <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
                            <p className="text-sm text-[#71717a] mb-4">
                                These actions are irreversible. Please proceed with caution.
                            </p>
                            <button
                                disabled
                                className="px-4 py-2 bg-red-900/20 border border-red-900/50 rounded-lg text-sm text-red-400 opacity-50 cursor-not-allowed"
                            >
                                Delete Account (Coming Soon)
                            </button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
