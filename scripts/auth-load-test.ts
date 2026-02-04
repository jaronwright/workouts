/**
 * Authentication Load Test Script
 *
 * Tests the authentication system with 100 simulated users:
 * - User creation (sign up)
 * - Email/password sign in
 * - Password reset flow
 * - Session management
 * - Concurrent operations
 *
 * Run with: npx tsx scripts/auth-load-test.ts
 */

import { createClient } from '@supabase/supabase-js'

// Configuration
const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

const NUM_USERS = 100
const BATCH_SIZE = 10 // Process users in batches to avoid rate limiting

// Create clients
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TestUser {
  id?: string
  email: string
  password: string
}

interface TestResult {
  operation: string
  success: number
  failed: number
  errors: string[]
  duration: number
}

// Generate test users
function generateTestUsers(count: number): TestUser[] {
  const users: TestUser[] = []
  const timestamp = Date.now()

  for (let i = 1; i <= count; i++) {
    users.push({
      email: `testuser${i}_${timestamp}@loadtest.local`,
      password: `TestPass${i}!@#$`
    })
  }

  return users
}

// Run operation in batches
async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  operation: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(operation))
    results.push(...batchResults)

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

// Test 1: Create users using admin API (bypasses email verification)
async function testUserCreation(users: TestUser[]): Promise<TestResult> {
  console.log('\n📝 Test 1: Creating users...')
  const startTime = Date.now()
  const errors: string[] = []
  let success = 0
  let failed = 0

  const results = await runInBatches(users, BATCH_SIZE, async (user) => {
    try {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true // Auto-confirm email for testing
      })

      if (error) {
        throw error
      }

      user.id = data.user.id
      return { success: true, user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, error: message, user }
    }
  })

  for (const result of results) {
    if (result.success) {
      success++
    } else {
      failed++
      errors.push(`${result.user.email}: ${result.error}`)
    }
  }

  const duration = Date.now() - startTime
  console.log(`   ✅ Created: ${success}, ❌ Failed: ${failed} (${duration}ms)`)

  return { operation: 'User Creation', success, failed, errors, duration }
}

// Test 2: Sign in with each user
async function testSignIn(users: TestUser[]): Promise<TestResult> {
  console.log('\n🔐 Test 2: Testing sign-in...')
  const startTime = Date.now()
  const errors: string[] = []
  let success = 0
  let failed = 0

  const results = await runInBatches(users, BATCH_SIZE, async (user) => {
    try {
      // Create a fresh client for each sign-in attempt
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data, error } = await client.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })

      if (error) {
        throw error
      }

      if (!data.session) {
        throw new Error('No session returned')
      }

      // Sign out to clean up
      await client.auth.signOut()

      return { success: true, user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, error: message, user }
    }
  })

  for (const result of results) {
    if (result.success) {
      success++
    } else {
      failed++
      errors.push(`${result.user.email}: ${result.error}`)
    }
  }

  const duration = Date.now() - startTime
  console.log(`   ✅ Signed in: ${success}, ❌ Failed: ${failed} (${duration}ms)`)

  return { operation: 'Sign In', success, failed, errors, duration }
}

// Test 3: Password reset request
async function testPasswordReset(users: TestUser[]): Promise<TestResult> {
  console.log('\n🔄 Test 3: Testing password reset requests...')
  const startTime = Date.now()
  const errors: string[] = []
  let success = 0
  let failed = 0

  // Only test a subset for password reset to avoid overwhelming email system
  const testSubset = users.slice(0, Math.min(20, users.length))

  const results = await runInBatches(testSubset, 5, async (user) => {
    try {
      const { error } = await anonClient.auth.resetPasswordForEmail(user.email, {
        redirectTo: 'http://localhost:5173/auth?mode=reset'
      })

      if (error) {
        throw error
      }

      return { success: true, user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, error: message, user }
    }
  })

  for (const result of results) {
    if (result.success) {
      success++
    } else {
      failed++
      errors.push(`${result.user.email}: ${result.error}`)
    }
  }

  const duration = Date.now() - startTime
  console.log(`   ✅ Reset emails sent: ${success}, ❌ Failed: ${failed} (${duration}ms)`)
  console.log(`   📧 Check Mailpit at http://127.0.0.1:54324 to verify emails`)

  return { operation: 'Password Reset', success, failed, errors, duration }
}

// Test 4: Concurrent sign-ins (stress test)
async function testConcurrentSignIn(users: TestUser[]): Promise<TestResult> {
  console.log('\n⚡ Test 4: Testing concurrent sign-ins (stress test)...')
  const startTime = Date.now()
  const errors: string[] = []
  let success = 0
  let failed = 0

  // Test 50 concurrent sign-ins
  const testSubset = users.slice(0, Math.min(50, users.length))

  const results = await Promise.all(testSubset.map(async (user) => {
    try {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { error } = await client.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })

      if (error) {
        throw error
      }

      await client.auth.signOut()
      return { success: true, user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, error: message, user }
    }
  }))

  for (const result of results) {
    if (result.success) {
      success++
    } else {
      failed++
      errors.push(`${result.user.email}: ${result.error}`)
    }
  }

  const duration = Date.now() - startTime
  console.log(`   ✅ Concurrent sign-ins: ${success}, ❌ Failed: ${failed} (${duration}ms)`)

  return { operation: 'Concurrent Sign In', success, failed, errors, duration }
}

