import { useMemo, useState } from "react";
import { cn } from "./utils/cn";
import { useCountdown, useLocalStorage } from "./hooks";
import {
  OWNERS,
  type Owner,
  type Level,
  weeks,
  safetyRules,
  slides,
  deadlineSchedule,
  roles,
  tools,
  risks,
  definitionOfDone,
  standupTemplate,
} from "./data";

const ownerStyle: Record<Owner, string> = {
  Lead: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  "Tech 1": "bg-sky-500/10 text-sky-300 ring-sky-500/30",
  "Tech 2": "bg-violet-500/10 text-violet-300 ring-violet-500/30",
  Detection: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  Presenter: "bg-pink-500/10 text-pink-300 ring-pink-500/30",
  All: "bg-zinc-500/10 text-zinc-300 ring-zinc-500/30",
};

const levelStyle: Record<Level, string> = {
  Low: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  Medium: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  High: "bg-red-500/10 text-red-300 ring-red-500/30",
};

const navItems = [
  ["week1", "Week 1"],
  ["week2", "Week 2"],
  ["deadline", "Deadline Day"],
  ["roles", "Roles"],
  ["tools", "Tools"],
  ["risks", "Risks"],
  ["done", "Done"],
  ["standup", "Standup"],
];

function Pill({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", className)}>
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, id, children }: { eyebrow: string; title: string; id?: string; children?: React.ReactNode }) {
  return (
    <div id={id} className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-400">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
        checked ? "border-red-500 bg-red-500 text-white" : "border-zinc-600 bg-zinc-900 hover:border-red-400"
      )}
    >
      {checked && (
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10.5l4 4 8-9" />
        </svg>
      )}
    </button>
  );
}

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-zinc-800", className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-400 transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

