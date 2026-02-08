import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform } from 'motion/react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 1.2, className = '' }: AnimatedCounterProps) {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  })
  const rounded = useTransform(spring, (v) => Math.round(v))

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = String(latest)
      }
    })
    return unsubscribe
  }, [rounded])

  if (prefersReduced) {
    return <span className={className}>{value}</span>
  }

  // Render value as children so it's always in the DOM (important for SSR/tests)
  // The imperative textContent update will override this during animation
  return <span ref={ref} className={className}>{value}</span>
}
