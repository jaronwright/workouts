import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface PushPayload {
  userId: string
  title: string
  body: string
  url?: string
  tag?: string
}

serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, content-type'
      }
    })
  }

  try {
    const { userId, title, body, url, tag } = (await req.json()) as PushPayload

    if (!userId || !title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const payload = JSON.stringify({ title, body, url, tag })

    // Use web-push compatible approach via the Web Push protocol
    let sent = 0
    for (const sub of subscriptions) {
      try {
        const pushData = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }

        // Import web-push for Deno
        const webPush = await import('https://esm.sh/web-push@3.6.7')
        webPush.setVapidDetails(
          'mailto:noreply@workout-tracker.app',
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY
        )

        await webPush.sendNotification(pushData, payload)
        sent++
      } catch (pushError: unknown) {
        console.error('Push failed for subscription:', sub.id, pushError)
        // Remove invalid subscriptions (410 Gone)
        if (
          pushError &&
          typeof pushError === 'object' &&
          'statusCode' in pushError &&
          (pushError as { statusCode: number }).statusCode === 410
        ) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
