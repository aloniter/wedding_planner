const STORAGE_KEY = 'wedding-slug'

export function getSavedSlug(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function saveSlug(slug: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, slug)
}

export function clearSlug(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
