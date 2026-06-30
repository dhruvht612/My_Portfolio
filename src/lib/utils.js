import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge class names with clsx (conditional classes) + tailwind-merge
 * (resolves conflicting Tailwind utilities, last one wins).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}