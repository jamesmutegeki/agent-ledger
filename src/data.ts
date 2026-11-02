export type Owner = "Lead" | "Tech 1" | "Tech 2" | "Detection" | "Presenter" | "All";

export interface Task {
  task: string;
  owner: Owner;
  deliverable: string;
  tag?: string;
}

export interface DayBlock {
  id: string;
  days: string;
  title: string;
  date: string;
  tasks: Task[];
  milestone?: string;
}

export interface Week {
  id: string;
  label: string;
  title: string;
  range: string;
  blocks: DayBlock[];
}

export const OWNERS: Owner[] = ["Lead", "Tech 1", "Tech 2", "Detection", "Presenter", "All"];

export const weeks: Week[] = [
  {
    id: "w1",
    label: "Week 1",
    title: "Research & Foundation",
    range: "Nov 2 – 8",
    blocks: [
      {
        id: "d12",
        days: "Day 1–2",
        title: "Kickoff & Source Collection",
        date: "Mon – Tue",
        tasks: [
          { task: "Assign roles (Lead, Tech×2, Detection, Presenter)", owner: "All", deliverable: "Role doc in shared drive" },
          { task: "Collect primary sources (Kaspersky, ESET, Talos, MSRC, MITRE)", owner: "Tech 1", deliverable: "Zotero/Notion library with 15+ sources" },
          { task: "Extract IOCs, YARA rules, hash lists", owner: "Detection", deliverable: "iocs.md, yara_rules.yar" },
          { task: "Build Kill Chain mapping table", owner: "Tech 2", deliverable: "kill_chain.md" },
          { task: "Set up repo structure (report/, slides/, demo/, sources/)", owner: "Lead", deliverable: "Git repo initialized" },
        ],
        milestone: "All sources collected, roles locked, repo ready.",
      },
      {
        id: "d34",
        days: "Day 3–4",
        title: "Technical Deep Dive",
        date: "Wed – Thu",
        tasks: [
          { task: "Infection chain: watering hole → Flash installer → dispci.exe / infpub.dat", owner: "Tech 1", deliverable: "infection_chain.md + diagram" },
          { task: "Persistence: Scheduled tasks (drogon / rhaegal) + WMI event subscription", owner: "Tech 2", deliverable: "persistence.md" },
          { task: "PrivEsc: Mimikatz integration, credential dumping, pass-the-hash", owner: "Tech 1", deliverable: "privesc.md" },
          { task: "Lateral movement: SMB (psexec-style) + WMI command execution", owner: "Tech 2", deliverable: "lateral_movement.md" },
          { task: "Encryption: DiskCryptor internals (AES-256-XTS, RSA-2048 key wrapping)", owner: "Tech 1", deliverable: "encryption.md" },
          { task: "Ransom note, Tor payment, countdown timer", owner: "Detection", deliverable: "ransom.md" },
        ],
        milestone: "Technical behavior fully documented with primary-source citations.",
      },
      {
        id: "d56",
        days: "Day 5–6",
        title: "Detection, Impact & Lessons",
        date: "Fri – Sat",
        tasks: [
          { task: "Behavioral IOCs: WMIC, scheduled tasks, DiskCryptor driver load", owner: "Detection", deliverable: "detection.md" },
          { task: "YARA rule validation on sample strings", owner: "Detection", deliverable: "yara_validated.yar" },
          { task: "Kaspersky “vaccine” mechanism analysis", owner: "Tech 2", deliverable: "mitigation.md" },
          { task: "Impact timeline: Interfax, Fontanka, Odessa Airport, Kiev Metro", owner: "Lead", deliverable: "impact.md" },
          { task: "Attribution: Sandworm/GRU evidence chain", owner: "Tech 1", deliverable: "attribution.md" },
          { task: "Lessons mapped to course concepts (risk, hardening, IR, monitoring)", owner: "All", deliverable: "lessons.md" },
        ],
        milestone: "Detection / Impact / Lessons complete. Week 1 Review Meeting (Sat 6pm).",
      },
      {
        id: "d7",
        days: "Day 7",
        title: "Report Draft Assembly",
        date: "Sun",
        tasks: [
          { task: "Merge all .md → report/draft_v1.md (structure per assignment)", owner: "Lead", deliverable: "Full draft v1" },
          { task: "Citation audit: every claim sourced", owner: "All", deliverable: "Annotated bibliography" },
          { task: "Gap analysis: missing sections?", owner: "Lead", deliverable: "gaps.md" },
        ],
      },
    ],
  },
  {
    id: "w2",
    label: "Week 2",
    title: "Polish, Demo & Presentation",
    range: "Nov 9 – 13",
    blocks: [
      {
        id: "d8",
        days: "Day 8",
        title: "Report Finalization",
        date: "Mon",
        tasks: [
          { task: "Fill gaps, unify voice, format per rubric", owner: "Lead", deliverable: "report/final.md" },
          { task: "Convert to PDF/Word per submission reqs", owner: "Lead", deliverable: "report/Bad_Rabbit_Analysis.pdf" },
          { task: "Peer review (swap with another group if possible)", owner: "All", deliverable: "Review notes" },
        ],
        milestone: "Report submitted or ready to submit.",
      },
      {
        id: "d910",
        days: "Day 9–10",
        title: "Safe Emulation Demo Build",
        date: "Tue – Wed",
        tasks: [
          { task: "Demo 1: Lateral Movement Simulator (Python, prints WMIC/SMB commands only)", owner: "Tech 2", deliverable: "demo/lateral_sim.py", tag: "Demo 1" },
          { task: "Demo 2: YARA Live Match (scan infpub.dat strings → rule trigger)", owner: "Detection", deliverable: "demo/yara_demo.py + test file", tag: "Demo 2" },
          { task: "Demo 3: Kaspersky Vaccine Sim (creates read-only infpub.dat / cscc.dat)", owner: "Tech 1", deliverable: "demo/vaccine_sim.py", tag: "Demo 3" },
          { task: "Record demo videos (backup for live failure)", owner: "Presenter", deliverable: "demo/videos/" },
          { task: "Test in isolated VM (no network)", owner: "All", deliverable: "Verified working" },
        ],
      },
      {
        id: "d11",
        days: "Day 11",
        title: "Presentation Build",
        date: "Thu",
        tasks: [
          { task: "Slide deck: 12–15 slides (template below)", owner: "Presenter", deliverable: "slides/presentation.pptx" },
          { task: "Kill Chain diagram (draw.io / Excalidraw)", owner: "Tech 1", deliverable: "slides/kill_chain.svg" },
          { task: "Lateral movement graph (NetworkX → PNG)", owner: "Tech 2", deliverable: "slides/lateral_graph.png" },
          { task: "Encryption flow diagram", owner: "Tech 1", deliverable: "slides/encryption_flow.svg" },
          { task: "Demo script + speaker notes", owner: "Presenter", deliverable: "slides/demo_script.md" },
        ],
      },
    ],
  },
];

