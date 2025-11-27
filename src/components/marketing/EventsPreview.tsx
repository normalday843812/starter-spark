"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, ArrowRight, MessageSquare, Users } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"

interface Workshop {
  date: string
  title: string
  location: string
  spotsLeft: number
}

interface Discussion {
  title: string
  author: string
  replies: number
  tag: string
}

const upcomingWorkshops: Workshop[] = [
  {
    date: "Dec 14, 2024",
    title: "Intro to Robotics: Build Your First Arm",
    location: "Punahou School, Honolulu",
    spotsLeft: 8,
  },
  {
    date: "Jan 11, 2025",
    title: "Arduino Basics for Beginners",
    location: "Hawaii Pacific University",
    spotsLeft: 12,
  },
  {
    date: "Jan 25, 2025",
    title: "Advanced Servo Control Workshop",
    location: "Iolani School, Honolulu",
    spotsLeft: 5,
  },
]

const recentDiscussions: Discussion[] = [
  {
    title: "Best practices for servo calibration?",
    author: "makaha_maker",
    replies: 14,
    tag: "hardware",
  },
  {
    title: "My arm keeps drifting left - help!",
    author: "robotbuilder42",
    replies: 8,
    tag: "troubleshooting",
  },
  {
    title: "Show & Tell: Custom gripper attachment",
    author: "kai_builds",
    replies: 23,
    tag: "projects",
  },
]

export function EventsPreviewSection() {
  return (
    <section className="py-24 px-6 lg:px-20 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-mono text-3xl lg:text-4xl text-slate-900 mb-4">
            Join the Community
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Learn together at our workshops or connect with builders in The Lab.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left - Upcoming Workshops (50%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-mono text-xl text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-700" />
                Upcoming Workshops
              </h3>
              <Link href="/events">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-700 hover:text-cyan-600 font-mono"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingWorkshops.map((workshop) => (
                <Card
                  key={workshop.title}
                  className="bg-white border-slate-200 hover:border-cyan-200 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-mono text-sm text-cyan-700 mb-1">
                          {workshop.date}
                        </p>
                        <h4 className="font-medium text-slate-900 mb-2">
                          {workshop.title}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {workshop.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-mono px-2 py-1 rounded ${
                            workshop.spotsLeft <= 5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {workshop.spotsLeft} spots
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Link href="/events" className="block mt-auto pt-6">
              <Button
                variant="outline"
                className="w-full border-slate-200 hover:border-cyan-700 text-slate-600 hover:text-cyan-700 font-mono"
              >
                Register for a Workshop
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          {/* Right - The Lab Preview (50%) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-mono text-xl text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-700" />
                The Lab
              </h3>
              <Link href="/community">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-700 hover:text-cyan-600 font-mono"
                >
                  Join Now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-6 mb-4 p-3 bg-white rounded border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-slate-600">
                  <span className="font-mono text-slate-900">127</span> online
                </span>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-mono text-slate-900">2,340</span> members
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-mono text-slate-900">890</span> discussions
              </div>
            </div>

            {/* Recent Discussions */}
            <div className="space-y-3">
              {recentDiscussions.map((discussion) => (
                <div
                  key={discussion.title}
                  className="p-4 bg-white rounded border border-slate-200 hover:border-cyan-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 text-sm truncate">
                        {discussion.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">
                          @{discussion.author}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          #{discussion.tag}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {discussion.replies} replies
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/community" className="block mt-auto pt-6">
              <Button className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-mono">
                Join The Lab
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
