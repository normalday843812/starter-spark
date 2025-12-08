import {
  BookOpen,
  Cpu,
  MessageCircleQuestion,
  Calendar,
  Users,
  Info,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  description?: string
  icon?: LucideIcon
  requiresAuth?: boolean
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

// Dropdown navigation groups
export const documentationNav: NavGroup = {
  title: "Documentation",
  items: [
    {
      title: "Hardware Guides",
      href: "/learn",
      description: "Assembly instructions and hardware setup",
      icon: Cpu,
    },
    {
      title: "Software Guides",
      href: "/learn",
      description: "Programming tutorials and code examples",
      icon: BookOpen,
    },
    {
      title: "Troubleshooting",
      href: "/community?status=open",
      description: "Common issues and solutions",
      icon: MessageCircleQuestion,
    },
  ],
}

export const communityNav: NavGroup = {
  title: "Community",
  items: [
    {
      title: "Events",
      href: "/events",
      description: "Workshops and meetups",
      icon: Calendar,
    },
    {
      title: "The Lab",
      href: "/community",
      description: "Ask questions and share projects",
      icon: Users,
    },
    {
      title: "About Us",
      href: "/about",
      description: "Our mission and team",
      icon: Info,
    },
  ],
}

// Simple nav items (no dropdown)
export const mainNav = [
  { title: "Shop", href: "/shop" },
] as const

export const footerNav = {
  main: [
    { title: "Shop", href: "/shop" },
    { title: "Learn", href: "/learn" },
    { title: "Community", href: "/community" },
    { title: "Events", href: "/events" },
    { title: "About", href: "/about" },
  ],
  legal: [
    { title: "Privacy", href: "/privacy" },
    { title: "Terms", href: "/terms" },
  ],
} as const

export type MainNavItem = (typeof mainNav)[number]
export type FooterNavItem = (typeof footerNav.main)[number]
