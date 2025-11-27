"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConstructiveCardProps extends React.ComponentProps<typeof Card> {
  title?: string
  children: React.ReactNode
}

export function ConstructiveCard({ title, children, className, ...props }: ConstructiveCardProps) {
  return (
    <Card className={cn("group border-slate-200 bg-white shadow-sm", className)} {...props}>
      {/* Top Border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-600/50 origin-left"
      />
      {/* Right Border */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
        className="absolute top-0 right-0 bottom-0 w-[1px] bg-cyan-600/50 origin-top"
      />
      {/* Bottom Border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: "circOut", delay: 0.4 }}
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-cyan-600/50 origin-right"
      />
      {/* Left Border */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.8, ease: "circOut", delay: 0.6 }}
        className="absolute top-0 left-0 bottom-0 w-[1px] bg-cyan-600/50 origin-bottom"
      />

      {title && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <span className="inline-block w-2 h-2 bg-cyan-700 rounded-full animate-pulse" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "" : "pt-6"}>
        {children}
      </CardContent>
    </Card>
  )
}