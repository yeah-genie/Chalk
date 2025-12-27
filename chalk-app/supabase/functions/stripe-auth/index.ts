import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const STRIPE_CLIENT_ID = "ca_Tg1tZB9Mzz7PuPdjGzUQe4t6CN7od0mw"
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") || ""
const SUPABASE_FUNCTION_URL = "https://xnjqsgdapbjnowzwhnaq.supabase.co/functions/v1/stripe-auth"

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

            // Build Stripe OAuth URL
            const stripeAuthUrl = new URL("https://connect.stripe.com/oauth/authorize")
            stripeAuthUrl.searchParams.set("response_type", "code")
            stripeAuthUrl.searchParams.set("client_id", STRIPE_CLIENT_ID)
            stripeAuthUrl.searchParams.set("scope", "read_write")
            stripeAuthUrl.searchParams.set("redirect_uri", `${SUPABASE_FUNCTION_URL}/callback`)
            stripeAuthUrl.searchParams.set("state", redirectUri)

            return Response.redirect(stripeAuthUrl.toString(), 302)
        }

        // Step 2: Handle callback from Stripe
        if (path === 'callback') {
            const code = url.searchParams.get("code")
            const state = url.searchParams.get("state") // This is the app's redirect URI
            const error = url.searchParams.get("error")

            if (error) {
                const appRedirect = new URL(state || "chalk://stripe-callback")
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
            const tokenResponse = await fetch("https://connect.stripe.com/oauth/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    client_secret: STRIPE_SECRET_KEY,
                }),
            })

            const tokenData = await tokenResponse.json()

            if (tokenData.error) {
                const appRedirect = new URL(state || "chalk://stripe-callback")
                appRedirect.searchParams.set("error", tokenData.error_description || tokenData.error)
                return Response.redirect(appRedirect.toString(), 302)
            }

            // Redirect back to app with tokens
            const appRedirect = new URL(state || "chalk://stripe-callback")
            appRedirect.searchParams.set("access_token", tokenData.access_token)
            appRedirect.searchParams.set("stripe_user_id", tokenData.stripe_user_id)
            appRedirect.searchParams.set("refresh_token", tokenData.refresh_token || "")

            return Response.redirect(appRedirect.toString(), 302)
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
