import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN")!;
const GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY") || "";

console.log("Slack Emoji Freeze v3 - Multilingual + Smart AI");

// Detect if text is Korean
function isKorean(text: string): boolean {
    return /[가-힣]/.test(text);
}

// Get localized message
function getMessage(text: string, key: string): string {
    const isKo = isKorean(text);
    const messages: Record<string, { ko: string; en: string }> = {
        notIdea: {
            ko: "🤔 이건 아이디어 같지 않아요. 실제 제품/기능 아이디어에 사용해주세요!",
            en: "🤔 This doesn't look like an idea. Use it for actual product/feature ideas!"
        },
        frozen: {
            ko: "🧊 얼렸어요!",
            en: "🧊 Frozen!"
        }
    };
    return isKo ? messages[key].ko : messages[key].en;
}

// Check if text is a valid idea using Gemini
async function isValidIdea(text: string): Promise<boolean> {
    if (text.length < 8) return false;
    if (!GEMINI_API_KEY) return true;

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Is this message an ACTIONABLE PRODUCT/BUSINESS IDEA worth saving for later? Answer ONLY "yes" or "no". Message: "${text}"`
                        }]
                    }]
                })
            }
        );
        const data = await res.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || "";
        console.log(`AI check: "${text.substring(0, 30)}..." -> ${answer}`);
        return answer.includes("yes");
    } catch (e) {
        console.error("Gemini error:", e);
        return true;
    }
}

serve(async (req) => {
    try {
        const body = await req.text();
        const payload = JSON.parse(body);

        // URL verification
        if (payload.type === "url_verification") {
            return new Response(JSON.stringify({ challenge: payload.challenge }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Event callback
        if (payload.type === "event_callback") {
            const event = payload.event;

            if (event.type === "reaction_added" && event.reaction === "snowflake") {
                // Get original message
                const msgRes = await fetch(
                    `https://slack.com/api/conversations.history?channel=${event.item.channel}&latest=${event.item.ts}&inclusive=true&limit=1`,
                    { headers: { "Authorization": `Bearer ${SLACK_BOT_TOKEN}` } }
                );
                const msgData = await msgRes.json();

                if (!msgData.ok || !msgData.messages?.[0]) {
                    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
                }

                const text = msgData.messages[0].text;
                const channel = event.item.channel;

                // Check if valid idea
                const isIdea = await isValidIdea(text);

                if (!isIdea) {
                    // Not an idea - send localized message
                    await fetch("https://slack.com/api/chat.postMessage", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SLACK_BOT_TOKEN}` },
                        body: JSON.stringify({
                            channel,
                            thread_ts: event.item.ts,
                            text: getMessage(text, "notIdea")
                        })
                    });
                } else {
                    // Save to DB
                    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
                    const { data } = await supabase.from("ideas").insert({
                        title: text.length > 100 ? text.substring(0, 100) + "..." : text,
                        description: text,
                        status: "Frozen",
                        priority: "Medium",
                        category: "Feature",
                        is_zombie: true,
                        zombie_reason: "Frozen via Slack emoji",
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }).select().single();

                    // Send success message
                    await fetch("https://slack.com/api/chat.postMessage", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SLACK_BOT_TOKEN}` },
                        body: JSON.stringify({
                            channel,
                            thread_ts: event.item.ts,
                            text: `${getMessage(text, "frozen")} https://cryo-dun.vercel.app/ideas/${data?.idea_id}`
                        })
                    });
                }
            }
        }

        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
});
