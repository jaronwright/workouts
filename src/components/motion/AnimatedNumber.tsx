import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'

interface AnimatedNumberProps {
  /** The target numeric value to animate toward */
  value: number
  /** Animation duration hint in seconds (used as spring damping guide) */
  duration?: number
  /** Optional formatter (e.g., to add units or decimal places) */
  formatFn?: (value: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1.2,
  formatFn,
  className,
}: AnimatedNumberProps) {
  const prefersReduced = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  })
  const display = useTransform(spring, (v) => {
    const rounded = Math.round(v)
    return formatFn ? formatFn(rounded) : String(rounded)
  })

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest
      }
    })
    return unsubscribe
  }, [display])

  if (prefersReduced) {
    const text = formatFn ? formatFn(value) : String(value)
    return <span className={className}>{text}</span>
  }

  const initialText = formatFn ? formatFn(value) : String(value)
  return (
    <span ref={ref} className={className}>
      {initialText}
    </span>
  )
}
