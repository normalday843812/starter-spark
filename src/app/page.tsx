import { Footer } from "@/components/layout/Footer"
import { HeroSection, MissionSection, TechSpecsSection } from "@/components/marketing"

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <MissionSection />
      <TechSpecsSection />
      <Footer />
    </main>
  )
}