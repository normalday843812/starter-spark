import { stripe } from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { generateLicenseCode, generateClaimToken, formatPrice } from "@/lib/validation"
import { sendPurchaseConfirmation } from "@/lib/email/send"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    console.error("Missing Stripe signature")
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`Webhook signature verification failed: ${message}`)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object

      // Idempotency check: See if we already processed this session
      // Note: A session can have multiple licenses (for quantity > 1), so we check for ANY
      const { data: existingLicenses } = await supabaseAdmin
        .from("licenses")
        .select("id")
        .eq("stripe_session_id", session.id)
        .limit(1)

      if (existingLicenses && existingLicenses.length > 0) {
        console.log(`Session ${session.id} already processed, skipping`)
        return NextResponse.json({ received: true, status: "already_processed" })
      }

      // Get customer email from session
      const customerEmail = session.customer_details?.email || session.customer_email

      if (!customerEmail) {
        console.error("No customer email found in session")
        return NextResponse.json(
          { error: "No customer email" },
          { status: 400 }
        )
      }

      // Retrieve line items from Stripe (avoids metadata size limits)
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      })

      // Extract items from line items, filtering out shipping
      const productItems: { slug: string; quantity: number }[] = []
      for (const lineItem of lineItems.data) {
        const product = lineItem.price?.product as Stripe.Product | undefined
        const slug = product?.metadata?.slug

        // Skip shipping or items without slug
        if (!slug || slug === "shipping") continue

        productItems.push({
          slug,
          quantity: lineItem.quantity || 1,
        })
      }

      // Look up products by slug (include inventory fields for stock decrement)
      const slugs = productItems.map(item => item.slug)
      const { data: products, error: productsError } = await supabaseAdmin
        .from("products")
        .select("id, slug, name, track_inventory, stock_quantity")
        .in("slug", slugs)

      if (productsError || !products) {
        console.error("Error fetching products:", productsError)
        return NextResponse.json(
          { error: "Failed to fetch products" },
          { status: 500 }
        )
      }

      // Create a map of slug -> product
      const productMap = new Map(products.map(p => [p.slug, p]))

      // Create licenses for each item
      // NOTE: Licenses are NEVER auto-claimed. All licenses start as 'pending'
      // and must be explicitly claimed by the user in their workshop.
      const licensesToCreate: {
        code: string
        product_id: string
        owner_id: null
        source: string
        stripe_session_id: string
        customer_email: string
        claim_token: string
        status: "pending"
      }[] = []

      for (const item of productItems) {
        const product = productMap.get(item.slug)
        if (!product) {
          console.error(`Product not found for slug: ${item.slug}`)
          continue
        }

        // Create one license per quantity
        for (let i = 0; i < item.quantity; i++) {
          const code = generateLicenseCode()
          // Always generate claim token - user must explicitly claim
          const claimToken = generateClaimToken()

          licensesToCreate.push({
            code,
            product_id: product.id,
            owner_id: null, // Never auto-claim
            source: "online_purchase",
            stripe_session_id: session.id,
            customer_email: customerEmail,
            claim_token: claimToken,
            status: "pending",
          })
        }
      }

      if (licensesToCreate.length === 0) {
        console.log("No licenses to create")
        return NextResponse.json({ received: true, status: "no_licenses" })
      }

      // Insert all licenses
      const { data: createdLicenses, error: insertError } = await supabaseAdmin
        .from("licenses")
        .insert(licensesToCreate)
        .select()

      if (insertError) {
        // Check if it's a duplicate key error (already processed)
        if (insertError.code === "23505" || insertError.message?.includes("duplicate key")) {
          console.log(`Session ${session.id} already processed (duplicate key), returning success`)
          return NextResponse.json({ received: true, status: "already_processed" })
        }
        console.error("Error creating licenses:", insertError)
        return NextResponse.json(
          { error: "Failed to create licenses" },
          { status: 500 }
        )
      }

      console.log(`Created ${createdLicenses.length} licenses for session ${session.id}`)

      // Decrement stock for products with inventory tracking (Phase 14.4)
      for (const item of productItems) {
        const product = productMap.get(item.slug)
        if (!product) continue

        // Only decrement if inventory tracking is enabled
        if (product.track_inventory && product.stock_quantity !== null) {
          const newQuantity = Math.max(0, product.stock_quantity - item.quantity)

          const { error: stockError } = await supabaseAdmin
            .from("products")
            .update({ stock_quantity: newQuantity })
            .eq("id", product.id)

          if (stockError) {
            console.error("Failed to decrement stock for product:", item.slug, stockError)
            // Don't fail the webhook, just log the error
          } else {
            console.log(`Decremented stock for ${item.slug}: ${product.stock_quantity} -> ${newQuantity}`)
          }
        }
      }

      // Send purchase confirmation email
      // Always show claim links since licenses are never auto-claimed
      const orderTotal = formatPrice(session.amount_total || 0)

      // Build license info for email
      const licenseInfoForEmail = createdLicenses.map((license) => {
        const product = products.find((p) => p.id === license.product_id)
        return {
          code: license.code,
          productName: product?.name || "StarterSpark Kit",
          claimToken: license.claim_token,
        }
      })

      try {
        await sendPurchaseConfirmation({
          to: customerEmail,
          customerName: session.customer_details?.name || undefined,
          orderTotal,
          licenses: licenseInfoForEmail,
          // Always true - user must explicitly claim in workshop
          isGuestPurchase: true,
        })
        console.log(`Purchase confirmation email sent to ${customerEmail}`)
      } catch (emailError) {
        // Log email error but don't fail the webhook
        console.error("Failed to send purchase confirmation email:", emailError)
      }

      return NextResponse.json({
        received: true,
        status: "licenses_created",
        count: createdLicenses.length,
      })
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
