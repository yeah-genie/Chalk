"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Types
interface PlaygroundIdea {
  id: string;
  title: string;
  scores: { impact: number; effort: number; confidence: number };
  totalScore: number;
  status: "active" | "killed";
  killReason?: string;
}

interface MockIdea {
  id: number;
  title: string;
  score: number;
  status: "inbox" | "evaluating" | "top" | "killed";
}

const killReasons = [
  "Too competitive",
  "Not enough resources", 
  "Lost conviction",
  "Market timing off",
  "Better alternatives"
];

const calculateScore = (scores: PlaygroundIdea["scores"]) => {
  const { impact, effort, confidence } = scores;
  return Math.round((impact * confidence) / Math.max(effort, 1) * 10);
};

// Animated App Mockup Component
function AppMockup() {
  const [activeTab, setActiveTab] = useState<"inbox" | "top" | "killed">("inbox");
  const [ideas, setIdeas] = useState<MockIdea[]>([
    { id: 1, title: "AI-powered analytics dashboard", score: 87, status: "top" },
    { id: 2, title: "Mobile app for team sync", score: 72, status: "top" },
    { id: 3, title: "Browser extension for bookmarks", score: 45, status: "inbox" },
    { id: 4, title: "Newsletter automation tool", score: 0, status: "evaluating" },
    { id: 5, title: "Social media scheduler", score: 23, status: "killed" },
  ]);
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Auto-cycle through tabs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(prev => {
        if (prev === "inbox") return "top";
        if (prev === "top") return "killed";
        return "inbox";
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Typing animation for new idea
  useEffect(() => {
    const phrases = ["Customer feedback portal", "API marketplace", "Team retrospective tool"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    const type = () => {
      const currentPhrase = phrases[phraseIndex];
      
      if (!isDeleting) {
        setTypingText(currentPhrase.slice(0, charIndex + 1));
        charIndex++;
        
        if (charIndex === currentPhrase.length) {
          isDeleting = true;
          setTimeout(type, 2000);
          return;
        }
      } else {
        setTypingText(currentPhrase.slice(0, charIndex - 1));
        charIndex--;
        
        if (charIndex === 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      
      setTimeout(type, isDeleting ? 30 : 80);
    };
    
    const timeout = setTimeout(type, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const filteredIdeas = ideas.filter(idea => {
    if (activeTab === "inbox") return idea.status === "inbox" || idea.status === "evaluating";
    if (activeTab === "top") return idea.status === "top";
    return idea.status === "killed";
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full max-w-3xl mx-auto"
    >
      {/* Glow effect */}
      <div className="absolute -inset-px bg-gradient-to-b from-zinc-700/50 to-transparent rounded-xl blur-sm" />
      
      {/* App window */}
      <div className="relative bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-[#111113]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <span className="text-xs text-zinc-500 ml-2">Briefix</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] text-white font-medium">
              Y
            </div>
          </div>
        </div>

        <div className="flex min-h-[340px]">
          {/* Sidebar */}
          <div className="w-48 border-r border-zinc-800/80 bg-[#0a0a0c] p-3 hidden sm:block">
            <div className="space-y-1">
              {[
                { id: "inbox", label: "Inbox", count: 2 },
                { id: "top", label: "Top Ideas", count: 2 },
                { id: "killed", label: "Killed", count: 1 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id 
                      ? "bg-zinc-800/80 text-white" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-xs ${activeTab === tab.id ? "text-zinc-400" : "text-zinc-600"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800/80">
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3 px-3">
                Quick Stats
              </div>
              <div className="space-y-3 px-3">
                <div>
                  <div className="text-lg font-semibold text-white">24</div>
                  <div className="text-[10px] text-zinc-600">Ideas evaluated</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-emerald-400">8</div>
                  <div className="text-[10px] text-zinc-600">Shipped this month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4">
            {/* Add new idea input */}
            <div className="relative mb-4">
              <input
                type="text"
                value={typingText}
                readOnly
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                placeholder="Add new idea..."
              />
              <motion.span 
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-400"
              />
            </div>

            {/* Ideas list */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      idea.status === "killed" 
                        ? "border-red-500/20 bg-red-500/5" 
                        : idea.status === "evaluating"
                          ? "border-blue-500/30 bg-blue-500/5"
                          : "border-zinc-800 bg-zinc-900/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {idea.status === "evaluating" ? (
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-500"
                          />
                        ) : (
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-medium ${
                            idea.status === "killed" 
                              ? "bg-red-500/20 text-red-400" 
                              : idea.status === "top"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-zinc-800 text-zinc-500"
                          }`}>
                            {idea.status === "killed" ? "×" : idea.score}
                          </div>
                        )}
                        <span className={`text-sm ${
                          idea.status === "killed" ? "text-zinc-600 line-through" : "text-white"
                        }`}>
                          {idea.title}
                        </span>
                      </div>
                      {idea.status === "top" && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Top pick
                        </span>
                      )}
                      {idea.status === "evaluating" && (
                        <span className="text-[10px] text-blue-400">
                          Scoring...
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [step, setStep] = useState<"idle" | "input" | "evaluate" | "result">("idle");
  const [ideas, setIdeas] = useState<PlaygroundIdea[]>([]);
  const [inputs, setInputs] = useState(["", "", ""]);
  const [evalIndex, setEvalIndex] = useState(0);
  const [killingIdea, setKillingIdea] = useState<PlaygroundIdea | null>(null);
  const [showKillModal, setShowKillModal] = useState(false);
  const [isKilling, setIsKilling] = useState(false);
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  const playgroundRef = useRef<HTMLDivElement>(null);

  const scrollToPlayground = () => {
    playgroundRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => setStep("input"), 400);
  };

  const submitIdeas = () => {
    const valid = inputs.filter(v => v.trim()).map((title, i) => ({
      id: `idea-${i}`,
      title: title.trim(),
      scores: { impact: 5, effort: 5, confidence: 5 },
      totalScore: 50,
      status: "active" as const,
    }));
    if (valid.length === 0) return;
    setIdeas(valid);
    setStep("evaluate");
  };

  const updateScore = (field: keyof PlaygroundIdea["scores"], value: number) => {
    setIdeas(prev => prev.map((idea, i) => {
      if (i !== evalIndex) return idea;
      const newScores = { ...idea.scores, [field]: value };
      return { ...idea, scores: newScores, totalScore: calculateScore(newScores) };
    }));
  };

  const nextEval = () => {
    if (evalIndex < ideas.length - 1) {
      setEvalIndex(prev => prev + 1);
    } else {
      setIdeas(prev => [...prev].sort((a, b) => b.totalScore - a.totalScore));
      setStep("result");
    }
  };

  const handleKill = (reason: string) => {
    if (!killingIdea) return;
    setIsKilling(true);
    setTimeout(() => {
      setIdeas(prev => prev.map(idea => 
        idea.id === killingIdea.id ? { ...idea, status: "killed", killReason: reason } : idea
      ));
      setShowKillModal(false);
      setKillingIdea(null);
      setIsKilling(false);
    }, 400);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    
    setEmailStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setEmailStatus(res.ok ? "success" : "error");
    } catch {
      setEmailStatus("error");
    }
  };

  const reset = () => {
    setStep("idle");
    setIdeas([]);
    setInputs(["", "", ""]);
    setEvalIndex(0);
    setEmail("");
    setEmailStatus("idle");
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-b from-blue-500/[0.07] to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-violet-500/[0.03] blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-white tracking-tight">
            Briefix
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-md hover:bg-zinc-200 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 text-xs text-zinc-400 border border-zinc-800 rounded-full px-3 py-1.5 bg-zinc-900/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Now in private beta
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center max-w-3xl mx-auto mb-8"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Turn 50 scattered ideas
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">
                into 1 shipped product
              </span>
            </h1>
            
            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto">
              Stop losing ideas in Notion docs. Collect, evaluate, and prioritize with a scoring system that actually works.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
          >
            <button
              onClick={scrollToPlayground}
              className="group inline-flex items-center gap-2 bg-white text-black font-medium text-sm px-6 py-3 rounded-lg hover:bg-zinc-200 transition-all shadow-lg shadow-white/10"
            >
              Try it free
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <Link 
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-medium text-sm px-6 py-3 transition-colors"
            >
              See how it works
            </Link>
          </motion.div>

          {/* App Mockup */}
          <AppMockup />

          {/* Social proof alternative */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-xs text-zinc-600 uppercase tracking-wider mb-4">
              Built for teams who ship fast
            </p>
            <div className="flex items-center justify-center gap-8 text-zinc-500">
              <span className="text-sm">Startup founders</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="text-sm">Product teams</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span className="text-sm">Solo makers</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              From chaos to clarity in 3 steps
            </h2>
            <p className="text-zinc-400 max-w-lg mx-auto">
              Most ideas die in messy docs. Briefix gives them a fighting chance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Capture everything",
                desc: "Dump all your ideas in one place. Browser extension, Slack, or just type it in.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                )
              },
              {
                step: "02", 
                title: "Score ruthlessly",
                desc: "Rate each idea on Impact, Effort, and Confidence. The math does the rest.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                step: "03",
                title: "Ship or kill",
                desc: "Top ideas rise. Bad ones get killed with a reason. No more zombie ideas.",
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-[80px] font-bold text-zinc-900 absolute -top-4 -left-2 select-none">
                  {item.step}
                </div>
                <div className="relative pt-8">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Playground */}
      <section ref={playgroundRef} className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Try it yourself
            </h2>
            <p className="text-zinc-400">
              No signup required. Add your ideas and see how it works.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#111113] border border-zinc-800/50 rounded-xl overflow-hidden"
          >
            {/* Progress bar */}
            <div className="h-1 bg-zinc-800">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                initial={{ width: "0%" }}
                animate={{ 
                  width: step === "idle" ? "0%" : step === "input" ? "33%" : step === "evaluate" ? "66%" : "100%" 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Steps */}
            <div className="flex border-b border-zinc-800/50">
              {["Add", "Rate", "Decide"].map((label, i) => {
                const stepIndex = step === "idle" ? -1 : step === "input" ? 0 : step === "evaluate" ? 1 : 2;
                const isActive = i === stepIndex;
                const isPast = i < stepIndex;
                
                return (
                  <div 
                    key={label}
                    className={`flex-1 py-3 text-center text-xs font-medium transition-colors ${
                      isActive ? "text-white" : isPast ? "text-blue-400" : "text-zinc-600"
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {/* IDLE */}
                {step === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center mx-auto mb-5">
                      <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-zinc-400 text-sm mb-5">
                      Add your ideas and see which ones to pursue
                    </p>
                    <button onClick={() => setStep("input")} className="text-sm bg-white text-black font-medium px-5 py-2 rounded-md hover:bg-zinc-200 transition-colors">
                      Start
                    </button>
                  </motion.div>
                )}

                {/* INPUT */}
                {step === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <p className="text-zinc-400 text-sm mb-5">
                      What ideas have you been thinking about?
                    </p>
                    <div className="space-y-3">
                      {inputs.map((val, i) => (
                        <input
                          key={i}
                          type="text"
                          value={val}
                          onChange={(e) => {
                            const newInputs = [...inputs];
                            newInputs[i] = e.target.value;
                            setInputs(newInputs);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && inputs.some(v => v.trim())) {
                              submitIdeas();
                            }
                          }}
                          placeholder={
                            i === 0 ? "Launch a newsletter" 
                            : i === 1 ? "Build an AI tool" 
                            : "Start a podcast"
                          }
                          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                        />
                      ))}
                    </div>
                    <button
                      onClick={submitIdeas}
                      disabled={!inputs.some(v => v.trim())}
                      className="w-full mt-5 text-sm bg-white text-black font-medium py-2.5 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}

                {/* EVALUATE */}
                {step === "evaluate" && ideas[evalIndex] && (
                  <motion.div
                    key={`eval-${evalIndex}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <div className="mb-6">
                      <p className="text-xs text-zinc-600 mb-1">
                        {evalIndex + 1} / {ideas.length}
                      </p>
                      <h3 className="text-lg font-medium text-white">
                        {ideas[evalIndex].title}
                      </h3>
                    </div>

                    <div className="space-y-5">
                      {[
                        { key: "impact", label: "Impact" },
                        { key: "effort", label: "Effort" },
                        { key: "confidence", label: "Confidence" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-zinc-400">{label}</span>
                            <span className="text-sm font-medium text-white tabular-nums">
                              {ideas[evalIndex].scores[key as keyof typeof ideas[0]["scores"]]}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={ideas[evalIndex].scores[key as keyof typeof ideas[0]["scores"]]}
                            onChange={(e) => updateScore(key as keyof PlaygroundIdea["scores"], parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-zinc-900/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
                        {ideas[evalIndex].totalScore}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">ICE Score</div>
                    </div>

                    <button onClick={nextEval} className="w-full mt-5 text-sm bg-white text-black font-medium py-2.5 rounded-md hover:bg-zinc-200 transition-colors">
                      {evalIndex < ideas.length - 1 ? "Next" : "See results"}
                    </button>
                  </motion.div>
                )}

                {/* RESULT */}
                {step === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <h3 className="text-sm font-medium text-zinc-400 mb-4">
                      Priority Stack
                    </h3>

                    <div className="space-y-2">
                      {ideas.map((idea, i) => {
                        const isKilled = idea.status === "killed";
                        const isWinner = i === 0 && !isKilled;
                        const activeIdeas = ideas.filter(x => x.status === "active");
                        const isLowest = !isKilled && activeIdeas.length > 1 && idea.id === activeIdeas[activeIdeas.length - 1]?.id;
                        
                        return (
                          <motion.div
                            key={idea.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: isKilled ? 0.4 : 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-3 rounded-lg border transition-colors ${
                              isKilled 
                                ? "border-red-500/20 bg-red-500/5" 
                                : isWinner 
                                  ? "border-emerald-500/30 bg-emerald-500/5" 
                                  : "border-zinc-800 bg-zinc-900/30"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium shrink-0 ${
                                  isKilled 
                                    ? "bg-red-500/20 text-red-400" 
                                    : isWinner 
                                      ? "bg-emerald-500/20 text-emerald-400" 
                                      : "bg-zinc-800 text-zinc-500"
                                }`}>
                                  {isKilled ? "×" : i + 1}
                                </div>
                                <div className="min-w-0">
                                  <div className={`text-sm truncate ${isKilled ? "line-through text-zinc-600" : "text-white"}`}>
                                    {idea.title}
                                  </div>
                                  <div className="text-xs text-zinc-600">
                                    {isKilled ? idea.killReason : `Score ${idea.totalScore}`}
                                  </div>
                                </div>
                              </div>
                              {isLowest && (
                                <button
                                  onClick={() => { setKillingIdea(idea); setShowKillModal(true); }}
                                  className="text-xs text-red-400 hover:text-red-300 shrink-0"
                                >
                                  Kill
                                </button>
                              )}
                              {isWinner && (
                                <span className="text-xs text-emerald-400 shrink-0">Ship it</span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* CTA */}
                    <div className="mt-8 pt-6 border-t border-zinc-800/50">
                      {emailStatus === "success" ? (
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm text-white">You're on the list</p>
                          <p className="text-xs text-zinc-500 mt-1">We'll be in touch</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-zinc-400 text-center mb-4">
                            Save your stack and get early access
                          </p>
                          <form onSubmit={handleEmailSubmit} className="flex gap-2">
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@company.com"
                              className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                              disabled={emailStatus === "loading"}
                            />
                            <button 
                              type="submit" 
                              className="text-sm bg-white text-black font-medium px-4 py-2 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50"
                              disabled={emailStatus === "loading"}
                            >
                              {emailStatus === "loading" ? "..." : "Join"}
                            </button>
                          </form>
                          {emailStatus === "error" && (
                            <p className="text-xs text-red-400 mt-2 text-center">Something went wrong</p>
                          )}
                        </>
                      )}
                    </div>

                    <button 
                      onClick={reset}
                      className="w-full mt-4 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      Try again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to ship your best ideas?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join the waitlist and be the first to know when we launch.
            </p>
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-black font-medium text-sm px-6 py-3 rounded-lg hover:bg-zinc-200 transition-all"
            >
              Get early access
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-zinc-600">
          <span>© 2025 Briefix</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-zinc-400 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

      {/* Kill Modal */}
      <AnimatePresence>
        {showKillModal && killingIdea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isKilling && setShowKillModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: isKilling ? 0.9 : 1, opacity: isKilling ? 0 : 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111113] border border-zinc-800 rounded-xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-medium text-white mb-1">Kill this idea?</h3>
              <p className="text-xs text-zinc-500 mb-5">{killingIdea.title}</p>
              
              <div className="space-y-2">
                {killReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => handleKill(reason)}
                    className="w-full p-2.5 text-left text-sm text-zinc-400 rounded-md border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-400 transition-colors"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowKillModal(false)}
                className="w-full mt-4 text-xs text-zinc-600 hover:text-zinc-400"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
