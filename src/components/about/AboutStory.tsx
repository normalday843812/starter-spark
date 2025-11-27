"use client"

import { motion } from "motion/react"

export function AboutStory() {
  return (
    <section className="py-24 px-6 lg:px-20 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="font-mono text-3xl text-slate-900 mb-2">The Story</h2>
          <div className="w-16 h-1 bg-cyan-700" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-6 text-slate-600 leading-relaxed text-lg"
        >
          <p className="p-4 bg-slate-50 rounded border border-slate-200 font-mono text-sm">
            PLACEHOLDER: Our founding story will be shared here. This section will describe how StarterSpark began and our journey to making robotics education accessible.
          </p>

          <p className="p-4 bg-slate-50 rounded border border-slate-200 font-mono text-sm">
            PLACEHOLDER: This section will discuss the challenges we identified in robotics education and what motivated us to create a solution.
          </p>

          <p className="p-4 bg-slate-50 rounded border border-slate-200 font-mono text-sm">
            PLACEHOLDER: This section will explain our approach to building an accessible, educational robotics kit with comprehensive learning materials.
          </p>

          <p className="p-4 bg-slate-50 rounded border border-slate-200 font-mono text-sm">
            PLACEHOLDER: This section will highlight our commitment to giving back and supporting Hawaii STEM education through our 70/30 model.
          </p>
        </motion.div>

        {/* Quote Callout */}
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 p-8 bg-slate-50 border-l-4 border-cyan-700 rounded-r"
        >
          <p className="text-slate-500 italic font-mono text-sm">
            PLACEHOLDER: Founder quote will be added here.
          </p>
        </motion.blockquote>
      </div>
    </section>
  )
}
