"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Demo Flow Step Component
function DemoStep({ 
  step, 
  title, 
  description, 
  isActive,
  children 
}: { 
  step: number;
  title: string;
  description: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: step * 0.15 }}
      className={`p-5 rounded-xl border transition-all duration-300 ${
        isActive 
          ? "bg-cyan-500/5 border-cyan-500/30" 
          : "bg-zinc-900/30 border-zinc-800"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
          isActive ? "bg-cyan-500 text-white" : "bg-zinc-800 text-zinc-500"
        }`}>
          {step}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white mb-1">{title}</h3>
          <p className="text-sm text-zinc-400 mb-4">{description}</p>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// Connect Animation
function ConnectDemo() {
  const [connected, setConnected] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setConnected(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="flex items-center gap-3">
      {[
        { name: "Zoom", color: "bg-blue-500" },
        { name: "Meet", color: "bg-green-500" },
        { name: "Upload", color: "bg-zinc-600" },
      ].map((item, i) => (
        <motion.div
          key={item.name}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: i * 0.1 }}
          className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
            connected ? `${item.color} text-white` : "bg-zinc-800 text-zinc-400"
          } transition-all duration-500`}
        >
          {connected && (
            <motion.svg 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }}
              className="w-3 h-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
          {item.name}
        </motion.div>
      ))}
    </div>
  );
}

// Analyze Animation
function AnalyzeDemo() {
  const [phase, setPhase] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center gap-2 h-6">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ height: 4 }}
            animate={{ height: phase >= 1 ? 8 + Math.random() * 16 : 4 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="w-1.5 bg-cyan-500/60 rounded-full"
          />
        ))}
      </div>
      {phase >= 2 && (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-xs text-zinc-500"
        >
          Transcribing...
        </motion.p>
      )}
      {phase >= 3 && (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="text-xs text-cyan-400"
        >
          Analysis complete
        </motion.p>
      )}
    </div>
  );
}

// Metrics Preview Component
function MetricsPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShow(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-sm font-medium text-white">Session Analysis</span>
        <span className="text-xs text-zinc-500">Demo</span>
      </div>
      
      <div className="p-4 space-y-5">
        {/* Speaking Balance */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">Speaking Balance</span>
            <span className="text-white">80% You / 20% Student</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={show ? { width: "80%" } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
        </div>

        {/* Engagement Dips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
        >
          <span className="text-amber-400">📉</span>
          <div>
            <p className="text-sm text-white">3 moments where attention dropped</p>
            <p className="text-xs text-zinc-500">Click to review timestamps</p>
          </div>
        </motion.div>

        {/* A vs B */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-zinc-400 mb-2">Explanation Comparison</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <span className="text-sm text-white">Method A: Visual diagram</span>
              <span className="text-emerald-400 font-medium">85% understood</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <span className="text-sm text-zinc-300">Method B: Verbal only</span>
              <span className="text-zinc-400 font-medium">62% understood</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Privacy Section
function PrivacySection() {
  const items = [
    { icon: "🔒", text: "Process locally, delete after analysis" },
    { icon: "🎓", text: "Only you see your recordings" },
    { icon: "✓", text: "GDPR & COPPA compliant" },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg"
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-sm text-zinc-300">{item.text}</span>
        </motion.div>
      ))}
    </div>
  );
}

// FAQ Component
function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    { 
      q: "How does the analysis work?", 
      a: "Connect your Zoom account or upload recordings. Our AI transcribes the session, analyzes speaking patterns, identifies engagement dips, and compares different teaching methods you've used." 
    },
    { 
      q: "Is my data private?", 
      a: "Yes. Recordings are processed securely and deleted after analysis. We never share your data. Only you can see your session analytics." 
    },
    { 
      q: "What teaching metrics do you track?", 
      a: "Speaking balance (you vs student), engagement patterns, explanation effectiveness, question frequency, and concept comprehension signals." 
    },
  ];

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="border border-zinc-800 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-900/50 transition-colors"
          >
            <span className="text-sm text-white">{faq.q}</span>
            <svg className={`w-4 h-4 text-zinc-500 transition-transform ${openIndex === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 text-sm text-zinc-400">{faq.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success">("idle");
  const [waitlistCount, setWaitlistCount] = useState(127);

  useEffect(() => {
    fetch("/api/waitlist").then(r => r.json()).then(d => d.count && setWaitlistCount(d.count)).catch(() => {});
  }, []);

  // Auto-cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(s => s >= 3 ? 1 : s + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    
    setEmailStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setEmailStatus("success");
        setWaitlistCount(c => c + 1);
      }
    } catch {
      setEmailStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">C</div>
            Chalk
          </Link>
          <span className="text-xs text-zinc-500">For online tutors</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        
        {/* Hero */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight"
          >
            See what works in your teaching
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-400 max-w-xl mx-auto"
          >
            AI analyzes your online sessions. Discover which explanations actually get results.
          </motion.p>
        </div>

        {/* Demo Flow - 3 Steps */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          <DemoStep
            step={1}
            title="Connect"
            description="Connect Zoom or upload recordings"
            isActive={activeStep === 1}
          >
            <ConnectDemo />
          </DemoStep>

          <DemoStep
            step={2}
            title="Analyze"
            description="AI analyzes your sessions automatically"
            isActive={activeStep === 2}
          >
            <AnalyzeDemo />
          </DemoStep>

          <DemoStep
            step={3}
            title="Improve"
            description="See which explanations work best"
            isActive={activeStep === 3}
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-emerald-500/50 rounded-full" />
              <span className="text-xs text-emerald-400">85%</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-zinc-600/50 rounded-full" style={{ width: "62%" }} />
              <span className="text-xs text-zinc-500">62%</span>
            </div>
          </DemoStep>
        </div>

        {/* Metrics Preview */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-center mb-6">What you'll see</h2>
          <MetricsPreview />
        </div>

        {/* Privacy Section */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-center mb-6">Your data stays yours</h2>
          <PrivacySection />
        </div>

        {/* Email Signup */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16 p-8 bg-gradient-to-b from-cyan-500/5 to-transparent border border-cyan-500/10 rounded-2xl"
        >
          <h2 className="text-2xl font-semibold mb-2">Join the beta</h2>
          <p className="text-zinc-400 mb-6">Be first to try Chalk. Free for early adopters.</p>
          
          {emailStatus === "success" ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 inline-block">
              <p className="text-emerald-400">You're on the list! We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={emailStatus === "loading"}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Join beta
              </button>
            </form>
          )}
          
          <p className="text-xs text-zinc-600 mt-4">{waitlistCount}+ tutors waiting</p>
        </motion.div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-center mb-6">FAQ</h2>
          <FAQ />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-sm text-zinc-600">
        © 2025 Chalk
      </footer>
    </div>
  );
}
