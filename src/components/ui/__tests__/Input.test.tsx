import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { Input } from '../Input'

describe('Input', () => {
  it('renders a basic input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Username" id="username" />)
    const label = screen.getByText('Username')
    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', 'username')
  })

  it('does not render label when not provided', () => {
    render(<Input placeholder="No label" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('does not render error message when not provided', () => {
    render(<Input placeholder="No error" />)
    const input = screen.getByPlaceholderText('No error')
    expect(input.className).not.toContain('border-[var(--color-danger)]')
  })

  it('applies error styling when error is provided', () => {
    render(<Input error="Error" placeholder="error-input" />)
    const input = screen.getByPlaceholderText('error-input')
    expect(input.className).toContain('border-[var(--color-danger)]')
  })

  it('applies normal border styling when no error', () => {
    render(<Input placeholder="normal-input" />)
    const input = screen.getByPlaceholderText('normal-input')
    expect(input.className).toContain('border-[var(--color-border)]')
  })

  it('handles onChange events', async () => {
    const handleChange = vi.fn()
    const user = userEvent.setup()
    render(<Input onChange={handleChange} placeholder="type here" />)

    const input = screen.getByPlaceholderText('type here')
    await user.type(input, 'hello')

    expect(handleChange).toHaveBeenCalledTimes(5)
  })

  it('supports disabled state', () => {
    render(<Input disabled placeholder="disabled-input" />)
    const input = screen.getByPlaceholderText('disabled-input')
    expect(input).toBeDisabled()
  })

  it('forwards ref correctly', () => {
    const ref = createRef<HTMLInputElement>()
    render(<Input ref={ref} placeholder="ref-input" />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current?.placeholder).toBe('ref-input')
  })

  it('applies custom className', () => {
    render(<Input className="my-custom-class" placeholder="custom" />)
    const input = screen.getByPlaceholderText('custom')
    expect(input.className).toContain('my-custom-class')
  })

  it('passes through additional HTML attributes', () => {
    render(<Input type="email" name="email" placeholder="email" />)
    const input = screen.getByPlaceholderText('email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('name', 'email')
  })
})
