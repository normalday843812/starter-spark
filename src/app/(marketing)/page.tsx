import {
  HeroWrapper,
  DifferentiatorsWrapper,
  FeaturedProduct,
  LearningPreviewWrapper,
  MissionImpact,
  EventsPreview,
} from "@/components/marketing"
import { getOrganizationSchema, getWebsiteSchema } from "@/lib/structured-data"
import { headers } from "next/headers"

export default async function Home() {
  const nonce = (await headers()).get("x-nonce") ?? undefined
  const organizationSchema = getOrganizationSchema()
  const websiteSchema = getWebsiteSchema()

  return (
    <div>
      {/* JSON-LD Structured Data for SEO */}
      <script nonce={nonce} type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script nonce={nonce} type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <HeroWrapper />
      <DifferentiatorsWrapper />
      <FeaturedProduct />
      <LearningPreviewWrapper />
      <MissionImpact />
      <EventsPreview />
    </div>
  )
}
