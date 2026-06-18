"use client"

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15 dark:opacity-8"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, #059669 0%, transparent 70%)",
          animation: "ambient-drift-1 20s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10 dark:opacity-5"
        style={{
          background:
            "radial-gradient(circle at 70% 60%, #059669 0%, transparent 65%)",
          animation: "ambient-drift-2 25s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute top-1/3 -right-20 w-[350px] h-[350px] rounded-full opacity-8 dark:opacity-4"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, #10b981 0%, transparent 60%)",
          animation: "ambient-drift-3 18s ease-in-out infinite alternate",
        }}
      />
    </div>
  )
}
