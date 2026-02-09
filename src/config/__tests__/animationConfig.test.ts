import { describe, it, expect } from 'vitest'
import {
  springs,
  cardVariants,
  fadeInVariants,
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

  describe('cardVariants', () => {
    it('has hidden and visible states', () => {
      expect(cardVariants.hidden).toBeDefined()
      expect(cardVariants.visible).toBeDefined()
    })

    it('hidden state has zero opacity and positive y offset', () => {
      const hidden = cardVariants.hidden as { opacity: number; y: number }
      expect(hidden.opacity).toBe(0)
      expect(hidden.y).toBeGreaterThan(0)
    })

    it('visible is a function that accepts a custom index', () => {
      expect(typeof cardVariants.visible).toBe('function')
      const visibleFn = cardVariants.visible as (i?: number) => {
        opacity: number
        y: number
        transition: { delay: number }
      }
      const result = visibleFn(2)
      expect(result.opacity).toBe(1)
      expect(result.y).toBe(0)
      expect(result.transition.delay).toBe(2 * 0.06)
    })

    it('visible function defaults to zero delay when no index provided', () => {
      const visibleFn = cardVariants.visible as (i?: number) => {
        opacity: number
        y: number
        transition: { delay: number }
      }
      const result = visibleFn()
      expect(result.transition.delay).toBe(0)
    })

    it('visible function uses spring transition', () => {
      const visibleFn = cardVariants.visible as (i?: number) => {
        transition: { type: string; stiffness: number; damping: number }
      }
      const result = visibleFn(0)
      expect(result.transition.type).toBe('spring')
      expect(result.transition.stiffness).toBe(300)
      expect(result.transition.damping).toBe(30)
    })
  })

  describe('fadeInVariants', () => {
    it('has hidden and visible states', () => {
      expect(fadeInVariants.hidden).toBeDefined()
      expect(fadeInVariants.visible).toBeDefined()
    })

    it('hidden state has zero opacity', () => {
      const hidden = fadeInVariants.hidden as { opacity: number }
      expect(hidden.opacity).toBe(0)
    })

    it('hidden state does not include y offset (pure fade)', () => {
      const hidden = fadeInVariants.hidden as Record<string, unknown>
      expect(hidden.y).toBeUndefined()
    })

    it('visible state has full opacity', () => {
      const visible = fadeInVariants.visible as { opacity: number }
      expect(visible.opacity).toBe(1)
    })

    it('visible state uses duration-based transition (not spring)', () => {
      const visible = fadeInVariants.visible as {
        transition: { duration: number }
      }
      expect(visible.transition.duration).toBe(0.3)
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

    it('exit is faster than fadeIn', () => {
      const exitDuration = (
        pageTransition.exit as { transition: { duration: number } }
      ).transition.duration
      const fadeInDuration = (
        fadeInVariants.visible as { transition: { duration: number } }
      ).transition.duration
      expect(exitDuration).toBeLessThan(fadeInDuration)
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

    it('hidden y offset matches cardVariants hidden y offset', () => {
      const staggerHidden = staggerChild.hidden as { y: number }
      const cardHidden = cardVariants.hidden as { y: number }
      expect(staggerHidden.y).toBe(cardHidden.y)
    })
  })

  describe('consistency across variants', () => {
    it('all hidden states start with opacity 0', () => {
      const variants = [
        cardVariants,
        fadeInVariants,
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

    it('staggerContainer staggerChildren matches cardVariants delay step', () => {
      const staggerTiming = (
        staggerContainer.visible as {
          transition: { staggerChildren: number }
        }
      ).transition.staggerChildren
      const visibleFn = cardVariants.visible as (i?: number) => {
        transition: { delay: number }
      }
      const delayForIndex1 = visibleFn(1).transition.delay
      expect(staggerTiming).toBe(delayForIndex1)
    })
  })
})
