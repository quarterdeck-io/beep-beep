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
 * Utility function to remove banned keywords from text
 * Completely removes banned keywords from the text
 * 
 * @param text - The text to process
 * @param bannedKeywords - Array of banned keywords (should be lowercase)
 * @returns The text with keywords removed
 */
export function removeKeywords(text: string, bannedKeywords: string[]): string {
  console.log("[removeKeywords] Called with:", { text, bannedKeywords, keywordCount: bannedKeywords.length })
  
  if (!text || bannedKeywords.length === 0) {
    console.log("[removeKeywords] Early return - no text or no keywords")
    return text
  }

  let processedText = text

  // Sort keywords by length (longest first) to handle overlapping keywords correctly
  const sortedKeywords = [...bannedKeywords].sort((a, b) => b.length - a.length)

  for (const keyword of sortedKeywords) {
    if (!keyword || keyword.trim().length === 0) {
      continue
    }

    // Create a case-insensitive regex that matches the keyword as a whole word
    // This ensures we match "DVD" in "DVD player" but not "DVD" in "ADVD"
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "gi")
    
    // Check if keyword matches
    const matches = processedText.match(regex)
    console.log(`[removeKeywords] Keyword "${keyword}" - Regex: ${regex} - Matches:`, matches)
    
    // Remove the keyword completely
    processedText = processedText.replace(regex, "")
  }

  // Clean up extra spaces and punctuation artifacts
  processedText = processedText
    .replace(/,\s*,/g, ",") // Remove double commas
    .replace(/;\s*;/g, ";") // Remove double semicolons
    .replace(/:\s*:/g, ":") // Remove double colons
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\s+([,\.;:!?])/g, "$1") // Remove space before punctuation
    .replace(/([\(\[\{])\s+/g, "$1") // Remove space after opening brackets
    .replace(/\s+([\)\]\}])/g, "$1") // Remove space before closing brackets
    .replace(/\s+-\s+/g, " - ") // Preserve dashes with spaces
    .replace(/^\s*[,\.;:!?]\s*/g, "") // Remove leading punctuation
    .trim() // Remove leading/trailing spaces

  return processedText
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
  console.log("[fetchBannedKeywords] Starting fetch...")
  try {
    const res = await fetch("/api/settings/banned-keywords")
    console.log("[fetchBannedKeywords] Response status:", res.status)
    if (res.ok) {
      const data = await res.json()
      console.log("[fetchBannedKeywords] Raw API response:", data)
      const keywords = data.keywords?.map((k: { keyword: string }) => k.keyword.toLowerCase()) || []
      console.log("[fetchBannedKeywords] Processed keywords:", keywords)
      return keywords
    }
    console.log("[fetchBannedKeywords] Response not ok")
    return []
  } catch (error) {
    console.error("[fetchBannedKeywords] Error:", error)
    return []
  }
}
