import { supabase } from './supabase'

export interface PushSubscriptionRecord {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  workout_reminders: boolean
  reminder_time: string
  pr_celebrations: boolean
  rest_timer_alerts: boolean
  created_at: string
  updated_at: string
}

// ─── Subscription CRUD ───────────────────────────────────────────────

export async function saveSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<PushSubscriptionRecord> {
  const json = subscription.toJSON()
  const keys = json.keys!

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        endpoint: json.endpoint!,
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      { onConflict: 'user_id,endpoint' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)

  if (error) throw error
}

export async function getSubscriptions(userId: string): Promise<PushSubscriptionRecord[]> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

// ─── Preferences CRUD ────────────────────────────────────────────────

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertNotificationPreferences(
  userId: string,
  prefs: Partial<Pick<NotificationPreferences, 'workout_reminders' | 'reminder_time' | 'pr_celebrations' | 'rest_timer_alerts'>>
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(
      {
        user_id: userId,
        ...prefs,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}
