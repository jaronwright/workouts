import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { CollapsibleSection } from '../CollapsibleSection'

describe('CollapsibleSection', () => {
  describe('rendering', () => {
    it('renders the title', () => {
      render(
        <CollapsibleSection title="Main Exercises">
          <p>Content</p>
        </CollapsibleSection>
      )
      expect(screen.getByText('Main Exercises')).toBeInTheDocument()
    })

    it('renders the subtitle when provided', () => {
      render(
        <CollapsibleSection title="Main Exercises" subtitle="3 exercises">
          <p>Content</p>
        </CollapsibleSection>
      )
      expect(screen.getByText('3 exercises')).toBeInTheDocument()
    })

    it('does not render a subtitle when not provided', () => {
      render(
        <CollapsibleSection title="Main Exercises">
          <p>Content</p>
        </CollapsibleSection>
      )
      expect(screen.queryByText('3 exercises')).not.toBeInTheDocument()
    })

    it('renders children', () => {
      render(
        <CollapsibleSection title="Main Exercises">
          <p>Child content here</p>
        </CollapsibleSection>
      )
      expect(screen.getByText('Child content here')).toBeInTheDocument()
    })
  })

  describe('defaultOpen behavior', () => {
    it('shows children when defaultOpen is true (default)', () => {
      render(
        <CollapsibleSection title="Section">
          <p>Visible content</p>
        </CollapsibleSection>
      )
      const content = screen.getByText('Visible content').closest('div.space-y-3')
      const wrapper = content?.parentElement
      expect(wrapper?.className).toContain('max-h-[2000px]')
      expect(wrapper?.className).toContain('opacity-100')
    })

    it('hides children when defaultOpen is false', () => {
      render(
        <CollapsibleSection title="Section" defaultOpen={false}>
          <p>Hidden content</p>
        </CollapsibleSection>
      )
      const content = screen.getByText('Hidden content').closest('div.space-y-3')
      const wrapper = content?.parentElement
      expect(wrapper?.className).toContain('max-h-0')
      expect(wrapper?.className).toContain('opacity-0')
    })
  })

  describe('toggle behavior', () => {
    it('collapses the section when the toggle button is clicked while open', () => {
      render(
        <CollapsibleSection title="Section">
          <p>Toggle me</p>
        </CollapsibleSection>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      const content = screen.getByText('Toggle me').closest('div.space-y-3')
      const wrapper = content?.parentElement
      expect(wrapper?.className).toContain('max-h-0')
    })

    it('expands the section when the toggle button is clicked while closed', () => {
      render(
        <CollapsibleSection title="Section" defaultOpen={false}>
          <p>Toggle me</p>
        </CollapsibleSection>
      )

      const button = screen.getByRole('button')
      fireEvent.click(button)

      const content = screen.getByText('Toggle me').closest('div.space-y-3')
      const wrapper = content?.parentElement
      expect(wrapper?.className).toContain('max-h-[2000px]')
    })

    it('toggles back and forth on multiple clicks', () => {
      render(
        <CollapsibleSection title="Section">
          <p>Toggle me</p>
        </CollapsibleSection>
      )

      const button = screen.getByRole('button')
      const getWrapper = () =>
        screen.getByText('Toggle me').closest('div.space-y-3')?.parentElement

      // Initially open
      expect(getWrapper()?.className).toContain('max-h-[2000px]')

      // Click to close
      fireEvent.click(button)
      expect(getWrapper()?.className).toContain('max-h-0')

      // Click to open again
      fireEvent.click(button)
      expect(getWrapper()?.className).toContain('max-h-[2000px]')
    })
  })

  describe('chevron rotation', () => {
    it('shows rotate-180 class on chevron when section is open', () => {
      render(
        <CollapsibleSection title="Section">
          <p>Content</p>
        </CollapsibleSection>
      )
      const button = screen.getByRole('button')
      const chevron = button.querySelector('svg')
      expect(chevron?.classList.toString()).toContain('rotate-180')
    })

    it('does not show rotate-180 class on chevron when section is closed', () => {
      render(
        <CollapsibleSection title="Section" defaultOpen={false}>
          <p>Content</p>
        </CollapsibleSection>
      )
      const button = screen.getByRole('button')
      const chevron = button.querySelector('svg')
      expect(chevron?.classList.toString()).not.toContain('rotate-180')
    })

    it('toggles chevron rotation class when clicked', () => {
      render(
        <CollapsibleSection title="Section">
          <p>Content</p>
        </CollapsibleSection>
      )
      const button = screen.getByRole('button')
      const chevron = button.querySelector('svg')

      // Initially open, so rotated
      expect(chevron?.classList.toString()).toContain('rotate-180')

      // Click to close
      fireEvent.click(button)
      expect(chevron?.classList.toString()).not.toContain('rotate-180')
    })
  })
})
