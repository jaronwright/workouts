import { describe, it, expect } from 'vitest'
import {
  PPL_PLAN_ID,
  UPPER_LOWER_PLAN_ID,
  MOBILITY_PLAN_ID,
  FULL_BODY_PLAN_ID,
  BRO_SPLIT_PLAN_ID,
  ARNOLD_SPLIT_PLAN_ID,
  SPLIT_NAMES,
} from '@/config/planConstants'

describe('planConstants', () => {
  it('exports all plan IDs', () => {
    expect(PPL_PLAN_ID).toBe('00000000-0000-0000-0000-000000000001')
    expect(UPPER_LOWER_PLAN_ID).toBe('00000000-0000-0000-0000-000000000002')
    expect(MOBILITY_PLAN_ID).toBe('00000000-0000-0000-0000-000000000003')
    expect(FULL_BODY_PLAN_ID).toBe('00000000-0000-0000-0000-000000000004')
    expect(BRO_SPLIT_PLAN_ID).toBe('00000000-0000-0000-0000-000000000005')
    expect(ARNOLD_SPLIT_PLAN_ID).toBe('00000000-0000-0000-0000-000000000006')
  })

  it('all plan IDs are unique', () => {
    const ids = [PPL_PLAN_ID, UPPER_LOWER_PLAN_ID, MOBILITY_PLAN_ID, FULL_BODY_PLAN_ID, BRO_SPLIT_PLAN_ID, ARNOLD_SPLIT_PLAN_ID]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('SPLIT_NAMES has entries for all 5 weight splits', () => {
    expect(SPLIT_NAMES[PPL_PLAN_ID]).toBe('Push / Pull / Legs')
    expect(SPLIT_NAMES[UPPER_LOWER_PLAN_ID]).toBe('Upper / Lower')
    expect(SPLIT_NAMES[FULL_BODY_PLAN_ID]).toBe('Full Body')
    expect(SPLIT_NAMES[BRO_SPLIT_PLAN_ID]).toBe('Bro Split')
    expect(SPLIT_NAMES[ARNOLD_SPLIT_PLAN_ID]).toBe('Arnold Split')
  })

  it('SPLIT_NAMES does not include mobility', () => {
    expect(SPLIT_NAMES[MOBILITY_PLAN_ID]).toBeUndefined()
  })
})
