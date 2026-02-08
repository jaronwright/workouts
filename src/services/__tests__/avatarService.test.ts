import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAvatarPublicUrl, uploadAvatar, removeAvatarFile, removeAllUserAvatars } from '../avatarService'

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn().mockResolvedValue(new Blob(['compressed'], { type: 'image/webp' })),
}))

// Mock Supabase
const mockUpload = vi.fn()
const mockRemove = vi.fn()
const mockList = vi.fn()
const mockGetPublicUrl = vi.fn()

vi.mock('../supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
        list: mockList,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  },
}))

describe('avatarService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAvatarPublicUrl', () => {
    it('returns the public URL for a storage path', () => {
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/storage/avatars/user-123/avatar.webp' },
      })

      const url = getAvatarPublicUrl('user-123/avatar.webp')
      expect(url).toBe('https://example.com/storage/avatars/user-123/avatar.webp')
    })
  })

  describe('uploadAvatar', () => {
    it('rejects files with invalid MIME type', async () => {
      const file = new File(['data'], 'test.gif', { type: 'image/gif' })
      await expect(uploadAvatar('user-123', file)).rejects.toThrow('File must be JPEG, PNG, or WebP')
    })

    it('rejects files larger than 10MB', async () => {
      const bigData = new Uint8Array(11 * 1024 * 1024)
      const file = new File([bigData], 'big.png', { type: 'image/png' })
      await expect(uploadAvatar('user-123', file)).rejects.toThrow('File must be smaller than 10MB')
    })

    it('compresses and uploads valid file', async () => {
      mockUpload.mockResolvedValue({ error: null })

      const file = new File(['data'], 'photo.png', { type: 'image/png' })
      const path = await uploadAvatar('user-123', file)

      expect(path).toMatch(/^user-123\/avatar-\d+\.webp$/)
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^user-123\/avatar-\d+\.webp$/),
        expect.any(Blob),
        { contentType: 'image/webp', upsert: false }
      )
    })

    it('throws on upload error', async () => {
      mockUpload.mockResolvedValue({ error: new Error('Storage full') })

      const file = new File(['data'], 'photo.png', { type: 'image/png' })
      await expect(uploadAvatar('user-123', file)).rejects.toThrow('Storage full')
    })

    it('accepts JPEG files', async () => {
      mockUpload.mockResolvedValue({ error: null })
      const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
      const path = await uploadAvatar('user-123', file)
      expect(path).toMatch(/^user-123\/avatar-\d+\.webp$/)
    })

    it('accepts WebP files', async () => {
      mockUpload.mockResolvedValue({ error: null })
      const file = new File(['data'], 'photo.webp', { type: 'image/webp' })
      const path = await uploadAvatar('user-123', file)
      expect(path).toMatch(/^user-123\/avatar-\d+\.webp$/)
    })
  })

  describe('removeAvatarFile', () => {
    it('removes a file by path', async () => {
      mockRemove.mockResolvedValue({ error: null })
      await removeAvatarFile('user-123/avatar-1234.webp')
      expect(mockRemove).toHaveBeenCalledWith(['user-123/avatar-1234.webp'])
    })

    it('throws on remove error', async () => {
      mockRemove.mockResolvedValue({ error: new Error('Not found') })
      await expect(removeAvatarFile('user-123/missing.webp')).rejects.toThrow('Not found')
    })
  })

  describe('removeAllUserAvatars', () => {
    it('lists and removes all files in user folder', async () => {
      mockList.mockResolvedValue({
        data: [{ name: 'avatar-1.webp' }, { name: 'avatar-2.webp' }],
        error: null,
      })
      mockRemove.mockResolvedValue({ error: null })

      await removeAllUserAvatars('user-123')

      expect(mockList).toHaveBeenCalledWith('user-123')
      expect(mockRemove).toHaveBeenCalledWith([
        'user-123/avatar-1.webp',
        'user-123/avatar-2.webp',
      ])
    })

    it('does nothing when folder is empty', async () => {
      mockList.mockResolvedValue({ data: [], error: null })

      await removeAllUserAvatars('user-123')

      expect(mockRemove).not.toHaveBeenCalled()
    })

    it('throws on list error', async () => {
      mockList.mockResolvedValue({ data: null, error: new Error('Access denied') })
      await expect(removeAllUserAvatars('user-123')).rejects.toThrow('Access denied')
    })

    it('throws on remove error', async () => {
      mockList.mockResolvedValue({
        data: [{ name: 'avatar-1.webp' }],
        error: null,
      })
      mockRemove.mockResolvedValue({ error: new Error('Remove failed') })
      await expect(removeAllUserAvatars('user-123')).rejects.toThrow('Remove failed')
    })
  })
})
