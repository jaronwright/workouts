import { describe, it, expect } from 'vitest'
import {
  springs,
  pageTransition,
  staggerContainer,
  staggerChild,
} from '@/config/animationConfig'

describe('animationConfig', () => {
  describe('springs', () => {
    it('exports all spring presets', () => {
      expect(springs.default).toBeDefined()
      expect(springs.gentle).toBeDefined()
      expect(springs.snappy).toBeDefined()
      expect(springs.slow).toBeDefined()
    })

    it('all springs use type "spring"', () => {
      const springKeys = ['default', 'gentle', 'snappy', 'slow'] as const
      springKeys.forEach((key) => {
        expect(springs[key]).toHaveProperty('type', 'spring')
      })
    })

    it('all springs have positive stiffness and damping', () => {
      const springKeys = ['default', 'gentle', 'snappy', 'slow'] as const
      springKeys.forEach((key) => {
        const spring = springs[key] as { stiffness: number; damping: number }
        expect(spring.stiffness).toBeGreaterThan(0)
        expect(spring.damping).toBeGreaterThan(0)
      })
    })

    it('snappy has the highest stiffness', () => {
      const snappy = springs.snappy as { stiffness: number }
      const defaultSpring = springs.default as { stiffness: number }
      const gentle = springs.gentle as { stiffness: number }
      const slow = springs.slow as { stiffness: number }
      expect(snappy.stiffness).toBeGreaterThan(defaultSpring.stiffness)
      expect(snappy.stiffness).toBeGreaterThan(gentle.stiffness)
      expect(snappy.stiffness).toBeGreaterThan(slow.stiffness)
    })

    it('slow has the lowest stiffness', () => {
      const slow = springs.slow as { stiffness: number }
      const defaultSpring = springs.default as { stiffness: number }
      const gentle = springs.gentle as { stiffness: number }
      const snappy = springs.snappy as { stiffness: number }
      expect(slow.stiffness).toBeLessThan(defaultSpring.stiffness)
      expect(slow.stiffness).toBeLessThan(gentle.stiffness)
      expect(slow.stiffness).toBeLessThan(snappy.stiffness)
    })

    it('has exactly 4 spring presets', () => {
      expect(Object.keys(springs)).toHaveLength(4)
    })

    it('default spring has specific values', () => {
      const def = springs.default as { stiffness: number; damping: number }
      expect(def.stiffness).toBe(300)
      expect(def.damping).toBe(30)
    })

    it('gentle spring has specific values', () => {
      const gentle = springs.gentle as { stiffness: number; damping: number }
      expect(gentle.stiffness).toBe(200)
      expect(gentle.damping).toBe(25)
    })

    it('snappy spring has specific values', () => {
      const snappy = springs.snappy as { stiffness: number; damping: number }
      expect(snappy.stiffness).toBe(400)
      expect(snappy.damping).toBe(28)
    })

    it('slow spring has specific values', () => {
      const slow = springs.slow as { stiffness: number; damping: number }
      expect(slow.stiffness).toBe(150)
      expect(slow.damping).toBe(20)
    })
  })

  describe('pageTransition', () => {
    it('has initial, animate, and exit states', () => {
      expect(pageTransition.initial).toBeDefined()
      expect(pageTransition.animate).toBeDefined()
      expect(pageTransition.exit).toBeDefined()
    })

    it('initial state has zero opacity and positive y offset', () => {
      const initial = pageTransition.initial as { opacity: number; y: number }
      expect(initial.opacity).toBe(0)
      expect(initial.y).toBeGreaterThan(0)
    })

    it('animate state has full opacity and zero y', () => {
      const animate = pageTransition.animate as { opacity: number; y: number }
      expect(animate.opacity).toBe(1)
      expect(animate.y).toBe(0)
    })

    it('animate state uses spring transition', () => {
      const animate = pageTransition.animate as {
        transition: { type: string; stiffness: number; damping: number }
      }
      expect(animate.transition.type).toBe('spring')
      expect(animate.transition.stiffness).toBe(300)
      expect(animate.transition.damping).toBe(30)
    })

    it('exit state has zero opacity and negative y offset', () => {
      const exit = pageTransition.exit as { opacity: number; y: number }
      expect(exit.opacity).toBe(0)
      expect(exit.y).toBeLessThan(0)
    })

    it('exit state uses duration-based transition for quick disappearance', () => {
      const exit = pageTransition.exit as {
        transition: { duration: number }
      }
      expect(exit.transition.duration).toBe(0.15)
    })
  })

  describe('staggerContainer', () => {
    it('has hidden and visible states', () => {
      expect(staggerContainer.hidden).toBeDefined()
      expect(staggerContainer.visible).toBeDefined()
    })

    it('hidden state has zero opacity', () => {
      const hidden = staggerContainer.hidden as { opacity: number }
      expect(hidden.opacity).toBe(0)
    })

    it('visible state has full opacity', () => {
      const visible = staggerContainer.visible as { opacity: number }
      expect(visible.opacity).toBe(1)
    })

    it('visible state defines staggerChildren timing', () => {
      const visible = staggerContainer.visible as {
        transition: { staggerChildren: number }
      }
      expect(visible.transition.staggerChildren).toBe(0.06)
    })

    it('staggerChildren is a positive number', () => {
      const visible = staggerContainer.visible as {
        transition: { staggerChildren: number }
      }
      expect(visible.transition.staggerChildren).toBeGreaterThan(0)
    })
  })

  describe('staggerChild', () => {
    it('has hidden and visible states', () => {
      expect(staggerChild.hidden).toBeDefined()
      expect(staggerChild.visible).toBeDefined()
    })

    it('hidden state has zero opacity and positive y offset', () => {
      const hidden = staggerChild.hidden as { opacity: number; y: number }
      expect(hidden.opacity).toBe(0)
      expect(hidden.y).toBeGreaterThan(0)
    })

    it('visible state has full opacity and zero y', () => {
      const visible = staggerChild.visible as { opacity: number; y: number }
      expect(visible.opacity).toBe(1)
      expect(visible.y).toBe(0)
    })

    it('visible state uses spring transition', () => {
      const visible = staggerChild.visible as {
        transition: { type: string; stiffness: number; damping: number }
      }
      expect(visible.transition.type).toBe('spring')
      expect(visible.transition.stiffness).toBe(300)
      expect(visible.transition.damping).toBe(30)
    })

    it('hidden y offset matches staggerChild offset of 12', () => {
      const staggerHidden = staggerChild.hidden as { y: number }
      expect(staggerHidden.y).toBe(12)
    })
  })

  describe('consistency across variants', () => {
    it('all hidden states start with opacity 0', () => {
      const variants = [
        staggerContainer,
        staggerChild,
      ]
      variants.forEach((variant) => {
        const hidden = variant.hidden as { opacity: number }
        expect(hidden.opacity).toBe(0)
      })
    })

    it('pageTransition initial state starts with opacity 0', () => {
      const initial = pageTransition.initial as { opacity: number }
      expect(initial.opacity).toBe(0)
    })
  })
})
