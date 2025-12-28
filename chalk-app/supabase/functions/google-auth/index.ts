import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")
const PROJECT_URL = Deno.env.get("PROJECT_URL") || "https://xnjqsgdapbjnowzwhnaq.supabase.co"
const SUPABASE_FUNCTION_URL = `${PROJECT_URL}/functions/v1/google-auth`


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

            // Build Google OAuth URL
            const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
            googleAuthUrl.searchParams.set("response_type", "code")
            googleAuthUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID)
            googleAuthUrl.searchParams.set("scope", "openid email profile https://www.googleapis.com/auth/calendar.readonly")
            googleAuthUrl.searchParams.set("redirect_uri", `${SUPABASE_FUNCTION_URL}/callback`)
            googleAuthUrl.searchParams.set("state", redirectUri)
            googleAuthUrl.searchParams.set("access_type", "offline")
            googleAuthUrl.searchParams.set("prompt", "consent")

            return Response.redirect(googleAuthUrl.toString(), 302)
        }

        // Step 2: Handle callback from Google
        if (path === 'callback') {
            const code = url.searchParams.get("code")
            const state = url.searchParams.get("state") // This is the app's redirect URI
            const error = url.searchParams.get("error")

            if (error) {
                console.error('[Google] OAuth error:', error)
                const appRedirect = new URL(state || "chalkapp://google-callback")
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
            const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    redirect_uri: `${SUPABASE_FUNCTION_URL}/callback`,
                }),
            })

            const tokenData = await tokenResponse.json()

            if (tokenData.error) {
                console.error('[Google] Token error:', tokenData.error)
                const appRedirect = new URL(state || "chalkapp://google-callback")
                appRedirect.searchParams.set("error", tokenData.error_description || tokenData.error)
                return Response.redirect(appRedirect.toString(), 302)
            }

            // Get user info
            const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: {
                    "Authorization": `Bearer ${tokenData.access_token}`,
                },
            })
            const userData = await userResponse.json()

            // Redirect back to app with tokens
            const appRedirectBase = state || "chalkapp://google-callback";
            // Better security: Pass tokens via hash fragment to prevent them from hitting server logs
            const authParams = new URLSearchParams({
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || "",
                user_name: userData.name || "",
                user_email: userData.email || "",
                user_photo: userData.picture || "",
            });

            const redirectWithToken = `${appRedirectBase}#${authParams.toString()}`;
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
