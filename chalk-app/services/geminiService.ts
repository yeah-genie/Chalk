const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface TranscriptionResult {
    text: string;
    language: string;
}

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
            }>;
        };
    }>;
    error?: {
        message: string;
    };
}

export interface LessonInsightInput {
    studentName: string;
    topic: string;
    rating: 'good' | 'okay' | 'struggled';
    struggles: string[];
    notes: string;
    previousTopics?: string[];
}

export interface LessonInsight {
    summary: string;
    nextSteps: string[];
    focusAreas: string[];
    encouragement: string;
}

export interface TopicRecommendation {
    topic: string;
    reason: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

// Generate lesson insights from notes
export async function generateLessonInsights(input: LessonInsightInput): Promise<LessonInsight> {
    const prompt = `You are an expert tutor assistant. Analyze this lesson and provide actionable insights.

Student: ${input.studentName}
Topic: ${input.topic}
Performance: ${input.rating}
Struggles: ${input.struggles.join(', ') || 'None noted'}
Notes: ${input.notes}

Respond in JSON format:
{
  "summary": "Brief 1-2 sentence summary of the lesson",
  "nextSteps": ["3 specific action items for next lesson"],
  "focusAreas": ["2-3 areas to focus on"],
  "encouragement": "A brief encouraging note for the tutor"
}`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                },
            }),
        });

        const data: GeminiResponse = await response.json();

        if (data.error) {
            console.error('[Gemini] API Error:', data.error.message);
            return getDefaultInsights(input);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                summary: parsed.summary || '',
                nextSteps: parsed.nextSteps || [],
                focusAreas: parsed.focusAreas || [],
                encouragement: parsed.encouragement || '',
            };
        }

        return getDefaultInsights(input);
    } catch (error) {
        console.error('[Gemini] Request failed:', error);
        return getDefaultInsights(input);
    }
}

// Generate topic recommendations for next lesson (Enhanced with personalization)
export interface PersonalizedRecommendationInput {
    studentName: string;
    subject: string;
    grade?: string;           // 학년 (예: "고1", "Grade 10")
    goal?: string;            // 목표 (예: "수능 대비", "AP 5점")
    previousTopics: string[];
    lastRating: string;
    goodRate?: number;        // 이해도 (0-1, good 비율)
    struggledTopics?: string[]; // 어려워했던 토픽들
}

export async function generateTopicRecommendations(
    studentName: string,
    subject: string,
    previousTopics: string[],
    lastRating: string,
    options?: {
        grade?: string;
        goal?: string;
        goodRate?: number;
        struggledTopics?: string[];
    }
): Promise<TopicRecommendation[]> {
    const grade = options?.grade || '';
    const goal = options?.goal || '';
    const goodRate = options?.goodRate !== undefined ? Math.round(options.goodRate * 100) : null;
    const struggledTopics = options?.struggledTopics?.slice(-3) || [];

    const prompt = `You are an expert tutor. Recommend 3 topics for the next lesson.

Student: ${studentName}
Subject: ${subject}${grade ? ` (${grade})` : ''}${goal ? `\nGoal: ${goal}` : ''}
Previous Topics: ${previousTopics.slice(-5).join(', ') || 'None'}
Last Performance: ${lastRating}${goodRate !== null ? `\nOverall Understanding: ${goodRate}%` : ''}${struggledTopics.length > 0 ? `\nPreviously Struggled: ${struggledTopics.join(', ')}` : ''}

Consider:
1. If last performance was "struggled", prioritize review or prerequisite topics
2. If understanding is below 70%, slow down pace
3. If student has a specific goal (exam prep), stay on track
4. Balance between progress and mastery

Respond in JSON array format:
[
  { "topic": "Topic name", "reason": "Why this topic (1 sentence)", "difficulty": "easy|medium|hard" }
]`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 400,
                },
            }),
        });

        const data: GeminiResponse = await response.json();

        if (data.error) {
            console.error('[Gemini] API Error:', data.error.message);
            return getDefaultRecommendations(subject);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return getDefaultRecommendations(subject);
    } catch (error) {
        console.error('[Gemini] Request failed:', error);
        return getDefaultRecommendations(subject);
    }
}

