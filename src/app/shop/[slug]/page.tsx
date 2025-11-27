import { Footer } from "@/components/layout/Footer"
import { ProductGallery, BuyBox, ProductTabs } from "@/components/commerce"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

// Mock product data - will be replaced with Supabase fetch
const products: Record<
  string,
  {
    name: string
    price: number
    originalPrice?: number
    inStock: boolean
    modelPath?: string
    description: string
    learningOutcomes: string[]
    includedItems: Array<{
      quantity: number
      name: string
      description: string
    }>
    specs: Array<{ label: string; value: string }>
  }
> = {
  "4dof-arm": {
    name: "4DOF Robotic Arm Kit",
    price: 49,
    inStock: true,
    modelPath: "/assets/3d/arm/arm.glb",
    description:
      "Build a fully functional robotic arm from scratch. This kit teaches mechanical assembly, electronics wiring, and Arduino programming—skills that transfer directly to real engineering projects. Each kit includes everything you need: pre-cut acrylic parts, high-torque servos, an Arduino Nano, and our step-by-step digital curriculum with interactive wiring diagrams. No prior experience required.",
    learningOutcomes: [
      "Mechanical assembly and precision tolerances",
      "Servo motor control and PWM signal generation",
      "Arduino programming fundamentals (variables, loops, functions)",
      "Basic forward kinematics concepts",
      "Circuit wiring and power management",
      "Debugging and troubleshooting techniques",
    ],
    includedItems: [
      {
        quantity: 1,
        name: "Arduino Nano",
        description: "ATmega328P microcontroller with USB",
      },
      {
        quantity: 3,
        name: "MG996R Servo",
        description: "High-torque metal gear servo (13kg/cm)",
      },
      {
        quantity: 2,
        name: "SG90 Servo",
        description: "Micro servo for gripper mechanism",
      },
      {
        quantity: 1,
        name: "Acrylic Chassis Set",
        description: "Pre-cut laser-cut acrylic parts (6 pieces)",
      },
      {
        quantity: 1,
        name: "Breadboard",
        description: "400-point solderless breadboard",
      },
      {
        quantity: 1,
        name: "Jumper Wire Pack",
        description: "40 male-to-male jumper wires",
      },
      {
        quantity: 1,
        name: "USB Cable",
        description: "Mini USB to USB-A cable for programming",
      },
      {
        quantity: 1,
        name: "Hardware Kit",
        description: "Screws, nuts, and standoffs (assorted)",
      },
      {
        quantity: 1,
        name: "License Card",
        description: "Access code for online curriculum",
      },
    ],
    specs: [
      { label: "Microcontroller", value: "Arduino Nano (ATmega328P)" },
      { label: "Operating Voltage", value: "5V" },
      { label: "Servos", value: "2× SG90, 3× MG996R" },
      { label: "Degrees of Freedom", value: "4 (Base, Shoulder, Elbow, Gripper)" },
      { label: "Max Reach", value: "~25cm" },
      { label: "Payload Capacity", value: "~100g at full extension" },
      { label: "Power Supply", value: "4× AA batteries (not included)" },
      { label: "Assembled Dimensions", value: "15 × 10 × 25 cm" },
      { label: "Kit Weight", value: "450g" },
      { label: "Build Time", value: "~3 hours" },
      { label: "Recommended Age", value: "10+" },
    ],
  },
}

type PageParams = Promise<{ slug: string }>

export async function generateMetadata({
  params,
}: {
  params: PageParams
}): Promise<Metadata> {
  const { slug } = await params
  const product = products[slug]

  if (!product) {
    return { title: "Product Not Found" }
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: PageParams
}) {
  const { slug } = await params
  const product = products[slug]

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <section className="pt-24 pb-4 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>
      </section>

      {/* Product Hero - 60/40 Split */}
      <section className="pb-16 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left - Gallery (60%) */}
            <div className="w-full lg:w-3/5">
              <ProductGallery
                modelPath={product.modelPath}
                productName={product.name}
              />
            </div>

            {/* Right - Buy Box (40%) */}
            <div className="w-full lg:w-2/5">
              <BuyBox
                slug={slug}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                inStock={product.inStock}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Tabs */}
      <section className="pb-24 px-6 lg:px-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto pt-12">
          <ProductTabs
            description={product.description}
            learningOutcomes={product.learningOutcomes}
            includedItems={product.includedItems}
            specs={product.specs}
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}
