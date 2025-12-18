import { createClient } from "@/lib/supabase/server"
import { BookOpen, Cpu, Code, Wrench, FileText, ExternalLink, ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Documentation - StarterSpark Robotics",
  description: "Assembly guides, programming tutorials, and technical documentation for StarterSpark robotics kits.",
}

interface DocLink {
  title: string
  description: string
  href: string
  external?: boolean
}

const hardwareGuides: DocLink[] = [
  {
    title: "Assembly Overview",
    description: "Step-by-step assembly instructions for your robotics kit",
    href: "/learn",
  },
  {
    title: "Wiring Diagrams",
    description: "Complete wiring schematics and connection guides",
    href: "/learn",
  },
  {
    title: "Component Reference",
    description: "Technical specifications for all included components",
    href: "/learn",
  },
]

const softwareGuides: DocLink[] = [
  {
    title: "Getting Started with Arduino",
    description: "Set up your development environment and write your first program",
    href: "/learn",
  },
  {
    title: "Motor Control Basics",
    description: "Learn to control servo motors and DC motors",
    href: "/learn",
  },
  {
    title: "Sensor Integration",
    description: "Connect and read data from various sensors",
    href: "/learn",
  },
]

const additionalResources: DocLink[] = [
  {
    title: "Arduino Reference",
    description: "Official Arduino language reference and documentation",
    href: "https://www.arduino.cc/reference/en/",
    external: true,
  },
  {
    title: "Community Forum",
    description: "Ask questions and get help from other builders",
    href: "/community",
  },
  {
    title: "Troubleshooting Guide",
    description: "Common issues and their solutions",
    href: "/community?tag=troubleshooting",
  },
]

function DocSection({
  id,
  title,
  icon: Icon,
  links,
}: {
  id: string
  title: string
  icon: LucideIcon
  links: DocLink[]
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded bg-cyan-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-cyan-700" />
        </div>
        <h2 className="font-mono text-2xl text-slate-900">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="group block p-6 bg-white rounded border border-slate-200 hover:border-cyan-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-mono text-lg text-slate-900 group-hover:text-cyan-700 transition-colors">
                {link.title}
              </h3>
              {link.external ? (
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              )}
            </div>
            <p className="text-sm text-slate-600">{link.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function DocsPage() {
  const supabase = await createClient()

  // Fetch courses count for stats
  const { count: courseCount } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })

  // Fetch total lessons count
  const { count: lessonCount } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="pt-32 pb-12 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-mono text-cyan-700 mb-2">Documentation</p>
          <h1 className="font-mono text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Build With Confidence
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mb-8">
            Comprehensive guides for assembly, wiring, and programming your robotics kit.
            Everything you need to go from unboxing to autonomous operation.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded border border-slate-200">
              <BookOpen className="w-5 h-5 text-cyan-700" />
              <span className="font-mono text-slate-900">{courseCount || 0} Courses</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded border border-slate-200">
              <FileText className="w-5 h-5 text-cyan-700" />
              <span className="font-mono text-slate-900">{lessonCount || 0} Lessons</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="pb-8 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4">
            <a
              href="#hardware"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-700 text-white font-mono text-sm rounded hover:bg-cyan-600 transition-colors"
            >
              <Cpu className="w-4 h-4" />
              Hardware Guides
            </a>
            <a
              href="#software"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-mono text-sm rounded border border-slate-200 hover:border-cyan-300 transition-colors"
            >
              <Code className="w-4 h-4" />
              Software Guides
            </a>
            <a
              href="#resources"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-mono text-sm rounded border border-slate-200 hover:border-cyan-300 transition-colors"
            >
              <Wrench className="w-4 h-4" />
              Additional Resources
            </a>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="pb-24 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-16">
          <DocSection
            id="hardware"
            title="Hardware Guides"
            icon={Cpu}
            links={hardwareGuides}
          />

          <DocSection
            id="software"
            title="Software Guides"
            icon={Code}
            links={softwareGuides}
          />

          <DocSection
            id="resources"
            title="Additional Resources"
            icon={Wrench}
            links={additionalResources}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-24 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="p-8 bg-white rounded border border-slate-200 text-center">
            <h2 className="font-mono text-2xl text-slate-900 mb-3">
              Ready to Start Building?
            </h2>
            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
              Begin with our structured learning path. Each course builds on the previous one,
              taking you from beginner to advanced robotics.
            </p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-mono rounded transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
