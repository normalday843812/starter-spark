import { checkBotId } from 'botid/server'
import { NextResponse } from 'next/server'

/**
 * Check if the request is from a bot.
 * Returns null if the request is legitimate, or a 403 response if it's a bot.
 *
 * Usage in API routes:
 * ```ts
 * const botResponse = await checkBotAndReject()
 * if (botResponse) return botResponse
 * ```
 */
export async function checkBotAndReject(): Promise<NextResponse | null> {
  try {
    const result = await checkBotId()

    if (result.isBot) {
      // Allow verified bots like search engines, AI assistants, etc.
      if (result.isVerifiedBot) {
        return null
      }

      return NextResponse.json(
        { error: 'Access denied. Automated requests are not allowed.' },
        { status: 403 },
      )
    }

    return null
  } catch (err) {
    // Fail open so BotID outages/misconfig don't take down critical endpoints.
    console.error('BotID check failed:', err)
    return null
  }
}

/**
 * Check if the request is from a bot, with custom handling for verified bots.
 * Returns the full BotID result for custom logic.
 */
export async function getBotIdResult() {
  return checkBotId()
}

/** Re-export checkBotId for direct usage */
export { checkBotId }
