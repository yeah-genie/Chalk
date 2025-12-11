import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SLACK_BOT_TOKEN = Deno.env.get("SLACK_BOT_TOKEN")!;

console.log("Slack Scheduler - Wake Alerts & Weekly Review");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Get ideas ready to wake (frozen > 30 days)
async function getIdeasToWake() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
        .from("ideas")
        .select()
        .eq("is_zombie", true)
        .lt("created_at", thirtyDaysAgo.toISOString())
        .limit(5);

    return data || [];
}

// Get top ideas for weekly review
async function getWeeklyReviewIdeas() {
    const { data } = await supabase
        .from("ideas")
        .select()
        .eq("is_zombie", true)
        .order("votes", { ascending: false })
        .limit(3);

    return data || [];
}

// Send DM to user
async function sendDM(userId: string, text: string, blocks?: any[]) {
    // Open DM channel
    const openRes = await fetch("https://slack.com/api/conversations.open", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SLACK_BOT_TOKEN}` },
        body: JSON.stringify({ users: userId })
    });
    const openData = await openRes.json();
    if (!openData.ok) return;

    // Send message
    await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SLACK_BOT_TOKEN}` },
        body: JSON.stringify({
            channel: openData.channel.id,
            text,
            blocks
        })
    });
}

// Send to channel
async function sendToChannel(channel: string, text: string) {
    await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SLACK_BOT_TOKEN}` },
        body: JSON.stringify({ channel, text })
    });
}

serve(async (req) => {
    try {
        const { action, userId, channel } = await req.json();

        // Wake Alerts - call daily
        if (action === "wake_alerts") {
            const ideas = await getIdeasToWake();

            for (const idea of ideas) {
                const text = `🧊→🔥 *해동할 시간!*\n"${idea.title}"\n${Math.floor((Date.now() - new Date(idea.created_at).getTime()) / (1000 * 60 * 60 * 24))}일 전에 냉동됨\n<https://cryo-dun.vercel.app/ideas/${idea.idea_id}|확인하기>`;

                if (idea.slack_channel) {
                    await sendToChannel(idea.slack_channel, text);
                }
            }

            return new Response(JSON.stringify({ ok: true, count: ideas.length }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Weekly Review - call on Mondays
        if (action === "weekly_review") {
            const ideas = await getWeeklyReviewIdeas();

            if (ideas.length > 0 && channel) {
                let text = "📋 *이번 주 검토할 아이디어*\n\n";
                ideas.forEach((idea, i) => {
                    text += `${i + 1}. *${idea.title}*\n   👍 ${idea.votes || 0}표 • <https://cryo-dun.vercel.app/ideas/${idea.idea_id}|보기>\n`;
                });

                await sendToChannel(channel, text);
            }

            return new Response(JSON.stringify({ ok: true, count: ideas.length }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
});
