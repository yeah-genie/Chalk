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
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/[0.03] blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
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
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-14">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 text-xs text-zinc-500 border border-zinc-800 rounded-full px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Private beta
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-5">
            Ideas deserve better
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              than your notes app
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg mx-auto">
            Evaluate, prioritize, and ship your ideas—or kill them with conviction. 
            No more endless brainstorm docs.
          </p>

          <button
            onClick={scrollToPlayground}
            className="group inline-flex items-center gap-2 bg-white text-black font-medium text-sm px-6 py-3 rounded-md hover:bg-zinc-200 transition-all"
          >
            Try it now
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <p className="mt-4 text-xs text-zinc-600">
            No account needed
          </p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8"
        >
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-zinc-700 flex items-start justify-center p-1.5"
          >
            <div className="w-0.5 h-1.5 rounded-full bg-zinc-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* Playground */}
      <section ref={playgroundRef} className="py-32 px-6">
        <div className="max-w-xl mx-auto">
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
                      <div className="text-xs text-zinc-500 mt-1">Score</div>
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

      {/* Built for */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-zinc-600 text-center mb-8 uppercase tracking-wider">
            Built for
          </p>
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { title: "Founders", desc: "Turn 100 ideas into 1 experiment" },
              { title: "Product teams", desc: "Prioritize with data, not opinions" },
              { title: "Solo makers", desc: "Stop overthinking, start shipping" }
            ].map((item) => (
              <div key={item.title}>
                <h3 className="text-sm font-medium text-white mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-zinc-600">
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
