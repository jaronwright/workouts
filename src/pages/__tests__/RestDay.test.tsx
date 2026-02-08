import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { RestDayPage } from '../RestDay'

describe('RestDayPage', () => {
  it('renders recovery day heading', () => {
    render(<RestDayPage />)
    expect(screen.getByText('Recovery Day')).toBeInTheDocument()
  })

  it('renders rest day activities', () => {
    render(<RestDayPage />)
    // Should have at least one activity card
    expect(screen.getByText(/Rest is when your muscles grow/)).toBeInTheDocument()
  })

  it('does not show completion message initially', () => {
    render(<RestDayPage />)
    expect(screen.queryByText(/Great job/)).not.toBeInTheDocument()
  })

  describe('pluralization', () => {
    it('uses singular "activity" for 1 completed', async () => {
      const user = userEvent.setup()
      render(<RestDayPage />)

      // Find activity cards by their names
      const cards = screen.getAllByText(/Walking|Foam Rolling|Stretching|Meditation|Swimming|Hydration|Sleep|Cold/i)
      await user.click(cards[0].closest('[class*="cursor-pointer"]')!)

      expect(screen.getByText(/1 recovery activity today/)).toBeInTheDocument()
    })

    it('uses plural "activities" for 2+ completed', async () => {
      const user = userEvent.setup()
      render(<RestDayPage />)

      const cards = screen.getAllByText(/Walking|Foam Rolling|Stretching|Meditation|Swimming|Hydration|Sleep|Cold/i)
      await user.click(cards[0].closest('[class*="cursor-pointer"]')!)
      await user.click(cards[1].closest('[class*="cursor-pointer"]')!)

      expect(screen.getByText(/2 recovery activities today/)).toBeInTheDocument()
    })
  })

  it('toggles activity completion on click', async () => {
    const user = userEvent.setup()
    render(<RestDayPage />)

    const cards = screen.getAllByText(/Walking|Foam Rolling|Stretching|Meditation|Swimming|Hydration|Sleep|Cold/i)
    const card = cards[0].closest('[class*="cursor-pointer"]')!

    // Complete it
    await user.click(card)
    expect(screen.getByText(/1 recovery activity/)).toBeInTheDocument()

    // Toggle it off
    await user.click(card)
    expect(screen.queryByText(/recovery activit/)).not.toBeInTheDocument()
  })
})
