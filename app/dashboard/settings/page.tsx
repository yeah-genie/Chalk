'use client';

import React from 'react';
import Sidebar from "@/components/layout/Sidebar";

export default function SettingsPage() {
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
                                    <div className="px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white/50">
                                        Loading user data...
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#71717a] mb-1.5">Email Address</label>
                                    <div className="px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white/50">
                                        Loading user data...
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
                                            <img src="/logo.png" alt="Google" className="w-6 h-6 grayscale opacity-50" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Google Calendar</p>
                                            <p className="text-xs text-[#71717a]">Sync sessions automatically</p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-white/5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition">
                                        Connect
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
