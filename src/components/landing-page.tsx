"use client"

import { useState, useCallback } from "react"
import { BookOpen } from "lucide-react"
import { WaveAnimation } from "@/components/ui/wave-animation-1"

interface LandingPageProps {
  onContinue: () => void
}

export function LandingPage({ onContinue }: LandingPageProps) {
  const [fadingOut, setFadingOut] = useState(false)

  const handleClick = useCallback(() => {
    setFadingOut(true)
    setTimeout(onContinue, 500)
  }, [onContinue])

  return (
    <div
      onClick={handleClick}
      className={`
        fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none
        bg-zinc-950 transition-opacity duration-500 ease-in-out
        ${fadingOut ? "opacity-0" : "opacity-100"}
      `}
    >
      <WaveAnimation
        waveSpeed={3}
        waveIntensity={12}
        particleColor="#22c55e"
        pointSize={2}
        gridDistance={4}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight text-center px-4">
          Agent Ledger
        </h1>

        <p className="text-white/50 text-sm sm:text-base mt-4 font-medium tracking-wide">
          Balance the books
        </p>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/30 text-xs tracking-widest uppercase animate-pulse">
            Tap anywhere to continue
          </span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-white/40 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  )
}
