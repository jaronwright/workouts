export interface ParsedSetReps {
  sets: number | null
  repsMin: number | null
  repsMax: number | null
  repsUnit: string
  isPerSide: boolean
  durationMinutes: number | null
}

export function parseSetReps(input: string): ParsedSetReps {
  const result: ParsedSetReps = {
    sets: null,
    repsMin: null,
    repsMax: null,
    repsUnit: 'reps',
    isPerSide: false,
    durationMinutes: null
  }

  if (!input || input === '—') {
    return result
  }

  const trimmed = input.trim()

  // Handle duration formats: "5 min", "2 min"
  const durationMatch = trimmed.match(/^(\d+)\s*min$/i)
  if (durationMatch) {
    result.durationMinutes = parseInt(durationMatch[1], 10)
    result.repsUnit = 'minutes'
    return result
  }

  // Handle seconds format: "2x30 sec", "3x45 sec"
  const secMatch = trimmed.match(/^(\d+)x(\d+)\s*sec$/i)
  if (secMatch) {
    result.sets = parseInt(secMatch[1], 10)
    result.repsMin = parseInt(secMatch[2], 10)
    result.repsMax = result.repsMin
    result.repsUnit = 'seconds'
    return result
  }

  // Check for /side or /leg suffix
  const perSideMatch = trimmed.match(/\/(?:side|leg)$/i)
  if (perSideMatch) {
    result.isPerSide = true
  }

  // Handle steps format: "2x10 steps/side"
  const stepsMatch = trimmed.match(/^(\d+)x(\d+)\s*steps/i)
  if (stepsMatch) {
    result.sets = parseInt(stepsMatch[1], 10)
    result.repsMin = parseInt(stepsMatch[2], 10)
    result.repsMax = result.repsMin
    result.repsUnit = 'steps'
    return result
  }

  // Clean up the string for standard parsing
  const cleaned = trimmed.replace(/\/(?:side|leg)$/i, '').trim()

  // Handle standard formats: "4x6-8", "3x12", "3x10-12"
  const standardMatch = cleaned.match(/^(\d+)x(\d+)(?:-(\d+))?$/)
  if (standardMatch) {
    result.sets = parseInt(standardMatch[1], 10)
    result.repsMin = parseInt(standardMatch[2], 10)
    result.repsMax = standardMatch[3] ? parseInt(standardMatch[3], 10) : result.repsMin
    return result
  }

  return result
}

export function formatSetReps(exercise: {
  sets: number | null
  reps_min: number | null
  reps_max: number | null
  reps_unit: string
  is_per_side: boolean
}): string {
  const { sets, reps_min, reps_max, reps_unit, is_per_side } = exercise

  if (!sets && !reps_min) {
    return '—'
  }

  let result = ''

  if (sets) {
    result += `${sets}x`
  }

  if (reps_min !== null) {
    if (reps_max !== null && reps_max !== reps_min) {
      result += `${reps_min}-${reps_max}`
    } else {
      result += `${reps_min}`
    }
  }

  if (reps_unit && reps_unit !== 'reps') {
    result += ` ${reps_unit}`
  }

  if (is_per_side) {
    result += '/side'
  }

  return result || '—'
}
