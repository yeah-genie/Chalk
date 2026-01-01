"use server";

/**
 * OpenAI Whisper STT Service
 * 음성 파일 → 텍스트 변환
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
    success: boolean;
    transcript?: string;
    language?: string;
    duration?: number;
    error?: string;
}

/**
 * Transcribe audio using OpenAI Whisper API
 * Supports: webm, mp3, mp4, m4a, wav, mpeg
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    // Check for API key
    if (!OPENAI_API_KEY) {
        console.warn('[Whisper] No OPENAI_API_KEY - using demo mode');
        return getDemoTranscription();
    }

    try {
        // Convert Blob to File for FormData
        const audioFile = new File([audioBlob], 'recording.webm', {
            type: audioBlob.type || 'audio/webm'
        });

        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'verbose_json');
        // Auto-detect language, but hint towards English/Korean
        formData.append('language', 'en'); // Can be 'ko' for Korean-focused tutoring

        const response = await fetch(WHISPER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Whisper API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
            );
        }

        const data = await response.json();

        return {
            success: true,
            transcript: data.text || '',
            language: data.language,
            duration: data.duration,
        };
    } catch (error) {
        console.error('[Whisper] Transcription error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Transcription failed',
        };
    }
}

/**
 * Demo transcription for development/testing
 */
function getDemoTranscription(): TranscriptionResult {
    const demoTranscripts = [
        // AP Calculus focused demo
        `Okay, so today we're going to continue with limits. Remember last time we talked about what happens when x approaches a value?

        Student: Yes, I remember. Like when x goes to 2, we look at what f(x) gets close to.

        Exactly! Now let's talk about limits at infinity. When x gets really, really large, what happens to the function?

        Student: Um, it depends on the function right? Like 1/x would get closer to zero?

        That's exactly right! As x approaches infinity, 1/x approaches zero. We write this as the limit as x approaches infinity of 1/x equals zero. Can you tell me what happens with x squared as x goes to infinity?

        Student: It would get bigger and bigger... so it goes to infinity too?

        Correct! The limit is infinity, which means the function grows without bound. Now here's a trickier one - what about (3x^2 + 2x) / (x^2 + 1) as x approaches infinity?

        Student: Hmm... both top and bottom get really big. How do I know which one wins?

        Great question! We divide everything by the highest power of x. So we get (3 + 2/x) / (1 + 1/x^2). As x goes to infinity, those fractions with x in the denominator go to zero.

        Student: Oh! So it's just 3/1 which is 3?

        Excellent work! You've got it. This is a horizontal asymptote at y = 3.`,

        // SAT Math focused demo
        `Let's review linear equations today. If we have 2x + 5 = 13, how do we solve for x?

        Student: We subtract 5 from both sides first?

        Right! What do we get?

        Student: 2x equals 8, then divide by 2, so x is 4.

        Perfect. Now let's try something harder. What if we have 3(x - 2) = 2x + 7?

        Student: First I distribute the 3... so 3x minus 6 equals 2x plus 7.

        Good, keep going.

        Student: Subtract 2x from both sides... x minus 6 equals 7. Add 6... x equals 13!

        Excellent! You're really getting the hang of this. The key is always doing the same operation to both sides.`,
    ];

    // Randomly select a demo transcript
    const transcript = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];

    return {
        success: true,
        transcript,
        language: 'en',
        duration: 180, // ~3 minutes simulated
    };
}

/**
 * Estimate transcription cost (for display purposes)
 * Whisper pricing: $0.006 per minute
 */
export function estimateTranscriptionCost(durationSeconds: number): number {
    const minutes = durationSeconds / 60;
    return Math.round(minutes * 0.006 * 1000) / 1000; // Round to 3 decimal places
}