// Test 5: Wrong password attempts
async function testWrongPassword(users: TestUser[]): Promise<TestResult> {
  console.log('\n🚫 Test 5: Testing wrong password handling...')
  const startTime = Date.now()
  const errors: string[] = []
  let success = 0 // Success here means the system correctly rejected the wrong password
  let failed = 0

  const testSubset = users.slice(0, Math.min(20, users.length))

  const results = await runInBatches(testSubset, BATCH_SIZE, async (user) => {
    try {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { error } = await client.auth.signInWithPassword({
        email: user.email,
        password: 'WrongPassword123!'
      })

      if (error && error.message.includes('Invalid login credentials')) {
        return { success: true, user } // Correctly rejected
      }

      return { success: false, error: 'Should have rejected wrong password', user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      if (message.includes('Invalid login credentials')) {
        return { success: true, user }
      }
      return { success: false, error: message, user }
    }
  })

  for (const result of results) {
    if (result.success) {
      success++
    } else {
      failed++
      errors.push(`${result.user.email}: ${result.error}`)
    }
  }

  const duration = Date.now() - startTime
  console.log(`   ✅ Correctly rejected: ${success}, ❌ Issues: ${failed} (${duration}ms)`)

  return { operation: 'Wrong Password Rejection', success, failed, errors, duration }
}

// Test 6: Session refresh
async function testSessionRefresh(users: TestUser[]): Promise<TestResult> {
  console.log('\n🔃 Test 6: Testing session refresh...')
  const startTime = Date.now()
  const errors: string[] = []
  let success = 0
  let failed = 0

  const testSubset = users.slice(0, Math.min(20, users.length))

  const results = await runInBatches(testSubset, BATCH_SIZE, async (user) => {
    try {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      // Sign in first
      const { error: signInError } = await client.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })

      if (signInError) {
        throw signInError
      }

      // Refresh the session
      const { data, error: refreshError } = await client.auth.refreshSession()

      if (refreshError) {
        throw refreshError
      }

      if (!data.session) {
        throw new Error('No session after refresh')
      }

      await client.auth.signOut()
      return { success: true, user }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { success: false, error: message, user }
    }
  })

  for (const result of results) {
    if (result.success) {
      success++
    } else {
      failed++
      errors.push(`${result.user.email}: ${result.error}`)
    }
  }

  const duration = Date.now() - startTime
  console.log(`   ✅ Sessions refreshed: ${success}, ❌ Failed: ${failed} (${duration}ms)`)

  return { operation: 'Session Refresh', success, failed, errors, duration }
}

// Cleanup: Delete all test users
async function cleanupUsers(users: TestUser[]): Promise<void> {
  console.log('\n🧹 Cleaning up test users...')

  const usersWithIds = users.filter(u => u.id)
  let deleted = 0
  let failed = 0

  await runInBatches(usersWithIds, BATCH_SIZE, async (user) => {
    try {
      if (user.id) {
        await adminClient.auth.admin.deleteUser(user.id)
        deleted++
      }
    } catch {
      failed++
    }
  })

  console.log(`   ✅ Deleted: ${deleted}, ❌ Failed to delete: ${failed}`)
}

// Print summary report
function printReport(results: TestResult[]): void {
  console.log('\n' + '='.repeat(60))
  console.log('📊 AUTHENTICATION LOAD TEST REPORT')
  console.log('='.repeat(60))

  let totalSuccess = 0
  let totalFailed = 0
  let totalDuration = 0

  for (const result of results) {
    console.log(`\n${result.operation}:`)
    console.log(`  ✅ Success: ${result.success}`)
    console.log(`  ❌ Failed: ${result.failed}`)
    console.log(`  ⏱️  Duration: ${result.duration}ms`)

    if (result.errors.length > 0 && result.errors.length <= 5) {
      console.log(`  Errors:`)
      result.errors.forEach(e => console.log(`    - ${e}`))
    } else if (result.errors.length > 5) {
      console.log(`  First 5 errors:`)
      result.errors.slice(0, 5).forEach(e => console.log(`    - ${e}`))
      console.log(`    ... and ${result.errors.length - 5} more`)
    }

    totalSuccess += result.success
    totalFailed += result.failed
    totalDuration += result.duration
  }

  console.log('\n' + '-'.repeat(60))
  console.log('TOTALS:')
  console.log(`  ✅ Total Successful Operations: ${totalSuccess}`)
  console.log(`  ❌ Total Failed Operations: ${totalFailed}`)
  console.log(`  ⏱️  Total Duration: ${totalDuration}ms`)
  console.log(`  📈 Success Rate: ${((totalSuccess / (totalSuccess + totalFailed)) * 100).toFixed(2)}%`)
  console.log('='.repeat(60))
}

// Main test runner
async function main() {
  console.log('🚀 Starting Authentication Load Test')
  console.log(`   Testing with ${NUM_USERS} users`)
  console.log(`   Supabase URL: ${SUPABASE_URL}`)
  console.log(`   Batch size: ${BATCH_SIZE}`)

  const results: TestResult[] = []

  try {
    // Generate test users
    const users = generateTestUsers(NUM_USERS)

    // Run all tests
    results.push(await testUserCreation(users))
    results.push(await testSignIn(users))
    results.push(await testPasswordReset(users))
    results.push(await testConcurrentSignIn(users))
    results.push(await testWrongPassword(users))
    results.push(await testSessionRefresh(users))

    // Print report
    printReport(results)

    // Cleanup
    await cleanupUsers(users)

    console.log('\n✅ Load test completed!')

  } catch (error) {
    console.error('\n❌ Load test failed:', error)
    process.exit(1)
  }
}

// Run the test
main()
