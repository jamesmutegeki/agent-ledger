"use client"

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient orb 1 — top-left */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-10"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, #16a34a 0%, #059669 40%, transparent 70%)",
          animation: "ambient-drift-1 20s ease-in-out infinite alternate",
        }}
      />

      {/* Gradient orb 2 — bottom-right */}
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-15 dark:opacity-8"
        style={{
          background:
            "radial-gradient(circle at 70% 60%, #22c55e 0%, #059669 30%, transparent 65%)",
          animation: "ambient-drift-2 25s ease-in-out infinite alternate",
        }}
      />

      {/* Gradient orb 3 — center-right, subtle */}
      <div
        className="absolute top-1/3 -right-20 w-[350px] h-[350px] rounded-full opacity-10 dark:opacity-5"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #34d399 0%, transparent 60%)",
          animation: "ambient-drift-3 18s ease-in-out infinite alternate",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-green-400/30 dark:bg-green-500/20"
            style={{
              top: `${10 + (i * 7) % 80}%`,
              left: `${5 + (i * 11) % 90}%`,
              animation: `ambient-float-${(i % 3) + 1} ${6 + (i % 4) * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
