"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SharedCurriculum, CurriculumData } from "@/lib/types/database";

// ===================================
// CURRICULUM EXPORT/IMPORT
// ===================================

/**
 * 현재 사용자의 커리큘럼을 JSON으로 export
 */
export async function exportCurriculum(subjectId: string): Promise<{
    success: boolean;
    data?: CurriculumData;
    error?: string;
}> {
    try {
        const supabase = await createServerSupabaseClient();

        // 과목 정보 조회
        const { data: subject, error: subjectError } = await supabase
            .from('kb_subjects')
            .select('id, name')
            .eq('id', subjectId)
            .single();

        if (subjectError || !subject) {
            return { success: false, error: "Subject not found" };
        }

        // 모듈 조회
        const { data: modules } = await supabase
            .from('kb_modules')
            .select('id, name, order_index')
            .eq('subject_id', subjectId)
            .order('order_index');

        if (!modules || modules.length === 0) {
            return { success: false, error: "No modules found for this subject" };
        }

        // 유닛 조회
        const { data: units } = await supabase
            .from('kb_units')
            .select('id, module_id, name, weight, order_index')
            .in('module_id', modules.map(m => m.id))
            .order('order_index');

        // 토픽 조회
        const { data: topics } = await supabase
            .from('kb_topics')
            .select('id, unit_id, name, description, order_index, dependencies')
            .in('unit_id', (units || []).map(u => u.id))
            .order('order_index');

        // 데이터 구조화
        const curriculumData: CurriculumData = {
            modules: (modules || []).map(mod => ({
                id: mod.id,
                name: mod.name,
                order_index: mod.order_index,
                units: (units || [])
                    .filter(u => u.module_id === mod.id)
                    .map(unit => ({
                        id: unit.id,
                        name: unit.name,
                        order_index: unit.order_index,
                        weight: unit.weight,
                        topics: (topics || [])
                            .filter(t => t.unit_id === unit.id)
                            .map(topic => ({
                                id: topic.id,
                                name: topic.name,
                                description: topic.description,
                                order_index: topic.order_index,
                                dependencies: topic.dependencies,
                            })),
                    })),
            })),
            metadata: {
                version: "1.0",
                author: subject.name,
                source: "Chalk Export",
            },
        };

        return { success: true, data: curriculumData };
    } catch (err: any) {
        console.error("[Curriculum Export] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * JSON에서 커리큘럼 import
 */
export async function importCurriculum(
    data: CurriculumData,
    subjectName: string,
    boardId?: string
): Promise<{ success: boolean; subjectId?: string; error?: string }> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        // 새 과목 생성
        const { data: subject, error: subjectError } = await supabase
            .from('kb_subjects')
            .insert({
                name: subjectName,
                board_id: boardId || 'custom',
                icon: '📚',
            })
            .select()
            .single();

        if (subjectError) throw subjectError;

        // ID 매핑 (원본 ID -> 새 ID)
        const moduleIdMap = new Map<string, string>();
        const unitIdMap = new Map<string, string>();

        // 모듈 생성
        for (const mod of data.modules) {
            const { data: newModule } = await supabase
                .from('kb_modules')
                .insert({
                    subject_id: subject.id,
                    name: mod.name,
                    order_index: mod.order_index,
                })
                .select()
                .single();

            if (newModule) {
                moduleIdMap.set(mod.id, newModule.id);

                // 유닛 생성
                for (const unit of mod.units) {
                    const { data: newUnit } = await supabase
                        .from('kb_units')
                        .insert({
                            module_id: newModule.id,
                            name: unit.name,
                            weight: unit.weight || 1,
                            order_index: unit.order_index,
                        })
                        .select()
                        .single();

                    if (newUnit) {
                        unitIdMap.set(unit.id, newUnit.id);

                        // 토픽 생성
                        for (const topic of unit.topics) {
                            await supabase.from('kb_topics').insert({
                                unit_id: newUnit.id,
                                name: topic.name,
                                description: topic.description,
                                order_index: topic.order_index,
                                // dependencies는 나중에 업데이트 (ID 매핑 필요)
                            });
                        }
                    }
                }
            }
        }

        revalidatePath('/dashboard');
        return { success: true, subjectId: subject.id };
    } catch (err: any) {
        console.error("[Curriculum Import] Error:", err);
        return { success: false, error: err.message };
    }
}

// ===================================
// CURRICULUM MARKETPLACE
// ===================================

/**
 * 커리큘럼을 마켓플레이스에 공유
 */
export async function shareCurriculum(params: {
    subjectId: string;
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
}): Promise<{ success: boolean; curriculumId?: string; error?: string }> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        // 커리큘럼 데이터 export
        const exportResult = await exportCurriculum(params.subjectId);
        if (!exportResult.success || !exportResult.data) {
            return { success: false, error: exportResult.error };
        }

        // 공유 커리큘럼 생성
        const { data: shared, error } = await supabase
            .from('shared_curricula')
            .insert({
                owner_id: user.id,
                name: params.name,
                description: params.description,
                subject_category: params.category,
                curriculum_data: exportResult.data,
                is_public: params.isPublic ?? true,
                tags: params.tags || [],
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/dashboard/marketplace');
        return { success: true, curriculumId: shared.id };
    } catch (err: any) {
        console.error("[Share Curriculum] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 공개 커리큘럼 목록 조회
 */
export async function getPublicCurricula(params?: {
    category?: string;
    search?: string;
    sortBy?: 'downloads' | 'rating' | 'recent';
    limit?: number;
    offset?: number;
}): Promise<{
    success: boolean;
    curricula?: SharedCurriculum[];
    total?: number;
    error?: string;
}> {
    try {
        const supabase = await createServerSupabaseClient();

        let query = supabase
            .from('shared_curricula')
            .select('*', { count: 'exact' })
            .eq('is_public', true);

        // 필터링
        if (params?.category) {
            query = query.eq('subject_category', params.category);
        }

        if (params?.search) {
            query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
        }

        // 정렬
        switch (params?.sortBy) {
            case 'downloads':
                query = query.order('download_count', { ascending: false });
                break;
            case 'rating':
                query = query.order('rating', { ascending: false });
                break;
            default:
                query = query.order('created_at', { ascending: false });
        }

        // 페이지네이션
        if (params?.limit) {
            query = query.limit(params.limit);
        }
        if (params?.offset) {
            query = query.range(params.offset, params.offset + (params.limit || 20) - 1);
        }

        const { data, count, error } = await query;

        if (error) throw error;

        return {
            success: true,
            curricula: data || [],
            total: count || 0,
        };
    } catch (err: any) {
        console.error("[Get Public Curricula] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 커리큘럼 상세 조회
 */
export async function getCurriculumDetail(curriculumId: string): Promise<{
    success: boolean;
    curriculum?: SharedCurriculum & { owner?: { name: string; email: string } };
    userCount?: number;
    error?: string;
}> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: curriculum, error } = await supabase
            .from('shared_curricula')
            .select(`
                *,
                profiles:owner_id(name, email)
            `)
            .eq('id', curriculumId)
            .single();

        if (error) throw error;

        // 사용자 수 조회
        const { count } = await supabase
            .from('curriculum_usage')
            .select('id', { count: 'exact' })
            .eq('curriculum_id', curriculumId)
            .eq('is_active', true);

        return {
            success: true,
            curriculum: {
                ...curriculum,
                owner: curriculum.profiles,
            },
            userCount: count || 0,
        };
    } catch (err: any) {
        console.error("[Get Curriculum Detail] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 커리큘럼 다운로드/Import
 */
export async function downloadCurriculum(
    curriculumId: string,
    customName?: string
): Promise<{ success: boolean; subjectId?: string; error?: string }> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        // 커리큘럼 조회
        const { data: curriculum, error } = await supabase
            .from('shared_curricula')
            .select('*')
            .eq('id', curriculumId)
            .single();

        if (error || !curriculum) {
            return { success: false, error: "Curriculum not found" };
        }

        // Import 실행
        const importResult = await importCurriculum(
            curriculum.curriculum_data as CurriculumData,
            customName || curriculum.name,
            'custom'
        );

        if (!importResult.success) {
            return importResult;
        }

        // 사용 기록 저장 (다운로드 카운트는 트리거로 자동 증가)
        await supabase.from('curriculum_usage').upsert({
            curriculum_id: curriculumId,
            user_id: user.id,
            is_active: true,
        });

        return { success: true, subjectId: importResult.subjectId };
    } catch (err: any) {
        console.error("[Download Curriculum] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 커리큘럼 평점 등록/수정
 */
export async function rateCurriculum(params: {
    curriculumId: string;
    rating: number;
    review?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        if (params.rating < 1 || params.rating > 5) {
            return { success: false, error: "Rating must be between 1 and 5" };
        }

        // upsert (기존 평점 있으면 수정, 없으면 생성)
        const { error } = await supabase.from('curriculum_ratings').upsert({
            curriculum_id: params.curriculumId,
            user_id: user.id,
            rating: params.rating,
            review: params.review,
        });

        if (error) throw error;

        revalidatePath('/dashboard/marketplace');
        return { success: true };
    } catch (err: any) {
        console.error("[Rate Curriculum] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 내가 공유한 커리큘럼 목록 조회
 */
export async function getMyCurricula(): Promise<{
    success: boolean;
    curricula?: SharedCurriculum[];
    error?: string;
}> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { data, error } = await supabase
            .from('shared_curricula')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return { success: true, curricula: data || [] };
    } catch (err: any) {
        console.error("[Get My Curricula] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 커리큘럼 삭제
 */
export async function deleteCurriculum(curriculumId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const { error } = await supabase
            .from('shared_curricula')
            .delete()
            .eq('id', curriculumId)
            .eq('owner_id', user.id);

        if (error) throw error;

        revalidatePath('/dashboard/marketplace');
        return { success: true };
    } catch (err: any) {
        console.error("[Delete Curriculum] Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * 커리큘럼 카테고리 목록 조회
 */
export async function getCurriculumCategories(): Promise<{
    success: boolean;
    categories?: Array<{ category: string; count: number }>;
}> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from('shared_curricula')
            .select('subject_category')
            .eq('is_public', true);

        if (error) throw error;

        // 카테고리별 카운트
        const categoryCount = new Map<string, number>();
        for (const item of data || []) {
            const cat = item.subject_category || 'Other';
            categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
        }

        const categories = Array.from(categoryCount.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);

        return { success: true, categories };
    } catch (err) {
        console.error("[Get Categories] Error:", err);
        return { success: false, categories: [] };
    }
}
