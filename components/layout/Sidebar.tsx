'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, TrendingUp, Settings } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Students', href: '/dashboard/students', icon: Users },
        { name: 'Insights', href: '/dashboard/analysis', icon: TrendingUp },
        { name: 'Sessions', href: '/dashboard/sessions', icon: Calendar },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0f0f12] border-r border-[#27272a] p-4 flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <Image src="/logo.png" alt="Chalk" width={32} height={32} className="rounded-lg" />
                <span className="font-semibold text-lg tracking-tight">Chalk</span>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-[#18181b] text-[#10b981] shadow-sm ring-1 ring-[#10b981]/20'
                                : 'text-[#a1a1aa] hover:text-[#10b981] hover:bg-[#18181b]/50'
                                }`}
                        >
                            <Icon size={18} className={isActive ? 'text-[#10b981]' : 'group-hover:text-[#10b981] transition-colors'} />
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: Settings */}
            <div className="mt-auto">
                <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${pathname === '/dashboard/settings'
                        ? 'bg-[#18181b] text-[#10b981] shadow-sm ring-1 ring-[#10b981]/20'
                        : 'text-[#a1a1aa] hover:text-[#10b981] hover:bg-[#18181b]/50'
                        }`}
                >
                    <Settings size={18} className={pathname === '/dashboard/settings' ? 'text-[#10b981]' : 'group-hover:text-[#10b981] transition-colors'} />
                    <span className="text-sm font-medium">Settings</span>
                </Link>
            </div>
        </aside>
    );
}
