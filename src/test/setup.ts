import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'

// Provide a working localStorage implementation for zustand persist middleware.
// Node.js v22+ has a native localStorage object that requires --localstorage-file,
// which may shadow jsdom's implementation and break storage operations.
const localStorageImpl = (() => {
  let store: Record<string, string> = {}
  return {
    getItem(key: string) { return store[key] ?? null },
    setItem(key: string, value: string) { store[key] = String(value) },
    removeItem(key: string) { delete store[key] },
    clear() { store = {} },
    get length() { return Object.keys(store).length },
    key(index: number) { return Object.keys(store)[index] ?? null }
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageImpl,
  writable: true,
  configurable: true
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

// Mock ResizeObserver
beforeAll(() => {
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

// Mock scrollTo
beforeAll(() => {
  window.scrollTo = vi.fn()
})