export const safetyRules = {
  never: ["No actual WMIC/SMB execution", "No DiskCryptor driver load", "No Mimikatz"],
  always: ["Print commands only", "YARA match on static strings", "File creation simulation (read-only vaccine files)"],
};

export const slides: { n: number; title: string; sub?: string; demo?: string }[] = [
  { n: 1, title: "Title + Team" },
  { n: 2, title: "Why Bad Rabbit?", sub: "Context, Sandworm, NotPetya link" },
  { n: 3, title: "Timeline & Targets", sub: "Map + dates" },
  { n: 4, title: "Kill Chain Overview" },
  { n: 5, title: "Infection Chain", sub: "Watering hole → Flash installer" },
  { n: 6, title: "Persistence", sub: "Tasks + WMI" },
  { n: 7, title: "PrivEsc & Credential Theft", sub: "Mimikatz" },
  { n: 8, title: "Lateral Movement", sub: "SMB + WMI", demo: "Demo 1" },
  { n: 9, title: "Encryption", sub: "DiskCryptor, AES-256-XTS + RSA-2048" },
  { n: 10, title: "Detection & IOCs", sub: "Behavioral + YARA", demo: "Demo 2" },
  { n: 11, title: "Kaspersky Vaccine", demo: "Demo 3" },
  { n: 12, title: "Impact & Attribution" },
  { n: 13, title: "Lessons for Defenders", sub: "Course concepts" },
  { n: 14, title: "References", sub: "Primary sources" },
  { n: 15, title: "Q&A" },
];

