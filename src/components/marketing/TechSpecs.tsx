"use client"

import { Background, ReactFlow, useNodesState, useEdgesState } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { motion } from "motion/react"
import {
  initialNodes as configNodes,
  initialEdges as configEdges,
  techSpecsList,
  techSpecsHeader,
} from "@/config/content/tech-specs"
import { reactFlowTokens } from "@/styles/reactflow-tokens"

export function TechSpecsSection() {
  const [nodes, , onNodesChange] = useNodesState(configNodes)
  const [edges, , onEdgesChange] = useEdgesState(configEdges)

  return (
    <section className="py-24 border-t border-slate-200 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/3"
          >
            <h2 className="font-mono text-3xl text-slate-900 mb-6 tracking-tight">
              {techSpecsHeader.title}
            </h2>
            <ul className="space-y-4 text-slate-600 font-mono text-sm">
              {techSpecsList.map((spec, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className={`w-2 h-2 ${spec.color} rounded-none`} />
                  {spec.label}
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="w-full lg:w-2/3 h-[500px] border border-slate-200 bg-white relative group shadow-sm">
            <div className="absolute top-0 left-0 px-4 py-2 bg-slate-50 text-xs font-mono text-cyan-700 border-r border-b border-slate-200 z-10">
              {techSpecsHeader.diagramLabel}
            </div>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              attributionPosition="bottom-right"
              panOnScroll={false}
              zoomOnScroll={false}
              proOptions={{ hideAttribution: true }}
            >
              <Background
                color={reactFlowTokens.gridColor}
                gap={reactFlowTokens.gridGap}
                size={reactFlowTokens.gridSize}
              />
            </ReactFlow>
          </div>
        </div>
      </div>
    </section>
  )
}
