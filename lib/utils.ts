/**
 * UTILITY FUNCTIONS - Common helper functions used throughout the app
 * 
 * This file contains reusable utility functions that assist with:
 * - CSS class name merging and conditional class application
 * - Preventing Tailwind CSS class conflicts
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges and deduplicates CSS class names
 * 
 * Combines clsx and tailwind-merge to:
 * 1. Conditionally include/exclude classes (clsx functionality)
 * 2. Resolve Tailwind CSS conflicts (twMerge functionality)
 * 
 * This prevents CSS specificity issues where conflicting Tailwind classes
 * would both apply, instead keeping only the last (most specific) one.
 * 
 * @example
 * cn('px-2', 'px-4') // Returns 'px-4' (last one wins)
 * cn('bg-red-500', condition && 'bg-blue-500') // Conditionally applies classes
 * 
 * @param {...ClassValue[]} inputs - Class names to merge (strings, objects, or arrays)
 * @returns {string} Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
