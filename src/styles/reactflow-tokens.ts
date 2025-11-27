import type { CSSProperties } from "react"

/**
 * Design tokens for ReactFlow diagrams
 * Following the "Architectural Blueprint" design system
 */

const baseNodeStyle: CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  fontSize: "12px",
  borderRadius: "0px",
}

export const reactFlowTokens = {
  // Node styles
  primaryNode: {
    ...baseNodeStyle,
    background: "#ffffff",
    color: "#0e7490", // cyan-700
    border: "1px solid #0e7490",
    width: 180,
  } as CSSProperties,

  secondaryNode: {
    ...baseNodeStyle,
    background: "#ffffff",
    color: "#0f172a", // slate-900
    border: "1px solid #cbd5e1", // slate-300
    width: 160,
  } as CSSProperties,

  powerNode: {
    ...baseNodeStyle,
    background: "#ffffff",
    color: "#f59e0b", // amber-500
    border: "1px solid #f59e0b",
    width: 140,
  } as CSSProperties,

  componentNode: {
    ...baseNodeStyle,
    background: "#f8fafc", // slate-50
    color: "#64748b", // slate-500
    border: "1px dashed #cbd5e1",
    width: 140,
  } as CSSProperties,

  // Edge styles
  primaryEdge: {
    stroke: "#0e7490", // cyan-700
    strokeWidth: 2,
  } as CSSProperties,

  powerEdge: {
    stroke: "#f59e0b", // amber-500
    strokeWidth: 2,
  } as CSSProperties,

  defaultEdge: {
    stroke: "#94a3b8", // slate-400
  } as CSSProperties,

  // Background
  gridColor: "#cbd5e1", // slate-300
  gridGap: 24,
  gridSize: 1,
}
