"use client"

import { ConstructiveCard } from "@/components/motion/ConstructiveCard"
import { missionItems, missionHeader } from "@/config/content/mission"
import { motion } from "motion/react"

export function MissionSection() {
  return (
    <section className="py-24 px-6 lg:px-20 relative bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="font-mono text-3xl lg:text-4xl text-slate-900 mb-4">
            {missionHeader.title}
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            {missionHeader.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {missionItems.map((item, idx) => (
            <motion.div
              key={idx}
              className={item.colSpan}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <ConstructiveCard className="h-full min-h-[200px] flex flex-col justify-between hover:border-cyan-700/30 transition-colors">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="font-mono text-xl text-slate-800 flex items-center gap-2">
                    {item.title}
                  </h3>
                  <item.icon className="w-6 h-6 text-cyan-700" />
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </ConstructiveCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}