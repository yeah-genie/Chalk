"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Student, StudentInsert, Session, SessionInsert } from "@/lib/types/database";

// ===================================
// STUDENT CRUD ACTIONS
// ===================================

export async function getStudents(): Promise<Student[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("students")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching students (DB):", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching students (System):", e);
        return [];
    }
}

export async function getSubjects() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('kb_subjects')
            .select('id, name')
            .order('name');

        if (error) {
            console.error("Error fetching subjects (DB):", error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error("Error fetching subjects (System):", e);
        return [];
    }
}

export async function getStudent(id: string): Promise<Student | null> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("students")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching student (DB):", error);
            return null;
        }

        return data;
    } catch (e) {
        console.error("Error fetching student (System):", e);
        return null;
    }
}

export async function createStudent(student: StudentInsert) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("students")
            .insert(student)
            .select()
            .single();

        if (error) {
            console.error("Error creating student (DB):", error);
            return { success: false, error: `Student database error: ${error.message}` };
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/students");

        return { success: true, data };
    } catch (e: any) {
        console.error("Error creating student (System):", e);
        return { success: false, error: `Critical system error: ${e.message || 'Unknown error'}` };
    }
}

export async function registerStudentWithSubject(data: {
    name: string;
    subject_id: string;
    custom_subject_name?: string;
    parent_email?: string;
    notes?: string;
}) {
    try {
        const supabase = await createServerSupabaseClient();

        // Try to get authenticated user (optional)
        const { data: { user } } = await supabase.auth.getUser();
        const tutorId = user?.id || null;

        console.log(`[Register] Creating student. Tutor ID: ${tutorId || 'null (anonymous)'}`);

        let finalSubjectId = data.subject_id;

        // 1. Handle Custom Subject (skip if errors)
        if (data.subject_id === 'custom' && data.custom_subject_name) {
            console.log(`[Register] Custom subject requested: ${data.custom_subject_name}`);
            finalSubjectId = data.custom_subject_name; // Use the name directly
        }

        // 2. Create Student - tutor_id is NOT NULL per schema
        if (!tutorId) {
            console.error("[Register] Error: tutorId is missing. User must be logged in.");
            return {
                success: false,
                error: "Authentication required: Please sign in again to register a student."
            };
        }

        const { data: studentData, error: studentError } = await supabase
            .from("students")
            .insert({
                name: data.name,
                subject_id: finalSubjectId,
                parent_email: data.parent_email || null,
                notes: data.notes || null,
                tutor_id: tutorId
            })
            .select()
            .single();

        if (studentError) {
            console.error("[Register] Error creating student (DB):", studentError);
            return { success: false, error: `Database error: ${studentError.message}` };
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/students");

        return { success: true, data: studentData };
    } catch (e: any) {
        console.error("[Register] Error creating student (System):", e);
        return { success: false, error: `Critical system error: ${e.message || 'Unknown error'}` };
    }
}



export async function updateStudent(id: string, updates: Partial<StudentInsert>): Promise<boolean> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id);

    if (error) {
        console.error("Error updating student:", error);
        return false;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/students");

    return true;
}

export async function deleteStudent(id: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting student:", error);
        return false;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/students");

    return true;
}

// ===================================
// SESSION CRUD ACTIONS
// ===================================

export async function getSessions(studentId?: string): Promise<Session[]> {
    try {
        const supabase = await createServerSupabaseClient();

        let query = supabase
            .from("sessions")
            .select("*")
            .order("scheduled_at", { ascending: false });

        if (studentId) {
            query = query.eq("student_id", studentId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching sessions (DB):", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching sessions (System):", e);
        return [];
    }
}

export async function getSession(id: string): Promise<Session | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching session:", error);
        return null;
    }

    return data;
}

export async function createSession(session: SessionInsert): Promise<Session | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("sessions")
        .insert(session)
        .select()
        .single();

    if (error) {
        console.error("Error creating session:", error);
        return null;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/sessions");

    return data;
}

export async function updateSession(id: string, updates: Partial<SessionInsert>): Promise<boolean> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("sessions")
        .update(updates)
        .eq("id", id);

    if (error) {
        console.error("Error updating session:", error);
        return false;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/sessions");

    return true;
}

export async function completeSession(id: string, transcript?: string): Promise<boolean> {
    return updateSession(id, {
        status: "completed",
        transcript,
    });
}

// ===================================
// MASTERY & INSIGHT ACTIONS
// ===================================

export async function getStudentMastery(studentId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("student_mastery")
            .select("topic_id, score, status")
            .eq("student_id", studentId);

        if (error) {
            console.error("Error fetching student mastery (DB):", error);
            return [];
        }

        // Map database topic_id to the UI's topicId
        return (data || []).map(m => ({
            topicId: m.topic_id,
            level: m.score
        }));
    } catch (e) {
        console.error("Error fetching student mastery (System):", e);
        return [];
    }
}

export async function getStudentAverageMastery(studentId: string): Promise<number> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("student_mastery")
            .select("score")
            .eq("student_id", studentId);

        if (error || !data || data.length === 0) {
            return 0;
        }

        const total = data.reduce((sum, m) => sum + (m.score || 0), 0);
        return Math.round(total / data.length);
    } catch (e) {
        console.error("Error calculating average mastery:", e);
        return 0;
    }
}

export async function getAllStudentsMasteryMap(): Promise<Map<string, number>> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("student_mastery")
            .select("student_id, score");

        if (error || !data) {
            return new Map();
        }

        // Group by student and calculate averages
        const studentScores = new Map<string, number[]>();
        for (const m of data) {
            const scores = studentScores.get(m.student_id) || [];
            scores.push(m.score || 0);
            studentScores.set(m.student_id, scores);
        }

        const result = new Map<string, number>();
        for (const [studentId, scores] of studentScores) {
            const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            result.set(studentId, avg);
        }

        return result;
    } catch (e) {
        console.error("Error fetching all students mastery map:", e);
        return new Map();
    }
}

export async function getTopicInsights(studentId: string, topicId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        // Fetch the latest completed session that covers this topic
        const { data, error } = await supabase
            .from("session_topics")
            .select(`
                evidence,
                future_impact,
                status_after,
                sessions!inner(
                    notes,
                    transcript,
                    scheduled_at
                )
            `)
            .eq("sessions.student_id", studentId)
            .eq("topic_id", topicId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error("Error fetching topic insights (DB):", error);
            return null;
        }

        return {
            text: (Array.isArray(data.sessions) ? data.sessions[0]?.notes : (data.sessions as any)?.notes) || "No recent AI narrative available for this topic.",
            nextSteps: [
                "Review session evidence below",
                "Focus on identified struggle points",
                "Next scheduled session follow-up"
            ],
            evidence: data.evidence ? [data.evidence] : [],
            futureImpact: data.future_impact
        };
    } catch (e) {
        console.error("Error fetching topic insights (System):", e);
        return null;
    }
}
