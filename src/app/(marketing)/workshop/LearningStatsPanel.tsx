"use client"

import { Zap, TrendingUp, Flame, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface LearningStatsPanelProps {
  xp: number
  level: number
  streakDays: number
  lessonsCompleted: number
  title?: string
}

export function LearningStatsPanel({
  xp,
  level,
  streakDays,
  lessonsCompleted,
  title = "Learning Progress",
}: LearningStatsPanelProps) {
  // Calculate XP progress to next level (100 XP per level)
  const xpForCurrentLevel = (level - 1) * 100
  const xpProgress = xp - xpForCurrentLevel
  const xpToNextLevel = 100
  const progressPercent = Math.min((xpProgress / xpToNextLevel) * 100, 100)

  return (
    <div className="bg-white rounded border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-cyan-700" />
        <h3 className="font-mono text-lg text-slate-900">{title}</h3>
      </div>

      {/* Level & XP Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center text-white font-mono font-bold">
              {level}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Level {level}</p>
              <p className="text-xs text-slate-500">{xp} total XP</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {xpProgress}/{xpToNextLevel} XP
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {xpToNextLevel - xpProgress} XP to level {level + 1}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* XP */}
        <div className="text-center p-3 bg-slate-50 rounded border border-slate-100">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-slate-900">{xp}</p>
          <p className="text-xs text-slate-500">Total XP</p>
        </div>

        {/* Streak */}
        <div className="text-center p-3 bg-slate-50 rounded border border-slate-100">
          <Flame className={cn("w-5 h-5 mx-auto mb-1", streakDays > 0 ? "text-orange-500" : "text-slate-300")} />
          <p className="font-mono text-lg font-bold text-slate-900">{streakDays}</p>
          <p className="text-xs text-slate-500">Day Streak</p>
        </div>

        {/* Lessons */}
        <div className="text-center p-3 bg-slate-50 rounded border border-slate-100">
          <Target className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-slate-900">{lessonsCompleted}</p>
          <p className="text-xs text-slate-500">Lessons</p>
        </div>
      </div>

      {/* Streak encouragement */}
      {streakDays > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded border border-orange-100">
          <p className="text-sm text-orange-800">
            <Flame className="w-4 h-4 inline mr-1 text-orange-500" />
            {streakDays === 1
              ? "You're on a 1 day streak! Keep it going!"
              : `Amazing! ${streakDays} day streak! Keep learning!`}
          </p>
        </div>
      )}
    </div>
  )
}
