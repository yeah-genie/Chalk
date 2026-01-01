import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStudents, getSessions, getAllStudentsMasteryMap } from "@/lib/actions/crud";
import { AP_CALCULUS_AB, getUnits, getTopicsByUnit } from "@/lib/knowledge-graph";
import Sidebar from "@/components/layout/Sidebar";
import VoiceRecorder from "@/components/monitoring/VoiceRecorder";
import { TaxonomyProposalBanner } from "@/components/dashboard/TaxonomyProposalBanner";

// ===================================
// CHALK DASHBOARD (Server Component)
// ===================================

function getScoreColor(score: number): string {
    if (score >= 80) return "bg-[#22c55e]";
    if (score >= 60) return "bg-[#10b981]";
    if (score >= 40) return "bg-[#f59e0b]";
    if (score >= 20) return "bg-[#ef4444]";
    return "bg-[#3f3f46]";
}

function getScoreTextColor(score: number): string {
    if (score >= 80) return "text-[#22c55e]";
    if (score >= 60) return "text-[#10b981]";
    if (score >= 40) return "text-[#f59e0b]";
    if (score >= 20) return "text-[#ef4444]";
    return "text-[#71717a]";
}

export default async function Dashboard() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[Dashboard] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    // Fetch data
    const students = await getStudents();
    const sessions = await getSessions();
    const masteryMap = await getAllStudentsMasteryMap();

    const calcUnits = students.length > 0 ? getUnits(AP_CALCULUS_AB) : []; // Default or placeholder
    const firstStudentSubject = students.length > 0 ? students[0].subject_id : "No Subject";

    // Calculate stats
    const totalStudents = students.length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;

    // Calculate real average mastery across all students
    let avgMastery = 0;
    if (students.length > 0) {
        const masteries = students.map(s => masteryMap.get(s.id) || 0);
        avgMastery = Math.round(masteries.reduce((a, b) => a + b, 0) / students.length);
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            {/* Main Content */}
            <main className="ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-[#71717a] text-sm">Track student progress and session analytics at a glance</p>
                    </div>
                    <button className="px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Session
                    </button>
                </div>

                <TaxonomyProposalBanner />

                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
                        <p className="text-[#71717a] text-sm mb-1">Total Students</p>
                        <p className="text-2xl font-bold">{totalStudents}</p>
                    </div>
                    <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
                        <p className="text-[#71717a] text-sm mb-1">Completed Sessions</p>
                        <p className="text-2xl font-bold">{completedSessions}</p>
                    </div>
                    <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
                        <p className="text-[#71717a] text-sm mb-1">Avg. Mastery</p>
                        <p className={`text-2xl font-bold ${getScoreTextColor(avgMastery)}`}>{avgMastery}%</p>
                    </div>
                    <div className="p-5 rounded-xl bg-[#18181b] border border-[#27272a]">
                        <p className="text-[#71717a] text-sm mb-1">Activity</p>
                        <p className="text-2xl font-bold">{sessions.length}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Students List */}
                    <div className="col-span-2">
                        <div className="rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
                            <div className="px-5 py-4 border-b border-[#27272a] flex items-center justify-between">
                                <h2 className="font-semibold">Recent Students</h2>
                                <Link href="/dashboard/students" className="text-sm text-[#10b981]">View All</Link>
                            </div>
                            <div className="divide-y divide-[#27272a]">
                                {students.slice(0, 5).map((student) => {
                                    const studentMastery = masteryMap.get(student.id) || 0;
                                    return (
                                        <Link
                                            key={student.id}
                                            href={`/dashboard/students/${student.id}`}
                                            className="flex items-center justify-between p-5 hover:bg-[#1f1f23] transition"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#27272a] rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium">{student.name[0]}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{student.name}</p>
                                                    <p className="text-sm text-[#71717a]">{student.subject_id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className={`font-semibold ${getScoreTextColor(studentMastery)}`}>{studentMastery}%</p>
                                                </div>
                                                <svg className="w-5 h-5 text-[#3f3f46]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Link>
                                    );
                                })}
                                {students.length === 0 && (
                                    <div className="p-10 text-center text-[#71717a]">
                                        No students yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Session Recorder (New) */}
                    <div className="col-span-1 space-y-6">
                        <div className="rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
                            <div className="px-5 py-4 border-b border-[#27272a]">
                                <h2 className="font-semibold">Quick Session Capture</h2>
                                <p className="text-xs text-[#71717a] mt-1">Record audio to update mastery matrix</p>
                            </div>
                            <div className="p-2">
                                {students.length > 0 ? (
                                    <VoiceRecorder
                                        className="border-none bg-transparent shadow-none"
                                        studentId={students[0].id}
                                        subjectId={students[0].subject_id}
                                    />
                                ) : (
                                    <div className="p-6 text-center text-xs text-[#71717a] italic">
                                        Add a student to enable session recording
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mastery Overview (Dynamic) */}
                        <div className="rounded-xl bg-[#18181b] border border-[#27272a]">
                            <div className="px-5 py-4 border-b border-[#27272a]">
                                <h2 className="font-semibold">Student Progress</h2>
                                <p className="text-xs text-[#71717a] mt-1">
                                    {students.length > 0 ? `${students[0].name} - ${students[0].subject_id}` : "Select a student to view progress"}
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                {calcUnits.length > 0 ? (
                                    calcUnits.slice(0, 5).map((unit) => {
                                        const score = 0; // Placeholder for real mastery
                                        const topics = getTopicsByUnit(AP_CALCULUS_AB, unit.id);

                                        return (
                                            <div key={unit.id} className="group cursor-default">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm truncate pr-2 group-hover:text-white transition-colors">{unit.name}</span>
                                                    <span className={`text-xs font-semibold ${getScoreTextColor(score)}`}>{score}%</span>
                                                </div>
                                                <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getScoreColor(score)} transition-all duration-500`}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-[#52525b] mt-1 font-bold uppercase tracking-widest">{topics.length} topics</p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-10 text-center text-[#71717a] text-sm italic">
                                        Add students to see their curriculum progress here.
                                    </div>
                                )}
                            </div>
                            {students.length > 0 && (
                                <div className="px-5 py-4 border-t border-[#27272a]">
                                    <Link
                                        href="/dashboard/analysis"
                                        className="text-[10px] font-black text-[#10b981] uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1.5"
                                    >
                                        Full Analysis Matrix
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

