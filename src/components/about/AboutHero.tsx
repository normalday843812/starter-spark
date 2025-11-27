"use client"

import { motion } from "motion/react"

export function AboutHero() {
  return (
    <section className="pt-32 pb-20 px-6 lg:px-20 bg-slate-50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-mono text-cyan-700 mb-4 tracking-wide">
            Our Mission
          </p>
          <h1 className="font-mono text-4xl lg:text-5xl font-bold text-slate-900 mb-8 leading-tight">
            Making Robotics Education
            <br />
            <span className="text-cyan-700">Accessible to Everyone</span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            We believe every student deserves the chance to build, code, and
            create—regardless of their background or resources. That&apos;s why
            we donate 70% of every dollar to local STEM programs.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
