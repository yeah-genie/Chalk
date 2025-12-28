import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ZOOM_CLIENT_ID = Deno.env.get("ZOOM_CLIENT_ID")
const ZOOM_CLIENT_SECRET = Deno.env.get("ZOOM_CLIENT_SECRET")
const PROJECT_URL = Deno.env.get("PROJECT_URL") || "https://xnjqsgdapbjnowzwhnaq.supabase.co"
const SUPABASE_FUNCTION_URL = `${PROJECT_URL}/functions/v1/zoom-auth`


const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    try {
        // Step 1: Start OAuth flow
        if (path === 'authorize') {
            const redirectUri = url.searchParams.get("redirect_uri") || ""

            // Build Zoom OAuth URL
            const zoomAuthUrl = new URL("https://zoom.us/oauth/authorize")
            zoomAuthUrl.searchParams.set("response_type", "code")
            zoomAuthUrl.searchParams.set("client_id", ZOOM_CLIENT_ID)
            zoomAuthUrl.searchParams.set("redirect_uri", `${SUPABASE_FUNCTION_URL}/callback`)
            zoomAuthUrl.searchParams.set("state", redirectUri)

            return Response.redirect(zoomAuthUrl.toString(), 302)
        }

        // Step 2: Handle callback from Zoom
        if (path === 'callback') {
            const code = url.searchParams.get("code")
            const state = url.searchParams.get("state") // This is the app's redirect URI
            const error = url.searchParams.get("error")

            if (error) {
                const appRedirect = new URL(state || "chalkapp://zoom-callback")
                appRedirect.searchParams.set("error", error)
                return Response.redirect(appRedirect.toString(), 302)
            }

            if (!code) {
                return new Response(JSON.stringify({ error: "No authorization code" }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                })
            }

            // Exchange code for access token
            const credentials = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`)
            const tokenResponse = await fetch("https://zoom.us/oauth/token", {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${credentials}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: `${SUPABASE_FUNCTION_URL}/callback`,
                }),
            })

            const tokenData = await tokenResponse.json()

            if (tokenData.error) {
                const appRedirect = new URL(state || "chalkapp://zoom-callback")
                appRedirect.searchParams.set("error", tokenData.error)
                return Response.redirect(appRedirect.toString(), 302)
            }

            // Get user info
            const userResponse = await fetch("https://api.zoom.us/v2/users/me", {
                headers: {
                    "Authorization": `Bearer ${tokenData.access_token}`,
                },
            })
            const userData = await userResponse.json()

            // Better security: Pass tokens via hash fragment to prevent them from hitting server logs
            const authParams = new URLSearchParams({
                access_token: tokenData.access_token,
                user_name: userData.first_name || "Zoom User",
                user_email: userData.email || "",
                refresh_token: tokenData.refresh_token || "",
            });

            const redirectWithToken = `${state || "chalkapp://zoom-callback"}#${authParams.toString()}`;
            console.log("Redirecting back to app...");

            return Response.redirect(redirectWithToken, 302)
        }

        return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error("Error:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
