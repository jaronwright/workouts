import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Avatar } from '../Avatar'

describe('Avatar', () => {
  it('renders fallback User icon when no src', () => {
    const { container } = render(<Avatar />)
    // Should render the fallback div (not an img)
    expect(container.querySelector('img')).toBeNull()
    // Should have the default md size class
    expect(container.querySelector('.w-10')).toBeTruthy()
  })

  it('renders img when src is provided', () => {
    render(<Avatar src="https://example.com/photo.webp" alt="Test" />)
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/photo.webp')
  })

  it('renders fallback when src is null', () => {
    const { container } = render(<Avatar src={null} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('applies sm size classes', () => {
    const { container } = render(<Avatar size="sm" />)
    expect(container.querySelector('.w-8')).toBeTruthy()
  })

  it('applies md size classes', () => {
    const { container } = render(<Avatar size="md" />)
    expect(container.querySelector('.w-10')).toBeTruthy()
  })

  it('applies lg size classes', () => {
    const { container } = render(<Avatar size="lg" />)
    expect(container.querySelector('.w-16')).toBeTruthy()
  })

  it('applies custom className', () => {
    const { container } = render(<Avatar className="my-custom" />)
    expect(container.querySelector('.my-custom')).toBeTruthy()
  })

  it('applies custom className to img variant', () => {
    render(<Avatar src="https://example.com/photo.webp" className="my-custom" alt="Test" />)
    const img = screen.getByRole('img', { name: 'Test' })
    expect(img.className).toContain('my-custom')
  })

  it('uses default alt text', () => {
    render(<Avatar src="https://example.com/photo.webp" />)
    expect(screen.getByRole('img', { name: 'Avatar' })).toBeInTheDocument()
  })
})
