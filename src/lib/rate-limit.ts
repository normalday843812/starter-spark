import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

// Validate Upstash configuration at startup
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn(
    "⚠️  UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not configured. " +
    "Rate limiting will throw errors. Set these environment variables to enable rate limiting."
  )
}

// Create Upstash rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // Default: 10 requests per minute
  analytics: true,
  prefix: "starterspark",
})

// Rate limit configurations for different endpoints
export const rateLimitConfigs = {
  // Sensitive endpoints - stricter limits
  claimLicense: { requests: 5, window: "1 m" as const },
  claimByToken: { requests: 5, window: "1 m" as const },
  checkout: { requests: 10, window: "1 m" as const },
  // General API - more permissive
  default: { requests: 30, window: "1 m" as const },
}

type RateLimitConfig = keyof typeof rateLimitConfigs

/**
 * Rate limit a request using Upstash Redis
 * @param request - The incoming request
 * @param configKey - Which rate limit config to use
 * @returns null if allowed, NextResponse if rate limited
 * @throws Error if Upstash is not configured
 */
export async function rateLimit(
  request: Request,
  configKey: RateLimitConfig = "default"
): Promise<NextResponse | null> {
  // Fail fast if Upstash is not configured
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
      "Rate limiting requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables"
    )
  }

  // Get identifier (IP address or fallback)
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1"
  const identifier = `${configKey}:${ip}`

  const config = rateLimitConfigs[configKey]

  const { success, remaining, reset } = await ratelimit.limit(identifier)

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((reset - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": config.requests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": reset.toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        }
      }
    )
  }

  return null
}

/**
 * Create rate limit headers for successful requests
 */
export function rateLimitHeaders(configKey: RateLimitConfig = "default"): HeadersInit {
  const config = rateLimitConfigs[configKey]
  return {
    "X-RateLimit-Limit": config.requests.toString(),
  }
}
