export interface DefaultAvatar {
  key: string
  label: string
  svgPath: string
  viewBox: string
}

export const DEFAULT_AVATARS: DefaultAvatar[] = [
  {
    key: 'bear',
    label: 'Bear',
    viewBox: '0 0 64 64',
    svgPath: 'M16 12a6 6 0 1 0-1 12M48 12a6 6 0 1 1 1 12M32 56c13.255 0 24-9.745 24-22S45.255 12 32 12 8 21.745 8 34s10.745 22 24 22zM24 32a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM40 32a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM28 42c2 3 6 3 8 0',
  },
  {
    key: 'cat',
    label: 'Cat',
    viewBox: '0 0 64 64',
    svgPath: 'M12 16l8 14M52 16l-8 14M32 56c12 0 20-8 20-20S44 12 32 12 12 24 12 36s8 20 20 20zM24 34a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM40 34a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM32 40v3M28 43c2 2 6 2 8 0M20 36l-6 2M44 36l6 2',
  },
  {
    key: 'dog',
    label: 'Dog',
    viewBox: '0 0 64 64',
    svgPath: 'M14 14c-2 8 0 14 4 18M50 14c2 8 0 14-4 18M32 56c12 0 20-8 20-20S44 12 32 12 12 24 12 36s8 20 20 20zM24 32a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM40 32a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM29 41a5 3 0 1 0 6 0M32 38v3',
  },
  {
    key: 'fox',
    label: 'Fox',
    viewBox: '0 0 64 64',
    svgPath: 'M10 10l10 18M54 10l-10 18M32 56c12 0 20-8 20-20S44 12 32 12 12 24 12 36s8 20 20 20zM24 34a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM40 34a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM29 42l3 3 3-3',
  },
  {
    key: 'owl',
    label: 'Owl',
    viewBox: '0 0 64 64',
    svgPath: 'M18 14l6 6M46 14l-6 6M32 56c12 0 20-8 20-20S44 12 32 12 12 24 12 36s8 20 20 20zM21 30a5 5 0 1 0 10 0 5 5 0 0 0-10 0zM33 30a5 5 0 1 0 10 0 5 5 0 0 0-10 0zM24 30a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM36 30a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM30 40l2 3 2-3',
  },
  {
    key: 'rabbit',
    label: 'Rabbit',
    viewBox: '0 0 64 64',
    svgPath: 'M24 4c-2 0-6 4-6 12s2 10 4 12M40 4c2 0 6 4 6 12s-2 10-4 12M32 56c12 0 20-8 20-20S44 16 32 16 12 28 12 40s8 16 20 16zM24 36a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM40 36a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM30 44c1 2 3 2 4 0M32 42v2',
  },
  {
    key: 'wolf',
    label: 'Wolf',
    viewBox: '0 0 64 64',
    svgPath: 'M8 8l12 20M56 8l-12 20M32 56c12 0 20-8 20-20S44 12 32 12 12 24 12 36s8 20 20 20zM24 32a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM40 32a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM28 42l4 4 4-4M18 38l-4 2M46 38l4 2',
  },
  {
    key: 'penguin',
    label: 'Penguin',
    viewBox: '0 0 64 64',
    svgPath: 'M32 56c12 0 20-8 20-22S44 8 32 8 12 22 12 34s8 22 20 22zM20 30c0-6 5-12 12-12s12 6 12 12v8c0 4-5 8-12 8s-12-4-12-8v-8zM26 30a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM38 30a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM29 38c1.5 2 4.5 2 6 0M8 34l6 4M56 34l-6 4',
  },
]

const PREFIX = 'default:'

export function isDefaultAvatar(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX)
}

export function getDefaultAvatarKey(value: string): string {
  return value.replace(PREFIX, '')
}

export function getDefaultAvatarByKey(key: string): DefaultAvatar | undefined {
  return DEFAULT_AVATARS.find((a) => a.key === key)
}

export function getRandomDefaultAvatar(): DefaultAvatar {
  return DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]
}