export const deadlineSchedule: { time: string; activity: string; kind: "work" | "submit" | "present" | "party" | "buffer" }[] = [
  { time: "09:00–10:30", activity: "Final rehearsal (full run-through + demos)", kind: "work" },
  { time: "10:30–11:00", activity: "Buffer: fix demo issues, sync files", kind: "buffer" },
  { time: "11:00–12:00", activity: "Submit Report (portal/email)", kind: "submit" },
  { time: "13:00–15:00", activity: "Presentation Slot (per class schedule)", kind: "present" },
  { time: "15:00+", activity: "Celebrate 🎉", kind: "party" },
];

export const roles: { role: string; deliverables: string }[] = [
  { role: "Lead / Writer", deliverables: "Report structure, final edit, submission, gaps" },
  { role: "Technical Analyst 1", deliverables: "Infection, PrivEsc, Encryption, Attribution" },
  { role: "Technical Analyst 2", deliverables: "Persistence, Lateral Movement, Vaccine" },
  { role: "Detection Specialist", deliverables: "IOCs, YARA, Behavioral detection, Demo 2" },
  { role: "Presenter / Visuals", deliverables: "Slides, diagrams, demo scripts, rehearsal lead" },
];

export const tools: { need: string; tool: string }[] = [
  { need: "Reference management", tool: "Zotero (shared group library)" },
  { need: "Diagrams", tool: "draw.io / Excalidraw / Mermaid" },
  { need: "Slide deck", tool: "PowerPoint / Google Slides" },
  { need: "Code demo", tool: "Python 3.10+ (standard lib only)" },
  { need: "YARA testing", tool: "yara-python or CLI yara" },
  { need: "VM isolation", tool: "VirtualBox / VMware / Hyper-V (Windows sandbox)" },
  { need: "Version control", tool: "Git (GitHub Classroom or private repo)" },
];

export type Level = "Low" | "Medium" | "High";
export const risks: { risk: string; likelihood: Level; impact: Level; mitigation: string }[] = [
  { risk: "Demo fails live", likelihood: "Medium", impact: "High", mitigation: "Pre-recorded videos; test in VM daily" },
  { risk: "Report gaps found late", likelihood: "Medium", impact: "High", mitigation: "Daily standups; gap doc updated daily" },
  { risk: "Source conflicts (attribution)", likelihood: "Low", impact: "Medium", mitigation: "Cite multiple vendors; use “assessed” language" },
  { risk: "Member dropout", likelihood: "Low", impact: "High", mitigation: "Cross-train; backup owns 2nd area" },
  { risk: "Time overrun on encryption deep-dive", likelihood: "Medium", impact: "Medium", mitigation: "Timebox: 4 hrs max; use Kaspersky diagram" },
];

export const definitionOfDone: string[] = [
  "Report submitted (PDF/Word, < 3000 words excl. refs, all sections covered)",
  "Slides complete (12–15 slides, diagrams embedded, speaker notes)",
  "Three demos work in isolated VM (lateral sim, YARA, vaccine)",
  "Demo videos recorded as backup",
  "All primary sources cited (vendor blogs, CERT, MITRE, leaked code analyses)",
  "Rehearsal completed < 18 min (leaves 2 min buffer)",
  "Git repo pushed with full history",
];

export const standupTemplate = `Date: 
Yesterday: 
Today: 
Blockers: 
Demo status: `;
