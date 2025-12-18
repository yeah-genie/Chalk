"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Icons
function MicIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// macOS window header
function WindowHeader({ title, variant = "default" }: { title: string; variant?: "default" | "dark" }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 border-b ${variant === "dark" ? "border-zinc-800 bg-zinc-950" : "border-zinc-800/80 bg-zinc-900/50"}`}>
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
      </div>
      <span className="text-xs text-zinc-500 ml-2">{title}</span>
    </div>
  );
}

// ============================================
// DEMO 1: Transformation Story Preview
// ============================================
function TransformationDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentStep, setCurrentStep] = useState(0);

  const journey = [
    {
      month: "Mar",
      status: "Start",
      concept: "Fractions",
      struggle: "Couldn't add unlike denominators",
      blockFreq: 8,
      color: "red"
    },
    {
      month: "Apr",
      status: "Progress",
      concept: "Linear equations",
      struggle: "Understanding equals sign",
      blockFreq: 5,
      color: "amber"
    },
    {
      month: "May",
      status: "Breakthrough",
      concept: "Quadratics",
      struggle: "Mastered quadratic formula",
      blockFreq: 3,
      color: "cyan"
    },
    {
      month: "Jun",
      status: "Mastery",
      concept: "Functions",
      struggle: "None — self-directed learning",
      blockFreq: 1,
      color: "emerald"
    },
  ];

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setCurrentStep(s => (s + 1) % journey.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isInView, journey.length]);

  const getColorClass = (color: string, type: "bg" | "text" | "border") => {
    const colors: Record<string, Record<string, string>> = {
      red: { bg: "bg-red-500", text: "text-red-400", border: "border-red-500/30" },
      amber: { bg: "bg-amber-500", text: "text-amber-400", border: "border-amber-500/30" },
      cyan: { bg: "bg-cyan-500", text: "text-cyan-400", border: "border-cyan-500/30" },
      emerald: { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30" },
    };
    return colors[color]?.[type] || "";
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden">
        <WindowHeader title="Student A — Transformation Story" variant="dark" />

        <div className="p-6">
          {/* Progress Timeline */}
          <div className="relative mb-8">
            <div className="flex justify-between items-center">
              {journey.map((step, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${i === currentStep
                      ? `${getColorClass(step.color, "bg")} text-white shadow-lg`
                      : i < currentStep
                        ? "bg-zinc-700 text-zinc-300"
                        : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                      }`}
                  >
                    {step.month}
                  </motion.div>
                  <span className={`text-[10px] mt-2 ${i === currentStep ? getColorClass(step.color, "text") : "text-zinc-600"}`}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress line */}
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-zinc-800 -z-10">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 via-amber-500 via-cyan-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={isInView ? { width: `${(currentStep / (journey.length - 1)) * 100}%` } : {}}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Current Step Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-5 rounded-xl border ${getColorClass(journey[currentStep].color, "border")} bg-gradient-to-br from-zinc-900/50 to-zinc-900/20`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${getColorClass(journey[currentStep].color, "bg")} bg-opacity-20 ${getColorClass(journey[currentStep].color, "text")}`}>
                      {journey[currentStep].month}
                    </span>
                    <span className="text-sm font-medium text-white">{journey[currentStep].concept}</span>
                  </div>
                  <p className="text-zinc-400 text-sm">{journey[currentStep].struggle}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{journey[currentStep].blockFreq}</p>
                  <p className="text-[10px] text-zinc-500">blocks/lesson</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { value: "24", label: "Total lessons", change: null },
              { value: "75%↓", label: "Fewer blocks", change: "emerald" },
              { value: "12", label: "Concepts mastered", change: "cyan" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50 text-center"
              >
                <p className={`text-lg font-bold ${stat.change ? getColorClass(stat.change, "text") : "text-white"}`}>{stat.value}</p>
                <p className="text-[10px] text-zinc-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DEMO 2: Proof Card Preview
// ============================================
function ProofCardDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative">
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-transparent to-emerald-500/10 rounded-3xl blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="relative"
      >
        {/* Card container - Instagram story aspect */}
        <div className="max-w-[320px] mx-auto bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-700/50 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-5 pb-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                E
              </div>
              <div>
                <p className="text-white font-semibold">Emma Chen</p>
                <p className="text-xs text-zinc-500">Math Tutor · 4 years exp.</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <ChartIcon />
              </div>
              <div>
                <p className="text-emerald-400 font-bold text-lg">+23 pts</p>
                <p className="text-[11px] text-zinc-400">Avg. grade improvement</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="p-3 bg-zinc-800/50 rounded-xl text-center"
              >
                <p className="text-xl font-bold text-white">87%</p>
                <p className="text-[10px] text-zinc-500">Retention rate</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="p-3 bg-zinc-800/50 rounded-xl text-center"
              >
                <p className="text-xl font-bold text-white">520h</p>
                <p className="text-[10px] text-zinc-500">Total hours</p>
              </motion.div>
            </div>

            {/* Transformation badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5 }}
              className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="text-amber-400">
                  <StarIcon />
                </div>
                <span className="text-xs text-amber-400 font-medium">Verified Results</span>
              </div>
              <p className="text-sm text-zinc-300">
                "24 lessons → <span className="text-emerald-400 font-semibold">75% fewer blocks</span>"
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">Anonymized real student data</p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-zinc-800/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-[10px] text-zinc-500">Verified by Chalk</span>
            </div>
            <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
              View profile →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// DEMO 3: Parent Report Preview
// ============================================
function ParentReportDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="relative bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden"
      >
        {/* Email header style */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
              C
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">Progress Report #5 — Alex</p>
              <p className="text-xs text-zinc-500">Emma Chen → Alex's Parents</p>
            </div>
            <span className="text-xs text-zinc-600">Just now</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-cyan-400 mb-2">Last 5 lessons summary</p>
            <div className="space-y-2 text-sm text-zinc-300">
              <p>📚 Covered: Quadratic equations, completing the square</p>
              <p>✅ Strengths: Formula recall improved, accuracy up</p>
              <p>📝 Focus area: Word problem interpretation</p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Overall progress</span>
              <span className="text-xs text-emerald-400">On track</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: "72%" } : {}}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-zinc-600">
              <span>Start</span>
              <span>72% complete</span>
              <span>Goal</span>
            </div>
          </motion.div>

          {/* Key insight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-emerald-300 font-medium mb-1">This month's highlight</p>
                <p className="text-xs text-zinc-400">Confusion frequency down <span className="text-emerald-400">42%</span> compared to last month. Alex is grasping concepts faster.</p>
              </div>
            </div>
          </motion.div>

          {/* Teacher comment */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl"
          >
            <p className="text-xs text-zinc-500 mb-1">Tutor's note</p>
            <p className="text-sm text-zinc-300 italic">"Alex is building real confidence. He's now attempting problems on his own before asking for help!"</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================
// How it works
// ============================================
function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      icon: <MicIcon />,
      title: "Connect once, auto-sync",
      desc: "Link Zoom or Meet. Lessons upload automatically after each session.",
      color: "cyan"
    },
    {
      icon: <ChartIcon />,
      title: "AI tracks transformation",
      desc: "Question patterns, confusion frequency, concept mastery — all tracked.",
      color: "emerald"
    },
    {
      icon: <ShareIcon />,
      title: "Get proof assets",
      desc: "Portfolio cards and parent reports generated automatically.",
      color: "amber"
    },
  ];

  return (
    <div ref={ref} className="relative">
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.15 }}
            className="relative p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:border-zinc-700/50 transition-colors"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.color === "cyan" ? "bg-cyan-500/10 text-cyan-400" :
              step.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
                "bg-amber-500/10 text-amber-400"
              }`}>
              {step.icon}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-zinc-400">{step.desc}</p>

            {/* Step number */}
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500 font-medium">
              {i + 1}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Privacy Section
// ============================================
function PrivacyBadges() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-zinc-500">
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
        </svg>
        Fully anonymized
      </span>
      <span className="hidden sm:block text-zinc-700">·</span>
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        No student data exposed
      </span>
      <span className="hidden sm:block text-zinc-700">·</span>
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        Recordings deleted in 24h
      </span>
    </div>
  );
}

// ============================================
// FAQ
// ============================================
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const items = [
    {
      q: "How is this different from other lesson analysis tools?",
      a: "Chalk doesn't critique your teaching. Instead, it tracks student transformation over time — documenting growth that becomes provable marketing assets you can share anywhere."
    },
    {
      q: "How is student privacy protected?",
      a: "All data is fully anonymized. Students appear as 'Student A' or 'Student B' — never by name. Parent reports are private to each family. Recordings are deleted within 24 hours."
    },
    {
      q: "What subjects does it work for?",
      a: "Any subject. Currently most effective for math, science, and subjects with clear concept progression. Language and coding support coming soon."
    },
    {
      q: "How much does it cost?",
      a: "Free during beta. After launch, pricing starts at $15/month. Your first 2 students are always free, forever."
    },
  ];

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-zinc-800/50 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900/30 transition-colors"
          >
            <span className="text-zinc-300">{item.q}</span>
            <motion.svg
              animate={{ rotate: open === i ? 180 : 0 }}
              className="w-5 h-5 text-zinc-600 flex-shrink-0 ml-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-zinc-500 leading-relaxed">{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [count, setCount] = useState(0);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  useEffect(() => {
    fetch("/api/waitlist").then(r => r.json()).then(d => d.count && setCount(d.count)).catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setCount(c => c + 1);
      }
    } catch {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white antialiased">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-cyan-500/[0.07] to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-lg border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-white">Chalk</Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-600 hidden sm:block">Lessons become proof</span>
            <Link
              href="/beta"
              className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-lg hover:bg-cyan-500/20 transition-colors"
            >
              Join Beta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, y: heroY }}
        className="min-h-screen flex items-center justify-center px-6 pt-14"
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Prove your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">teaching impact</span>
            </h1>

            <p className="text-lg text-zinc-400 mb-10 max-w-md mx-auto">
              Record lessons. AI tracks student growth.<br />
              Your teaching becomes provable evidence.
            </p>

            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg"
              >
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-zinc-300">You're on the list</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-white text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Join beta
                </button>
              </form>
            )}

            {count > 0 && (
              <p className="text-xs text-zinc-600 mt-4">{count} tutors on the waitlist</p>
            )}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-10 rounded-full border-2 border-zinc-800 flex items-start justify-center p-2"
            >
              <div className="w-1 h-2 bg-zinc-700 rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 1: Problem */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-cyan-400 mb-3">The problem</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
              How do you prove<br />you're a great tutor?
            </h2>
            <p className="text-zinc-500 max-w-lg mx-auto">
              Everyone claims experience. Reviews are all positive.<br />
              Parents want real evidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { problem: "5 years experience", reality: "Experience ≠ quality" },
              { problem: "4.9 star reviews", reality: "Easily manipulated" },
              { problem: "Top university grad", reality: "Irrelevant to teaching" },
            ].map((item, i) => (
              <motion.div
                key={item.problem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-zinc-900/30 border border-zinc-800/50 rounded-xl group"
              >
                <div className="relative inline-block mb-1">
                  <span className="text-zinc-400">{item.problem}</span>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.4, ease: "easeOut" }}
                    className="absolute left-0 top-1/2 h-[2px] bg-red-400/60"
                  />
                </div>
                <p className="text-red-400/80 text-sm">{item.reality}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Transformation Demo */}
      <section className="py-32 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-cyan-400 mb-3">The solution</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">Student growth is the proof</h2>
            <p className="text-zinc-500 mt-3 max-w-lg mx-auto">
              As lessons accumulate, AI automatically documents the transformation.
            </p>
          </div>
          <TransformationDemo />
        </div>
      </section>

      {/* Section 3: Proof Card */}
      <section className="py-32 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm text-cyan-400 mb-3">Marketing asset</p>
              <h2 className="text-3xl font-semibold text-white mb-4">Share once, attract students</h2>
              <p className="text-zinc-500 mb-6">
                Your lesson history becomes a portfolio automatically.<br />
                Share anywhere — platforms, social media, your website.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-zinc-400">Your website</span>
                <span className="text-xs px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-zinc-400">Tutor platforms</span>
                <span className="text-xs px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-zinc-400">Instagram</span>
                <span className="text-xs px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-zinc-400">LinkedIn</span>
              </div>
            </div>
            <ProofCardDemo />
          </div>
        </div>
      </section>

      {/* Section 4: Parent Report */}
      <section className="py-32 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <ParentReportDemo />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-sm text-cyan-400 mb-3">Parent trust</p>
              <h2 className="text-3xl font-semibold text-white mb-4">Reports write themselves</h2>
              <p className="text-zinc-500 mb-6">
                After each lesson, parent updates are auto-generated.<br />
                Stop spending time on admin.
              </p>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Auto-generated lesson summaries
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Visual progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Share via email or link
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: How it works */}
      <section className="py-32 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-cyan-400 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white">Just teach. We handle the rest.</h2>
          </div>
          <HowItWorks />
          <div className="mt-12">
            <PrivacyBadges />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 border-t border-zinc-800/50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-semibold text-white">Questions</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 border-t border-zinc-800/50">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">Prove your teaching impact</h2>
          <p className="text-zinc-500 mb-8">Free during beta. No credit card required.</p>

          {status === "success" ? (
            <p className="text-zinc-400">We'll email you when we launch</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-white text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-zinc-700">© 2025 Chalk</p>
        </div>
      </footer>
    </div>
  );
}
