import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
    getStudents,
    getStudentMastery,
    getSessions
} from '@/lib/actions/crud';
import { fetchSubjectData } from "@/lib/knowledge-graph-server";
import StudentDetailClient from './StudentDetailClient';
import Sidebar from '@/components/layout/Sidebar';
import { getStudentPredictions } from '@/lib/services/prediction';

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 1. Fetch Student Info
    const students = await getStudents();
    const student = students.find(s => s.id === id);

    if (!student) {
        return (
            <div className="flex h-screen bg-[#09090b] text-white">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center p-8 ml-64">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold">Student Not Found</h1>
                        <p className="text-[#71717a]">The student you are looking for does not exist or has been removed.</p>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Fetch Relevant Data
    const initialMastery = await getStudentMastery(id);
    const subject = await fetchSubjectData(student.subject_id);
    const sessions = await getSessions();
    const studentSessions = sessions.filter(s => s.student_id === id);

    // 3. Fetch Prediction Data via unified service
    const predictions = await getStudentPredictions(id, student.subject_id);

    if (!subject) {
        return (
            <div className="flex h-screen bg-[#09090b] text-white">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center p-8 ml-64">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold">Subject Data Missing</h1>
                        <p className="text-[#71717a]">Curriculum data for "{student.subject_id}" is not available.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <StudentDetailClient
            student={student}
            initialMastery={initialMastery}
            subject={subject}
            sessions={studentSessions}
            predictions={predictions}
        />
    );
}
