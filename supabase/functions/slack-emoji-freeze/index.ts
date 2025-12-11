import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN")!;
const GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY") || "";

console.log("Slack Emoji Freeze v4 - Full Features");

// Detect if text is Korean
function isKorean(text: string): boolean {
    return /[가-힣]/.test(text);
}

// Get localized message
function getMessage(text: string, key: string): string {
    const isKo = isKorean(text);
    const messages: Record<string, { ko: string; en: string }> = {
        notIdea: {
            ko: "🤔 이건 아이디어 같지 않아요.",
            en: "🤔 This doesn't look like an idea."
        },
        frozen: {
            ko: "🧊 얼렸어요!",
            en: "🧊 Frozen!"
        },
        thawed: {
            ko: "🔥 해동됐어요! 검토할 시간이에요.",
            en: "🔥 Thawed! Time to review."
        },
        voted: {
            ko: "👍 투표했어요!",
            en: "👍 Voted!"
        },
        alreadyActive: {
            ko: "이미 활성 상태에요.",
            en: "Already active."
        },
        notFound: {
            ko: "이 메시지로 저장된 아이디어가 없어요.",
            en: "No idea found for this message."
        }
    };
    return isKo ? messages[key].ko : messages[key].en;
}

// Check if text is a valid idea
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
                    contents: [{ parts: [{ text: `Is this an ACTIONABLE PRODUCT/BUSINESS IDEA? yes/no. Message: "${text}"` }] }]
                })
            }
        );
        const data = await res.json();
        return (data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || "").includes("yes");
    } catch { return true; }
}

// Get thread messages for context
async function getThreadContext(channel: string, threadTs: string): Promise<string> {
    try {
        const res = await fetch(
            `https://slack.com/api/conversations.replies?channel=${channel}&ts=${threadTs}&limit=10`,
            { headers: { "Authorization": `Bearer ${SLACK_BOT_TOKEN}` } }
        );
        const data = await res.json();
        if (!data.ok || !data.messages) return "";
        return data.messages.map((m: any) => m.text).join("\n---\n");
    } catch { return ""; }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
            if (event.type !== "reaction_added") {
                return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
            }

            const reaction = event.reaction;
            const channel = event.item.channel;
            const messageTs = event.item.ts;

            // Get original message
            const msgRes = await fetch(
                `https://slack.com/api/conversations.history?channel=${channel}&latest=${messageTs}&inclusive=true&limit=1`,
                { headers: { "Authorization": `Bearer ${SLACK_BOT_TOKEN}` } }
            );
            const msgData = await msgRes.json();
            if (!msgData.ok || !msgData.messages?.[0]) {
                return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
            }

            const text = msgData.messages[0].text;
            const threadTs = msgData.messages[0].thread_ts || messageTs;

            // ❄️ FREEZE
            if (reaction === "snowflake") {
                const isIdea = await isValidIdea(text);
                if (!isIdea) {
                    await postMessage(channel, threadTs, getMessage(text, "notIdea"));
                } else {
                    // Get thread context if exists
                    const context = await getThreadContext(channel, threadTs);

                    const { data } = await supabase.from("ideas").insert({
                        title: text.length > 100 ? text.substring(0, 100) + "..." : text,
                        description: context || text,
                        status: "Frozen",
                        priority: "Medium",
                        category: "Feature",
                        is_zombie: true,
                        zombie_reason: "Frozen via Slack",
                        slack_message_ts: messageTs,
                        slack_channel: channel,
                        votes: 0,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }).select().single();

                    await postMessage(channel, threadTs,
                        `${getMessage(text, "frozen")} https://cryo-dun.vercel.app/ideas/${data?.idea_id}`);
                }
            }

            // 🔥 THAW
            else if (reaction === "fire") {
                const { data: idea } = await supabase
                    .from("ideas")
                    .select()
                    .eq("slack_message_ts", messageTs)
                    .single();

                if (!idea) {
                    await postMessage(channel, threadTs, getMessage(text, "notFound"));
                } else if (!idea.is_zombie) {
                    await postMessage(channel, threadTs, getMessage(text, "alreadyActive"));
                } else {
                    await supabase.from("ideas").update({
                        is_zombie: false,
                        status: "Active",
                        zombie_reason: null,
                        updated_at: new Date().toISOString()
                    }).eq("idea_id", idea.idea_id);

                    await postMessage(channel, threadTs,
                        `${getMessage(text, "thawed")} https://cryo-dun.vercel.app/ideas/${idea.idea_id}`);
                }
            }

            // 👍 VOTE
            else if (reaction === "+1" || reaction === "thumbsup") {
                const { data: idea } = await supabase
                    .from("ideas")
                    .select()
                    .eq("slack_message_ts", messageTs)
                    .single();

                if (idea) {
                    await supabase.from("ideas").update({
                        votes: (idea.votes || 0) + 1,
                        updated_at: new Date().toISOString()
                    }).eq("idea_id", idea.idea_id);

                    await postMessage(channel, threadTs,
                        `${getMessage(text, "voted")} (${(idea.votes || 0) + 1}표)`);
                }
            }
        }

        return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
});

async function postMessage(channel: string, threadTs: string, text: string) {
    await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SLACK_BOT_TOKEN}` },
        body: JSON.stringify({ channel, thread_ts: threadTs, text })
    });
}
