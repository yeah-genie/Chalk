"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Interactive How It Works
function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep(s => (s + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [isInView]);

  const steps = [
    { 
      id: "connect",
      title: "Connect", 
      desc: "Link your Zoom account or upload session recordings",
    },
    { 
      id: "analyze",
      title: "Analyze", 
      desc: "AI processes speech patterns, engagement, and clarity",
    },
    { 
      id: "learn",
      title: "Learn", 
      desc: "See exactly which teaching methods get results",
    },
  ];

  return (
    <div ref={ref} className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Left: Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <motion.button
            key={step.id}
            onClick={() => setActiveStep(i)}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.1 }}
            className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
              activeStep === i 
                ? "bg-zinc-900/80 border-zinc-700" 
                : "bg-transparent border-transparent hover:bg-zinc-900/40"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                activeStep === i ? "bg-white text-black" : "bg-zinc-800 text-zinc-500"
              }`}>
                {i + 1}
              </div>
              <div>
                <h3 className={`font-medium transition-colors ${activeStep === i ? "text-white" : "text-zinc-500"}`}>
                  {step.title}
                </h3>
                <p className={`text-sm mt-0.5 transition-colors ${activeStep === i ? "text-zinc-400" : "text-zinc-600"}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Right: Interactive Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl" />
        <div className="relative bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden">
          {/* Window header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <span className="text-xs text-zinc-600 ml-2">Chalk</span>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[280px]">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="connect"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-zinc-500">Connect your platform</p>
                  <div className="space-y-3">
                    {["Zoom", "Google Meet", "Upload file"].map((platform, i) => (
                      <motion.div
                        key={platform}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors cursor-pointer"
                      >
                        <span className="text-sm text-zinc-300">{platform}</span>
                        <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div
                  key="analyze"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <p className="text-sm text-zinc-400">Analyzing session...</p>
                  </div>
                  
                  {/* Waveform */}
                  <div className="flex items-center gap-1 h-16 py-4">
                    {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 4 }}
                        animate={{ height: 8 + Math.sin(i * 0.5) * 20 + Math.random() * 10 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                        className="w-1.5 bg-gradient-to-t from-cyan-500/40 to-cyan-500 rounded-full"
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "60%" }}
                      transition={{ duration: 2 }}
                      className="h-1 bg-cyan-500/50 rounded-full"
                    />
                    <p className="text-xs text-zinc-600">Transcribing speech patterns...</p>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="learn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-zinc-500">Session insights</p>
                  
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-500">Talk ratio</span>
                      <span className="text-zinc-300">You 72%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "72%" }}
                        transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <p className="text-xs text-emerald-400">Best method</p>
                      <p className="text-sm text-zinc-300 mt-1">Visual diagram</p>
                      <p className="text-lg font-semibold text-emerald-400">85%</p>
                    </div>
                    <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                      <p className="text-xs text-zinc-500">Needs work</p>
                      <p className="text-sm text-zinc-400 mt-1">Verbal only</p>
                      <p className="text-lg font-semibold text-zinc-500">62%</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Interactive Privacy Section
function PrivacySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const items = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Local processing",
      desc: "Analysis happens on secure servers, never shared"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      title: "Auto-delete",
      desc: "Recordings deleted immediately after analysis"
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      title: "Your eyes only",
      desc: "Only you can access your session data"
    },
  ];

  return (
    <div ref={ref} className="grid md:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1 }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`relative p-6 rounded-xl border transition-all duration-300 cursor-default ${
            hoveredIndex === i 
              ? "bg-zinc-900/80 border-zinc-700" 
              : "bg-zinc-900/30 border-zinc-800/50"
          }`}
        >
          {hoveredIndex === i && (
            <motion.div
              layoutId="privacy-glow"
              className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors ${
              hoveredIndex === i ? "bg-cyan-500/20 text-cyan-400" : "bg-zinc-800 text-zinc-500"
            }`}>
              {item.icon}
            </div>
            <h3 className="font-medium text-white mb-1">{item.title}</h3>
            <p className="text-sm text-zinc-500">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Metrics Demo
function MetricsDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInView) setTimeout(() => setShow(true), 300);
  }, [isInView]);

  return (
    <div ref={ref} className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent rounded-2xl blur-xl" />
      <div className="relative bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <span className="text-xs text-zinc-600 ml-2">Session Analysis</span>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Speaking ratio */}
          <div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-zinc-500">Speaking balance</span>
              <span className="text-zinc-300">You 78% · Student 22%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={show ? { width: "78%" } : {}}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* Attention drops */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-amber-200">3 attention drops detected</p>
                <p className="text-xs text-zinc-500 mt-0.5">at 4:32, 12:15, 18:47</p>
              </div>
            </div>
          </motion.div>

          {/* Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-zinc-500 mb-3">Method comparison</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <p className="text-xs text-emerald-400 mb-1">Winner</p>
                <p className="text-sm text-zinc-300">Visual + verbal</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-2xl font-semibold text-emerald-400">85%</span>
                  <span className="text-xs text-emerald-500 mb-1">understood</span>
                </div>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-600 mb-1">Alternative</p>
                <p className="text-sm text-zinc-400">Verbal only</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-2xl font-semibold text-zinc-500">62%</span>
                  <span className="text-xs text-zinc-600 mb-1">understood</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// FAQ
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  
  const items = [
    { q: "How does the analysis work?", a: "Connect Zoom or upload recordings. Our AI transcribes the session, analyzes speech patterns, identifies engagement drops, and compares teaching methods." },
    { q: "Is my data private?", a: "Yes. Recordings are processed on secure servers and deleted immediately after analysis. Only you can access your insights." },
    { q: "What metrics do you track?", a: "Speaking balance, engagement patterns, explanation effectiveness, question frequency, and comprehension signals from student responses." },
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
            <svg className={`w-5 h-5 text-zinc-600 transition-transform ${open === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
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

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [count, setCount] = useState(0);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  useEffect(() => {
    fetch("/api/waitlist").then(r => r.json()).then(d => d.count && setCount(d.count)).catch(() => {});
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
          <span className="text-xs text-zinc-600">Teaching analytics for tutors</span>
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
              See what works
              <br />
              <span className="text-zinc-500">in your teaching</span>
            </h1>
            
            <p className="text-lg text-zinc-400 mb-10 max-w-md mx-auto">
              AI analyzes your tutoring sessions. Find out which explanations actually get results.
            </p>

            {status === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl"
              >
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-zinc-300">You're on the list</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-white text-black font-medium px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Join beta
                </button>
              </form>
            )}
            
            {count > 0 && (
              <p className="text-sm text-zinc-600 mt-4">{count} tutors on the waitlist</p>
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

      {/* How it works */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-cyan-400 mb-3">How it works</p>
            <h2 className="text-3xl font-semibold text-white">Three steps to better teaching</h2>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* What you'll see */}
      <section className="py-32 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-cyan-400 mb-3">Insights</p>
            <h2 className="text-3xl font-semibold text-white">What you'll discover</h2>
          </div>
          <MetricsDemo />
        </div>
      </section>

      {/* Privacy */}
      <section className="py-32 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-cyan-400 mb-3">Privacy first</p>
            <h2 className="text-3xl font-semibold text-white">Your data stays yours</h2>
          </div>
          <PrivacySection />
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
          <h2 className="text-2xl font-semibold text-white mb-3">Ready to improve?</h2>
          <p className="text-zinc-500 mb-8">Free during beta. No credit card required.</p>
          
          {status === "success" ? (
            <p className="text-zinc-400">We'll email you when we launch</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-white text-black font-medium px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
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
