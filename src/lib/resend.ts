import { Resend } from "resend"

// Create Resend client - env vars should be loaded by Next.js
const apiKey = process.env.RESEND_API_KEY

export const resend = new Resend(apiKey)

// Audience ID for newsletter subscribers
export const NEWSLETTER_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || ""