function Countdown() {
  // Presentation slot starts 13:00 on deadline day
  const target = useMemo(() => new Date(2026, 10, 13, 13, 0, 0), []);
  const c = useCountdown(target);
  const cells: [number, string][] = [
    [c.days, "days"],
    [c.hours, "hrs"],
    [c.minutes, "min"],
    [c.seconds, "sec"],
  ];
  if (c.passed) {
    return <p className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300">Deadline reached — good luck! 🎉</p>;
  }
  return (
    <div className="flex gap-2">
      {cells.map(([v, l]) => (
        <div key={l} className="w-16 rounded-xl border border-zinc-800 bg-zinc-900/70 py-2 text-center backdrop-blur">
          <div className="font-mono text-2xl font-bold tabular-nums text-white">{String(v).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [done, setDone] = useLocalStorage<Record<string, boolean>>("br-roadmap-done", {});
  const [filter, setFilter] = useState<Owner | "Everyone">("Everyone");
  const [dod, setDod] = useLocalStorage<Record<number, boolean>>("br-roadmap-dod", {});
  const [names, setNames] = useLocalStorage<Record<string, string>>("br-roadmap-names", {});
  const [copied, setCopied] = useState(false);

  const allTaskIds = weeks.flatMap((w) => w.blocks.flatMap((b) => b.tasks.map((_, i) => `${b.id}-${i}`)));
  const doneCount = allTaskIds.filter((id) => done[id]).length;
  const pct = Math.round((doneCount / allTaskIds.length) * 100);

  const toggle = (id: string) => setDone((d) => ({ ...d, [id]: !d[id] }));

  const matches = (o: Owner) => filter === "Everyone" || o === filter || o === "All";

  const copyStandup = async () => {
    try {
      await navigator.clipboard.writeText(standupTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const renderWeek = (wi: number) => {
    const week = weeks[wi];
    return (
      <section key={week.id} id={`week${wi + 1}`} className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle eyebrow={`${week.label} · ${week.range}`} title={week.title} />
        <div className="relative space-y-8 border-l border-zinc-800 pl-6 sm:pl-10">
          {week.blocks.map((b) => {
            const ids = b.tasks.map((_, i) => `${b.id}-${i}`);
            const bd = ids.filter((id) => done[id]).length;
            const bp = Math.round((bd / ids.length) * 100);
            const isDemoBlock = b.id === "d910";
            return (
              <article key={b.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[31px] top-2 h-3 w-3 rounded-full ring-4 ring-zinc-950 sm:-left-[47px]",
                    bp === 100 ? "bg-emerald-400" : "bg-red-500"
                  )}
                />
                <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-5 py-4">
                    <div>
                      <p className="font-mono text-xs text-red-400">
                        {b.days} · {b.date}
                      </p>
                      <h3 className="text-lg font-semibold text-white">{b.title}</h3>
                    </div>
                    <div className="w-32">
                      <div className="mb-1 flex justify-between font-mono text-[11px] text-zinc-500">
                        <span>
                          {bd}/{ids.length}
                        </span>
                        <span>{bp}%</span>
                      </div>
                      <ProgressBar value={bp} />
                    </div>
                  </header>

                  <div className="hidden grid-cols-[1.6fr_110px_1fr] gap-4 border-b border-zinc-800/70 px-5 py-2 font-mono text-[11px] uppercase tracking-wider text-zinc-500 md:grid">
                    <span>Task</span>
                    <span>Owner</span>
                    <span>Deliverable</span>
                  </div>

                  <ul className="divide-y divide-zinc-800/70">
                    {b.tasks.map((t, i) => {
                      const id = `${b.id}-${i}`;
                      const checked = !!done[id];
                      const dim = !matches(t.owner);
                      return (
                        <li
                          key={id}
                          className={cn(
                            "grid gap-2 px-5 py-3.5 transition md:grid-cols-[1.6fr_110px_1fr] md:items-start md:gap-4",
                            dim && "opacity-25",
                            "hover:bg-zinc-800/30"
                          )}
                        >
                          <div className="flex gap-3">
                            <Check checked={checked} onChange={() => toggle(id)} label={t.task} />
                            <div>
                              <p className={cn("text-sm leading-relaxed", checked ? "text-zinc-500 line-through" : "text-zinc-200")}>{t.task}</p>
                              {t.tag && <Pill className="mt-1.5 bg-red-500/10 text-red-300 ring-red-500/30">{t.tag}</Pill>}
                            </div>
                          </div>
                          <div className="pl-8 md:pl-0">
                            <Pill className={ownerStyle[t.owner]}>{t.owner}</Pill>
                          </div>
                          <code className="pl-8 font-mono text-xs leading-relaxed text-zinc-400 md:pl-0">{t.deliverable}</code>
                        </li>
                      );
                    })}
                  </ul>

                  {b.milestone && (
                    <div className="flex items-start gap-3 border-t border-zinc-800 bg-red-500/5 px-5 py-3 text-sm">
                      <span className="text-base">🏁</span>
                      <p className="text-zinc-300">
                        <span className="font-semibold text-red-300">Milestone: </span>
                        {b.milestone}
                      </p>
                    </div>
                  )}

                  {isDemoBlock && (
                    <div className="border-t border-zinc-800 p-5">
                      <h4 className="mb-3 text-sm font-semibold text-white">🛡️ Emulation Safety Rules</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ul className="space-y-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                          {safetyRules.never.map((r) => (
                            <li key={r} className="flex items-start gap-2 text-sm text-red-200">
                              <span>❌</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                        <ul className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                          {safetyRules.always.map((r) => (
                            <li key={r} className="flex items-start gap-2 text-sm text-emerald-200">
                              <span>✅</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {b.id === "d11" && (
                    <div className="border-t border-zinc-800 p-5">
                      <h4 className="mb-3 text-sm font-semibold text-white">🎞️ Slide Template (12–15 slides)</h4>
                      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {slides.map((s) => (
                          <li key={s.n} className="flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 font-mono text-xs font-bold text-zinc-300">
                              {s.n}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-100">{s.title}</p>
                              {s.sub && <p className="text-xs text-zinc-500">{s.sub}</p>}
                              {s.demo && <Pill className="mt-1.5 bg-red-500/10 text-red-300 ring-red-500/30">▶ {s.demo}</Pill>}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <a href="#top" className="shrink-0 font-mono text-sm font-bold text-white">
            <span className="text-red-500">●</span> BAD_RABBIT
          </a>
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-md px-2.5 py-1 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header id="top" className="relative overflow-hidden border-b border-zinc-800">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-red-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-wrap gap-2">
            <Pill className="bg-red-500/10 text-red-300 ring-red-500/30">Deadline: Friday, 13 November 2026</Pill>
            <Pill className="bg-zinc-800/60 text-zinc-300 ring-zinc-700">Team: 4–5 members</Pill>
            <Pill className="bg-emerald-500/10 text-emerald-300 ring-emerald-500/30">Research + Safe Emulation Demo</Pill>
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Bad Rabbit Malware Analysis
            <span className="block bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">2-Week Execution Roadmap</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-zinc-400">
            From source collection to a live, safe emulation demo: 12 working days, 5 roles, 3 demos, one report and one presentation.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-end">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-zinc-500">Presentation starts in</p>
              <Countdown />
            </div>
            <div className="max-w-md rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur lg:ml-auto lg:w-full">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm text-zinc-400">Overall task progress</span>
                <span className="font-mono text-lg font-bold text-white">{pct}%</span>
              </div>
              <ProgressBar value={pct} className="h-2" />
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>
                  {doneCount} of {allTaskIds.length} tasks complete
                </span>
                {doneCount > 0 && (
                  <button onClick={() => setDone({})} className="text-zinc-500 underline-offset-2 hover:text-red-300 hover:underline">
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["12", "working days"],
              ["3", "safe demos"],
              ["12–15", "slides"],
              ["<18 min", "rehearsal"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="text-2xl font-bold text-white">{v}</div>
                <div className="text-xs uppercase tracking-wider text-zinc-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="sticky top-[53px] z-20 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-2.5 sm:px-6">
          <span className="shrink-0 font-mono text-xs uppercase tracking-wider text-zinc-500">Highlight owner</span>
          {(["Everyone", ...OWNERS.filter((o) => o !== "All")] as const).map((o) => (
            <button
              key={o}
              onClick={() => setFilter(o)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition",
                filter === o ? "bg-red-500 text-white ring-red-500" : "bg-zinc-900 text-zinc-400 ring-zinc-700 hover:text-white"
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {renderWeek(0)}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      </div>
      {renderWeek(1)}

      {/* Deadline day */}
      <section id="deadline" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle eyebrow="Day 12 · Fri, Nov 13" title="Deadline Day" />
        <div className="overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/40 to-zinc-900/50">
          {deadlineSchedule.map((r, i) => (
            <div
              key={r.time}
              className={cn(
                "flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-6",
                i > 0 && "border-t border-zinc-800/70",
                (r.kind === "submit" || r.kind === "present") && "bg-red-500/10"
              )}
            >
              <span className="w-32 shrink-0 font-mono text-sm font-semibold text-red-300">{r.time}</span>
              <span className={cn("text-sm", r.kind === "submit" || r.kind === "present" ? "font-semibold text-white" : "text-zinc-300")}>
                {r.activity}
              </span>
              {r.kind === "submit" && <Pill className="bg-red-500/20 text-red-200 ring-red-500/40 sm:ml-auto">Submission</Pill>}
              {r.kind === "present" && <Pill className="bg-red-500/20 text-red-200 ring-red-500/40 sm:ml-auto">Showtime</Pill>}
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle eyebrow="Team" title="Role Assignments">
          <p className="text-sm text-zinc-500">Type names below — saved in your browser.</p>
        </SectionTitle>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <div key={r.role} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-semibold text-white">{r.role}</h3>
              <p className="mt-1 text-sm text-zinc-400">{r.deliverables}</p>
              <div className="mt-4 space-y-2">
                {(["Primary owner", "Backup"] as const).map((k) => {
                  const key = `${r.role}|${k}`;
                  return (
                    <label key={k} className="block">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{k}</span>
                      <input
                        value={names[key] ?? ""}
                        onChange={(e) => setNames((n) => ({ ...n, [key]: e.target.value }))}
                        placeholder="Name…"
                        className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-white placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-red-500/30 bg-red-500/5 p-5">
            <h3 className="font-semibold text-red-200">📣 Team Lead</h3>
            <p className="mt-2 text-sm text-zinc-300">Post this roadmap in the group chat.</p>
            <p className="mt-2 text-sm text-zinc-300">
              <span className="font-semibold text-white">Each member:</span> claim your tasks by EOD Nov 2.
            </p>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle eyebrow="Stack" title="Tools & Templates" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <div key={t.need} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-red-400">{t.need}</p>
              <p className="mt-1 text-sm text-zinc-200">{t.tool}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Risks */}
      <section id="risks" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle eyebrow="Contingency" title="⚠️ Risk Register & Mitigations" />
        <div className="grid gap-4 md:grid-cols-2">
          {risks.map((r) => (
            <div key={r.risk} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h3 className="font-semibold text-white">{r.risk}</h3>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  Likelihood <Pill className={levelStyle[r.likelihood]}>{r.likelihood}</Pill>
                </span>
                <span className="flex items-center gap-1.5">
                  Impact <Pill className={levelStyle[r.impact]}>{r.impact}</Pill>
                </span>
              </div>
              <p className="mt-3 border-t border-zinc-800 pt-3 text-sm text-zinc-300">
                <span className="font-semibold text-emerald-300">Mitigation: </span>
                {r.mitigation}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DoD */}
      <section id="done" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle eyebrow="Finish line" title="✅ Definition of Done">
          <span className="font-mono text-sm text-zinc-400">
            {Object.values(dod).filter(Boolean).length}/{definitionOfDone.length}
          </span>
        </SectionTitle>
        <ul className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
          {definitionOfDone.map((d, i) => (
            <li key={d} className={cn("flex gap-3 px-5 py-3.5", i > 0 && "border-t border-zinc-800/70")}>
              <Check checked={!!dod[i]} onChange={() => setDod((s) => ({ ...s, [i]: !s[i] }))} label={d} />
              <span className={cn("text-sm", dod[i] ? "text-zinc-500 line-through" : "text-zinc-200")}>{d}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Standup */}
      <section id="standup" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionTitle eyebrow="Daily · 15 min · async or sync" title="📌 Standup Template" />
        <div className="max-w-xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
            <span className="font-mono text-xs text-zinc-500">standup.txt</span>
            <button onClick={copyStandup} className="rounded-md bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200 transition hover:bg-red-500 hover:text-white">
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-emerald-300">{standupTemplate}</pre>
        </div>
      </section>

      <footer className="border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        Bad Rabbit Analysis · Due Fri 13 Nov 2026 · Educational research &amp; safe emulation only
      </footer>
    </div>
  );
}
