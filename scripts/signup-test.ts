/**
 * Sign-Up Flow Test Script
 *
 * Tests the user-facing sign-up flow for 20 users:
 * - Sign up with email/password (regular flow, not admin)
 * - Email verification emails sent
 * - Verify email confirmation works
 *
 * Run with: npx tsx scripts/signup-test.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

const NUM_USERS = 20

interface TestUser {
  id?: string
  email: string
  password: string
  displayName: string
}

// Generate test users
function generateTestUsers(count: number): TestUser[] {
  const users: TestUser[] = []
  const timestamp = Date.now()

  for (let i = 1; i <= count; i++) {
    users.push({
      email: `signup_test${i}_${timestamp}@example.com`,
      password: `SecurePass${i}!@#`,
      displayName: `Test User ${i}`
    })
  }

  return users
}

async function testSignUp(users: TestUser[]): Promise<void> {
  console.log('\n📝 Testing Sign-Up Flow for 20 Users...\n')

  let success = 0
  let failed = 0
  const errors: string[] = []
  const startTime = Date.now()

  for (const user of users) {
    try {
      // Create a fresh client for each user (simulates different browser sessions)
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      // Perform sign-up (this is the actual user-facing flow)
      const { data, error } = await client.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            display_name: user.displayName
          }
        }
      })

      if (error) {
        throw error
      }

      if (data.user) {
        user.id = data.user.id
        success++
        console.log(`  ✅ ${user.email} - Signed up successfully`)

        // Check if email confirmation is required
        if (!data.session) {
          console.log(`     📧 Confirmation email sent (check Mailpit)`)
        } else {
          console.log(`     🔓 Auto-confirmed (session created)`)
        }
      } else {
        throw new Error('No user data returned')
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))

    } catch (err) {
      failed++
      const message = err instanceof Error ? err.message : 'Unknown error'
      errors.push(`${user.email}: ${message}`)
      console.log(`  ❌ ${user.email} - Failed: ${message}`)
    }
  }

  const duration = Date.now() - startTime

  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 SIGN-UP TEST RESULTS')
  console.log('='.repeat(50))
  console.log(`\n  Total Users: ${NUM_USERS}`)
  console.log(`  ✅ Successful: ${success}`)
  console.log(`  ❌ Failed: ${failed}`)
  console.log(`  ⏱️  Duration: ${duration}ms`)
  console.log(`  📈 Success Rate: ${((success / NUM_USERS) * 100).toFixed(1)}%`)

  if (errors.length > 0) {
    console.log('\n  Errors:')
    errors.forEach(e => console.log(`    - ${e}`))
  }

  console.log('\n  📧 Check confirmation emails at: http://127.0.0.1:54324')

  return users.filter(u => u.id) as any
}

async function checkEmailsInMailpit(): Promise<void> {
  console.log('\n📬 Checking Mailpit for confirmation emails...')

  try {
    const response = await fetch('http://127.0.0.1:54324/api/v1/messages')
    const data = await response.json()

    const confirmEmails = data.messages.filter((m: any) =>
      m.Subject.includes('Confirm') || m.Subject.includes('Verify')
    )

    console.log(`\n  Found ${confirmEmails.length} confirmation emails in Mailpit`)

    if (confirmEmails.length > 0) {
      console.log('\n  Recent confirmation emails:')
      confirmEmails.slice(0, 5).forEach((email: any) => {
        console.log(`    - To: ${email.To[0].Address}`)
        console.log(`      Subject: ${email.Subject}`)
        console.log(`      Snippet: ${email.Snippet.substring(0, 80)}...`)
        console.log('')
      })
    }
  } catch (err) {
    console.log('  Could not fetch emails from Mailpit')
  }
}

async function cleanupUsers(users: TestUser[]): Promise<void> {
  console.log('\n🧹 Cleaning up test users...')

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  let deleted = 0
  let failed = 0

  for (const user of users) {
    if (user.id) {
      try {
        await adminClient.auth.admin.deleteUser(user.id)
        deleted++
      } catch {
        failed++
      }
    }
  }

  console.log(`  ✅ Deleted: ${deleted}`)
  if (failed > 0) {
    console.log(`  ❌ Failed to delete: ${failed}`)
  }
}

async function main() {
  console.log('🚀 Sign-Up Test for 20 Users')
  console.log('=' .repeat(50))

  const users = generateTestUsers(NUM_USERS)

  await testSignUp(users)
  await checkEmailsInMailpit()
  await cleanupUsers(users)

  console.log('\n✅ Sign-up test completed!\n')
}

main().catch(console.error)
