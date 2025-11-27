"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, GraduationCap, Users, MapPin } from "lucide-react"
import { motion } from "motion/react"
import type { LucideIcon } from "lucide-react"

interface Differentiator {
  icon: LucideIcon
  title: string
  description: string
}

const differentiators: Differentiator[] = [
  {
    icon: Package,
    title: "Complete Package",
    description:
      "Everything you need in one box. No soldering, no specialized tools, no hunting for parts. Unbox and start building.",
  },
  {
    icon: GraduationCap,
    title: "Interactive Curriculum",
    description:
      "Step-by-step digital guides, wiring simulators, and video tutorials. Learn at your own pace with real feedback.",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      'Join "The Lab" — our Q&A community. Get help from staff, share projects, and connect with other builders.',
  },
  {
    icon: MapPin,
    title: "Hawaii Roots",
    description:
      "Designed by students in Honolulu. Every purchase supports local STEM education and robotics programs.",
  },
]

export function DifferentiatorsSection() {
  return (
    <section className="py-24 px-6 lg:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-mono text-3xl lg:text-4xl text-slate-900 mb-4">
            Why StarterSpark?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            We built the kit we wished existed when we started learning robotics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded bg-cyan-50 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-cyan-700" />
                  </div>
                  <h3 className="font-mono text-lg text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