// Calculate student understanding rate from lesson logs
export function calculateStudentStats(logs: Array<{ rating: string; topic: string }>) {
    if (logs.length === 0) {
        return { goodRate: 0, struggledTopics: [], totalLessons: 0 };
    }

    const goodCount = logs.filter(l => l.rating === 'good').length;
    const goodRate = goodCount / logs.length;

    const struggledTopics = logs
        .filter(l => l.rating === 'struggled')
        .map(l => l.topic)
        .filter((v, i, a) => a.indexOf(v) === i); // unique

    return {
        goodRate,
        struggledTopics,
        totalLessons: logs.length,
    };
}

// Generate parent report summary
export async function generateParentReport(
    studentName: string,
    logs: Array<{ topic: string; rating: string; date: string; notes?: string }>
): Promise<string> {
    if (logs.length === 0) {
        return `No lesson records found for ${studentName}.`;
    }

    const prompt = `You are a tutor writing a brief progress report for parents.

Student: ${studentName}
Recent Lessons:
${logs.map(l => `- ${l.date}: ${l.topic} (${l.rating})${l.notes ? ` - ${l.notes}` : ''}`).join('\n')}

Write a brief, encouraging 3-4 sentence report in English for the parents about their child's progress.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300,
                },
            }),
        });

        const data: GeminiResponse = await response.json();

        if (data.error) {
            return `${studentName} has completed ${logs.length} recent lessons.`;
        }

        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
        console.error('[Gemini] Request failed:', error);
        return `${studentName} has completed ${logs.length} recent lessons.`;
    }
}

// Generate parent report summary
export async function transcribeAudio(base64Audio: string, mimeType: string = 'audio/m4a'): Promise<TranscriptionResult> {
    const prompt = "Transcribe this audio recording from a tutoring lesson accurately. Just return the transcription text, no meta-commentary.";

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Audio
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1, // Low temperature for higher accuracy
                },
            }),
        });

        const data: GeminiResponse = await response.json();

        if (data.error) {
            console.error('[Gemini STT] API Error:', data.error.message);
            throw new Error(data.error.message);
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return {
            text: text.trim(),
            language: 'unknown' // Could be detected by Gemini if needed
        };
    } catch (error) {
        console.error('[Gemini STT] Request failed:', error);
        throw error;
    }
}

// Fallback defaults when API fails
function getDefaultInsights(input: LessonInsightInput): LessonInsight {
    const ratingMessages = {
        good: 'Student showed good understanding.',
        okay: 'Additional practice needed.',
        struggled: 'Concept re-explanation needed.',
    };

    return {
        summary: `Covered ${input.topic} with ${input.studentName}. ${ratingMessages[input.rating]}`,
        nextSteps: [
            'Review practice problems',
            'Deepen related concepts',
            'Proceed to next unit',
        ],
        focusAreas: input.struggles.length > 0 ? input.struggles : ['Overall comprehension'],
        encouragement: 'Great lesson! Keep up the good work.',
    };
}

function getDefaultRecommendations(subject: string): TopicRecommendation[] {
    const defaults: Record<string, TopicRecommendation[]> = {
        Math: [
            { topic: 'Equation Review', reason: 'Strengthen foundations', difficulty: 'medium' },
            { topic: 'Function Concepts', reason: 'Prepare for next level', difficulty: 'medium' },
            { topic: 'Problem Solving Practice', reason: 'Build skills', difficulty: 'easy' },
        ],
        English: [
            { topic: 'Grammar Review', reason: 'Strengthen foundations', difficulty: 'medium' },
            { topic: 'Reading Comprehension', reason: 'Improve understanding', difficulty: 'medium' },
            { topic: 'Writing Practice', reason: 'Improve expression', difficulty: 'hard' },
        ],
    };

    return defaults[subject] || [
        { topic: 'Review Previous Content', reason: 'Strengthen foundations', difficulty: 'easy' },
        { topic: 'New Concept Learning', reason: 'Progress forward', difficulty: 'medium' },
        { topic: 'Practice Problems', reason: 'Build skills', difficulty: 'medium' },
    ];
}
