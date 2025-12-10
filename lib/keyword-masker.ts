/**
 * Utility function to mask banned keywords in text
 * Replaces banned keywords with asterisks (*) while preserving case sensitivity
 * 
 * @param text - The text to mask
 * @param bannedKeywords - Array of banned keywords (should be lowercase)
 * @returns The masked text
 */
export function maskKeywords(text: string, bannedKeywords: string[]): string {
  if (!text || bannedKeywords.length === 0) {
    return text
  }

  let maskedText = text

  // Sort keywords by length (longest first) to handle overlapping keywords correctly
  const sortedKeywords = [...bannedKeywords].sort((a, b) => b.length - a.length)

  for (const keyword of sortedKeywords) {
    if (!keyword || keyword.trim().length === 0) {
      continue
    }

    // Create a case-insensitive regex that matches the keyword as a whole word
    // This ensures we match "DVD" in "DVD player" but not "DVD" in "ADVD"
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "gi")
    
    // Replace with asterisks matching the length of the matched keyword
    maskedText = maskedText.replace(regex, (match) => {
      return "*".repeat(match.length)
    })
  }

  return maskedText
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Fetch banned keywords for the current user
 * This is a client-side utility function
 */
export async function fetchBannedKeywords(): Promise<string[]> {
  try {
    const res = await fetch("/api/settings/banned-keywords")
    if (res.ok) {
      const data = await res.json()
      return data.keywords?.map((k: { keyword: string }) => k.keyword.toLowerCase()) || []
    }
    return []
  } catch (error) {
    console.error("Failed to fetch banned keywords:", error)
    return []
  }
}
