import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { AvatarUpload } from '../AvatarUpload'

// Track mutation state for controlling test behavior
let mockAvatarUrl: string | null = null
let mockUploadMutate: ReturnType<typeof vi.fn>
let mockRemoveMutate: ReturnType<typeof vi.fn>
let mockUploadIsPending = false
let mockRemoveIsPending = false

vi.mock('@/hooks/useAvatar', () => ({
  useAvatarUrl: () => mockAvatarUrl,
  useUploadAvatar: () => ({
    mutate: mockUploadMutate,
    isPending: mockUploadIsPending,
  }),
  useRemoveAvatar: () => ({
    mutate: mockRemoveMutate,
    isPending: mockRemoveIsPending,
  }),
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

describe('AvatarUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAvatarUrl = null
    mockUploadMutate = vi.fn()
    mockRemoveMutate = vi.fn()
    mockUploadIsPending = false
    mockRemoveIsPending = false
  })

  it('renders fallback avatar when no photo', () => {
    const { container } = render(<AvatarUpload />)
    // Should not show an <img> with avatar src (only the icon-based fallback)
    expect(screen.queryByRole('img', { name: 'Your avatar' })).toBeNull()
    // Camera button should exist
    expect(container.querySelector('button')).toBeTruthy()
  })

  it('renders avatar image when photo exists', () => {
    mockAvatarUrl = 'https://example.com/avatar.webp'
    render(<AvatarUpload />)
    const img = screen.getByRole('img', { name: 'Your avatar' })
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.webp')
  })

  it('shows "Remove photo" link when avatar exists', () => {
    mockAvatarUrl = 'https://example.com/avatar.webp'
    render(<AvatarUpload />)
    expect(screen.getByText('Remove photo')).toBeInTheDocument()
  })

  it('hides "Remove photo" link when no avatar', () => {
    render(<AvatarUpload />)
    expect(screen.queryByText('Remove photo')).toBeNull()
  })

  it('shows "Removing..." text when remove is pending', () => {
    mockAvatarUrl = 'https://example.com/avatar.webp'
    mockRemoveIsPending = true
    render(<AvatarUpload />)
    expect(screen.getByText('Removing...')).toBeInTheDocument()
    // "Remove photo" should be hidden while removing
    expect(screen.queryByText('Remove photo')).toBeNull()
  })

  it('has a hidden file input with correct accept types', () => {
    const { container } = render(<AvatarUpload />)
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeTruthy()
    expect(input?.getAttribute('accept')).toBe('image/jpeg,image/png,image/webp')
    expect(input?.className).toContain('hidden')
  })

  it('calls removeAvatar.mutate when "Remove photo" is clicked', () => {
    mockAvatarUrl = 'https://example.com/avatar.webp'
    render(<AvatarUpload />)
    fireEvent.click(screen.getByText('Remove photo'))
    expect(mockRemoveMutate).toHaveBeenCalled()
  })
})
