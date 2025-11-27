import type { Node, Edge } from "@xyflow/react"
import { reactFlowTokens } from "@/styles/reactflow-tokens"

export interface TechSpecItem {
  label: string
  color: string
}

export const techSpecsList: TechSpecItem[] = [
  { label: "ATmega328P Microcontroller", color: "bg-cyan-700" },
  { label: "High-Torque Metal Gear Servos", color: "bg-amber-500" },
  { label: "Modular Power Distribution", color: "bg-slate-400" },
]

export const techSpecsHeader = {
  title: "System Architecture",
  diagramLabel: "Wiring Diagram",
}

export const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 250, y: 0 },
    data: { label: "ARDUINO NANO" },
    style: reactFlowTokens.primaryNode,
  },
  {
    id: "2",
    position: { x: 100, y: 150 },
    data: { label: "SERVO DRIVER" },
    style: reactFlowTokens.secondaryNode,
  },
  {
    id: "3",
    position: { x: 400, y: 150 },
    data: { label: "POWER (5V)" },
    style: reactFlowTokens.powerNode,
  },
  {
    id: "4",
    position: { x: 50, y: 300 },
    data: { label: "MG996R (Base)" },
    style: reactFlowTokens.componentNode,
  },
  {
    id: "5",
    position: { x: 200, y: 300 },
    data: { label: "MG996R (Shoulder)" },
    style: reactFlowTokens.componentNode,
  },
  {
    id: "6",
    position: { x: 350, y: 300 },
    data: { label: "SG90 (Gripper)" },
    style: reactFlowTokens.componentNode,
  },
]

export const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: reactFlowTokens.primaryEdge,
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
    style: reactFlowTokens.powerEdge,
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    style: reactFlowTokens.defaultEdge,
  },
  {
    id: "e2-5",
    source: "2",
    target: "5",
    style: reactFlowTokens.defaultEdge,
  },
  {
    id: "e2-6",
    source: "2",
    target: "6",
    style: reactFlowTokens.defaultEdge,
  },
]
