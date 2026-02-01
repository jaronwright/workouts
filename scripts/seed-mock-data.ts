import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper to generate random weight
const randomWeight = (min: number, max: number) =>
  Math.round((Math.random() * (max - min) + min) / 5) * 5

// Helper to subtract days from a date
const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

async function seedMockData() {
  console.log('Starting mock data seed...')

  // Get the test user - you'll need to replace this with your user ID
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('Please log in first. Run the app and log in, then run this script.')
    return
  }

  console.log('Using user:', user.email)

  // Get workout days
  const { data: workoutDays, error: daysError } = await supabase
    .from('workout_days')
    .select('id, name')
    .order('day_number')

  if (daysError || !workoutDays?.length) {
    console.error('No workout days found. Please run the initial seed first.')
    return
  }

  // Get all exercises
  const { data: exercises, error: exercisesError } = await supabase
    .from('plan_exercises')
    .select('id, name, section_id, sets, reps_min, reps_unit')

  if (exercisesError || !exercises?.length) {
    console.error('No exercises found.')
    return
  }

  // Get sections to map exercises to workout days
  const { data: sections } = await supabase
    .from('exercise_sections')
    .select('id, workout_day_id')

  const sectionToDayMap = new Map(sections?.map(s => [s.id, s.workout_day_id]) || [])

  // Group exercises by workout day
  const exercisesByDay = new Map<string, typeof exercises>()
  exercises.forEach(ex => {
    const dayId = sectionToDayMap.get(ex.section_id)
    if (dayId) {
      if (!exercisesByDay.has(dayId)) {
        exercisesByDay.set(dayId, [])
      }
      exercisesByDay.get(dayId)!.push(ex)
    }
  })

  // Create mock sessions for the past 3 weeks
  const mockSessions = [
    // Week 1
    { dayIndex: 0, daysAgo: 21, completed: true },  // Push
    { dayIndex: 1, daysAgo: 19, completed: true },  // Pull
    { dayIndex: 2, daysAgo: 17, completed: true },  // Legs
    // Week 2
    { dayIndex: 0, daysAgo: 14, completed: true },  // Push
    { dayIndex: 1, daysAgo: 12, completed: true },  // Pull
    { dayIndex: 2, daysAgo: 10, completed: true },  // Legs
    // Week 3
    { dayIndex: 0, daysAgo: 7, completed: true },   // Push
    { dayIndex: 1, daysAgo: 5, completed: true },   // Pull
    { dayIndex: 2, daysAgo: 3, completed: true },   // Legs
    // This week
    { dayIndex: 0, daysAgo: 1, completed: true },   // Push (yesterday)
  ]

  console.log(`Creating ${mockSessions.length} workout sessions...`)

  for (const session of mockSessions) {
    const workoutDay = workoutDays[session.dayIndex]
    const startedAt = daysAgo(session.daysAgo)

    // Add some randomness to the time (between 6am and 8pm)
    const startDate = new Date(startedAt)
    startDate.setHours(6 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60))

    const completedAt = session.completed
      ? new Date(startDate.getTime() + (45 + Math.random() * 30) * 60 * 1000).toISOString() // 45-75 min workout
      : null

    // Create the session
    const { data: newSession, error: sessionError } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        workout_day_id: workoutDay.id,
        started_at: startDate.toISOString(),
        completed_at: completedAt
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      continue
    }

    console.log(`Created session: ${workoutDay.name} - ${startDate.toLocaleDateString()}`)

    // Get exercises for this workout day
    const dayExercises = exercisesByDay.get(workoutDay.id) || []

    // Log sets for each exercise
    for (const exercise of dayExercises) {
      // Determine weight based on exercise type
      let weight: number | null = null
      const exName = exercise.name.toLowerCase()

      if (exercise.reps_unit === 'minutes' || exercise.reps_unit === 'seconds' || exercise.reps_unit === 'steps') {
        weight = null // Cardio/timed exercises
      } else if (exName.includes('band') || exName.includes('push-up') || exName.includes('pull-up') || exName.includes('plank') || exName.includes('hang') || exName.includes('crunch')) {
        weight = null // Bodyweight exercises
      } else if (exName.includes('bench press')) {
        weight = randomWeight(135, 185)
      } else if (exName.includes('squat') || exName.includes('deadlift')) {
        weight = randomWeight(185, 275)
      } else if (exName.includes('db') || exName.includes('dumbbell')) {
        weight = randomWeight(25, 50)
      } else if (exName.includes('cable') || exName.includes('rope')) {
        weight = randomWeight(30, 70)
      } else if (exName.includes('row')) {
        weight = randomWeight(100, 160)
      } else if (exName.includes('curl')) {
        weight = randomWeight(20, 40)
      } else if (exName.includes('press')) {
        weight = randomWeight(95, 135)
      } else if (exName.includes('extension')) {
        weight = randomWeight(30, 60)
      } else if (exName.includes('dip')) {
        weight = randomWeight(0, 45) // Could be bodyweight or weighted
      } else if (exName.includes('lat pulldown')) {
        weight = randomWeight(100, 160)
      } else if (exName.includes('leg')) {
        weight = randomWeight(90, 180)
      } else if (exName.includes('calf')) {
        weight = randomWeight(100, 200)
      } else {
        weight = randomWeight(50, 100) // Default
      }

      // Create a single set entry to mark exercise as complete
      const { error: setError } = await supabase
        .from('exercise_sets')
        .insert({
          session_id: newSession.id,
          plan_exercise_id: exercise.id,
          set_number: 1,
          reps_completed: exercise.reps_min,
          weight_used: weight,
          completed: true
        })

      if (setError) {
        console.error('Error creating set:', setError)
      }
    }
  }

  console.log('Mock data seed complete!')
}

seedMockData().catch(console.error)
