"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

// Feature Section Component - Linear style
function FeatureSection({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={`min-h-[80vh] flex items-center justify-center px-6 py-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

// Connect Section - Show integrations
function ConnectSection() {
  const [connected, setConnected] = useState<number[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const integrations = [
    { name: "GitHub", color: "#fff" },
    { name: "Vercel", color: "#fff" },
    { name: "Analytics", color: "#4285f4" },
  ];

  useEffect(() => {
    if (isInView) {
      integrations.forEach((_, i) => {
        setTimeout(() => setConnected(prev => [...prev, i]), 500 + i * 400);
      });
    }
  }, [isInView]);

  return (
    <div ref={ref} className="max-w-2xl mx-auto text-center">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className="text-sm text-blue-400 mb-4"
      >
        Step 1
      </motion.p>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl font-bold text-white mb-4"
      >
        Connect your stack
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}
        className="text-zinc-500 mb-12"
      >
        One-time setup. Takes 2 minutes.
      </motion.p>

      <div className="flex justify-center gap-4">
        {integrations.map((int, i) => (
          <motion.div
            key={int.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="relative"
          >
            <div className={`w-20 h-20 rounded-2xl bg-zinc-900 border flex items-center justify-center transition-all duration-500 ${
              connected.includes(i) 
                ? "border-emerald-500/50 shadow-lg shadow-emerald-500/20" 
                : "border-zinc-800"
            }`}>
              <span className="text-2xl font-bold text-zinc-400">
                {int.name[0]}
              </span>
            </div>
            {connected.includes(i) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
            <p className="text-xs text-zinc-600 mt-2">{int.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Detect Section - Show auto-detection
function DetectSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showDetection, setShowDetection] = useState(false);

  useEffect(() => {
    if (isInView) {
      setTimeout(() => setShowDetection(true), 800);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="max-w-2xl mx-auto text-center">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className="text-sm text-violet-400 mb-4"
      >
        Step 2
      </motion.p>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl font-bold text-white mb-4"
      >
        Ship as usual
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}
        className="text-zinc-500 mb-12"
      >
        We detect every deploy automatically.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3 }}
        className="relative max-w-md mx-auto"
      >
        {/* Terminal window */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="text-xs text-zinc-600 ml-2">terminal</span>
          </div>
          <div className="p-4 font-mono text-sm text-left">
            <p className="text-zinc-500">$ git push origin main</p>
            <p className="text-zinc-600 mt-1">Pushing to production...</p>
            <p className="text-emerald-400 mt-1">✓ Deployed successfully</p>
          </div>
        </div>

        {/* Detection popup */}
        <motion.div
          initial={{ opacity: 0, x: 20, y: -10 }}
          animate={showDetection ? { opacity: 1, x: 0, y: 0 } : {}}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm text-blue-300">Experiment started</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Analyze Section - Show results
function AnalyzeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isInView) {
      setTimeout(() => setShowResult(true), 800);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="max-w-2xl mx-auto text-center">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className="text-sm text-emerald-400 mb-4"
      >
        Step 3
      </motion.p>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl font-bold text-white mb-4"
      >
        See what works
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}
        className="text-zinc-500 mb-12"
      >
        Automatic before/after comparison.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3 }}
        className="max-w-sm mx-auto"
      >
        {/* Result card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="text-left">
              <p className="text-white font-medium">Checkout redesign</p>
              <p className="text-xs text-zinc-600 mt-0.5">via Vercel · 3 days ago</p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={showResult ? { scale: 1 } : {}}
              className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-medium"
            >
              Success
            </motion.div>
          </div>
          
          <div className="flex items-center justify-between py-3 border-t border-zinc-800/80">
            <span className="text-sm text-zinc-500">Conversion rate</span>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={showResult ? { opacity: 1 } : {}}
              className="flex items-center gap-2"
            >
              <span className="text-zinc-600 text-sm">12%</span>
              <span className="text-zinc-700">→</span>
              <span className="text-emerald-400 text-sm font-medium">18%</span>
              <span className="text-emerald-400 text-xs">(+50%)</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Learn Section - Show insights
function LearnSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const insights = [
    { text: "Checkout flow changes: +18% avg. impact", positive: true },
    { text: "UI-only changes: minimal effect", positive: false },
    { text: "Mobile users respond better to shorter forms", positive: true },
  ];

  return (
    <div ref={ref} className="max-w-2xl mx-auto text-center">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className="text-sm text-amber-400 mb-4"
      >
        Bonus
      </motion.p>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl font-bold text-white mb-4"
      >
        Learn from patterns
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}
        className="text-zinc-500 mb-12"
      >
        AI analyzes your experiments weekly.
      </motion.p>

      <div className="max-w-md mx-auto space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 + i * 0.15 }}
            className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800/80 rounded-lg px-4 py-3 text-left"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${insight.positive ? "bg-emerald-400" : "bg-zinc-600"}`} />
            <span className="text-sm text-zinc-400">{insight.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistCount, setWaitlistCount] = useState(247);

  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/waitlist");
        const data = await res.json();
        if (res.ok && data.count) {
          setWaitlistCount(data.count);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setWaitlistCount(prev => prev + 1);
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/[0.03] blur-[120px] rounded-full" />
      </div>

      {/* Header - shows after scroll */}
      <motion.header 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#08080a]/90 backdrop-blur-md border-b border-white/[0.04]"
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-semibold text-white">Briefix</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm bg-white text-black font-medium px-3 py-1.5 rounded-md hover:bg-zinc-200 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <Link href="/" className="inline-block font-semibold text-white mb-16 text-lg">
            Briefix
          </Link>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
            Experiments track themselves.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              You just ship.
            </span>
          </h1>
          
          <p className="text-lg text-zinc-500 max-w-lg mx-auto mb-10">
            Connect your stack once. Every deploy becomes a tracked experiment with automatic analysis.
          </p>

          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-black font-medium px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Start tracking for free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-zinc-700 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-zinc-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Sections - One by one */}
      <FeatureSection>
        <ConnectSection />
      </FeatureSection>

      <FeatureSection className="bg-zinc-900/20">
        <DetectSection />
      </FeatureSection>

      <FeatureSection>
        <AnalyzeSection />
      </FeatureSection>

      <FeatureSection className="bg-zinc-900/20">
        <LearnSection />
      </FeatureSection>

      {/* Final CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to ship smarter?
            </h2>
            <p className="text-zinc-500 mb-8">
              Join {waitlistCount}+ teams on the waitlist.
            </p>

            {status === "success" ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
                <svg className="w-8 h-8 text-emerald-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-white font-medium">You're on the list!</p>
                <p className="text-sm text-zinc-500 mt-1">We'll reach out soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                  disabled={status === "loading"}
                />
                <button 
                  type="submit" 
                  className="bg-white text-black font-medium text-sm px-5 py-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "..." : "Join"}
                </button>
              </form>
            )}
            {status === "error" && (
              <p className="text-xs text-red-400 mt-3">Something went wrong.</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-600">
          <span>© 2025 Briefix</span>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">
            @yejin
          </a>
        </div>
      </footer>
    </div>
  );
}
