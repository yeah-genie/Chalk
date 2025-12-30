import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    // Get lesson data
    const { data: lesson } = await supabase
        .from('logs')
        .select('*, students(name), profiles:user_id(name)')
        .eq('id', id)
        .single();

    if (!lesson) {
        notFound();
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const tutorName = (lesson.profiles as { name: string } | null)?.name || 'Tutor';
    const studentName = lesson.students?.name;

    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            {/* Header */}
            <header className="px-5 pt-12 pb-6 text-center border-b border-zinc-800/50">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-xl font-semibold text-white mb-1">Lesson Report</h1>
                <p className="text-sm text-zinc-500">{tutorName}</p>
            </header>

            <main className="max-w-lg mx-auto px-5 py-6">
                {/* Student & Date */}
                <div className="mb-6">
                    {studentName && (
                        <p className="text-lg font-medium text-white mb-1">{studentName}</p>
                    )}
                    <p className="text-sm text-zinc-500">{formatDate(lesson.lesson_date)}</p>
                </div>

                {/* AI Summary - Main content */}
                {lesson.ai_summary && (
                    <div className="mb-6 p-5 rounded-xl bg-emerald-600/10 border border-emerald-600/20">
                        <p className="text-xs text-emerald-400 font-medium mb-3">What we covered</p>
                        <p className="text-[15px] text-white leading-relaxed">{lesson.ai_summary}</p>
                    </div>
                )}

                {/* Details */}
                <div className="space-y-4">
                    {lesson.problem_detail && (
                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-2">Topics</p>
                            <p className="text-sm text-zinc-300">{lesson.problem_detail}</p>
                        </div>
                    )}

                    {lesson.diagnosis_detail && (
                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-2">Observations</p>
                            <p className="text-sm text-zinc-300">{lesson.diagnosis_detail}</p>
                        </div>
                    )}

                    {lesson.solution_detail && (
                        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-2">Next Steps</p>
                            <p className="text-sm text-zinc-300">{lesson.solution_detail}</p>
                        </div>
                    )}
                </div>

                {/* Duration */}
                {lesson.duration_minutes && (
                    <p className="text-xs text-zinc-600 mt-6 text-center">
                        Lesson duration: {lesson.duration_minutes} minutes
                    </p>
                )}

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-zinc-800/50 text-center">
                    <p className="text-xs text-zinc-600">
                        Powered by <span className="text-zinc-500">Chalk</span>
                    </p>
                </div>
            </main>
        </div>
    );
}
