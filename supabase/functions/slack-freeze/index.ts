import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

console.log("Slack Freeze Function Started");

serve(async (req) => {
    try {
        // Slack sends slash commands as x-www-form-urlencoded
        const formData = await req.formData();

        const text = formData.get("text") as string || "";
        const userId = formData.get("user_id") as string || "";
        const userName = formData.get("user_name") as string || "";
        const channelName = formData.get("channel_name") as string || "";
        const responseUrl = formData.get("response_url") as string || "";

        console.log(`/freeze from ${userName}: ${text}`);

        // Parse the command: /freeze Title --priority high --category Feature
        const { title, priority, category } = parseCommand(text);

        if (!title) {
            return new Response(JSON.stringify({
                response_type: "ephemeral",
                text: "❌ Please provide an idea. Usage: `/freeze Your idea here --priority high --category Feature`"
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Save to Supabase
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const { data, error } = await supabase
            .from("ideas")
            .insert({
                title,
                description: `Captured from Slack #${channelName} by @${userName}`,
                status: "Frozen",
                priority: priority || "Medium",
                category: category || "Feature",
                is_zombie: true,
                zombie_reason: "Slack /freeze command",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            return new Response(JSON.stringify({
                response_type: "ephemeral",
                text: `❌ Failed to save: ${error.message}`
            }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // Success response
        return new Response(JSON.stringify({
            response_type: "in_channel",
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `🧊 *Frozen!* "${title}"\n• Priority: ${data.priority}\n• Category: ${data.category}`
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: `<https://cryo-dun.vercel.app/ideas/${data.idea_id}|View in Cryo Dashboard>`
                        }
                    ]
                }
            ]
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(JSON.stringify({
            response_type: "ephemeral",
            text: `❌ Error: ${error.message}`
        }), {
            status: 200, // Slack expects 200 even for errors
            headers: { "Content-Type": "application/json" }
        });
    }
});

function parseCommand(text: string): { title: string; priority?: string; category?: string } {
    // Parse: "My idea --priority high --category Feature"
    const priorityMatch = text.match(/--priority\s+(\w+)/i);
    const categoryMatch = text.match(/--category\s+(\w+)/i);

    // Remove flags from title
    let title = text
        .replace(/--priority\s+\w+/gi, "")
        .replace(/--category\s+\w+/gi, "")
        .trim();

    // Normalize priority
    let priority = priorityMatch?.[1]?.toLowerCase();
    if (priority === "high") priority = "High";
    else if (priority === "low") priority = "Low";
    else priority = "Medium";

    // Normalize category
    let category = categoryMatch?.[1];
    if (!["Feature", "Growth", "Operations", "Technical"].includes(category || "")) {
        category = "Feature";
    }

    return { title, priority, category };
}
