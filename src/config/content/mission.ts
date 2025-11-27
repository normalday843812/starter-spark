import { Wallet, Zap, Heart, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface MissionItem {
  title: string
  icon: LucideIcon
  description: string
  colSpan: string
}

export const missionItems: MissionItem[] = [
  {
    title: "Accessible",
    icon: Wallet,
    description:
      "Robotics shouldn't cost a fortune. Our kits start under $50, making engineering accessible to every family.",
    colSpan: "md:col-span-1",
  },
  {
    title: "Hands-On",
    icon: Zap,
    description:
      "No drag-and-drop blocks. Real wiring, real Arduino C++, real physics. Learn by building.",
    colSpan: "md:col-span-2",
  },
  {
    title: "Community First",
    icon: Heart,
    description:
      "We donate 70% of our profits to local STEM charities and schools. Your purchase fuels the next generation.",
    colSpan: "md:col-span-2",
  },
  {
    title: "Local Roots",
    icon: Users,
    description: "Born from Punahou Robotics. Designed and tested in Hawaii.",
    colSpan: "md:col-span-1",
  },
]

export const missionHeader = {
  title: "Our Mission",
  subtitle: "We are building the bridge between curiosity and capability.",
}
