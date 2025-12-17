"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Section wrapper with scroll animation
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// Feature section component
function FeatureSection({ 
  label, 
  title, 
  description, 
  children 
}: { 
  label: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Section className="min-h-[70vh] flex items-center py-32 px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-xs text-violet-400 font-medium mb-4 tracking-wide uppercase">
              {label}
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white leading-tight mb-4">
              {title}
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              {description}
            </p>
          </div>
          <div className="lg:pl-8">
            {children}
          </div>
        </div>
      </div>
    </Section>
  );
}

// Validate Demo - Course idea validation
function ValidateDemo() {
  const [phase, setPhase] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 1900),
      setTimeout(() => setPhase(4), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={ref} className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800/80 bg-[#111113]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span className="text-sm text-white font-medium">Course Validator</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <span className="text-zinc-500 text-sm">Topic:</span>
          <span className="text-white">"Python for Data Science"</span>
        </div>
        
        {phase >= 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Demand Score</span>
              <span className="text-emerald-400 font-semibold">82/100</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: "82%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-violet-500 to-emerald-500"
              />
            </div>
          </motion.div>
        )}

        {phase >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <p className="text-xs text-zinc-500 mb-1">Competition</p>
              <p className="text-yellow-400 font-medium">Medium</p>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <p className="text-xs text-zinc-500 mb-1">Est. Revenue</p>
              <p className="text-emerald-400 font-medium">$3-8K/mo</p>
            </div>
          </motion.div>
        )}

        {phase >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400 mb-1">Niche Opportunity</p>
            <p className="text-sm text-zinc-300">"Python for Healthcare Analytics" — only 12 courses exist</p>
          </motion.div>
        )}

        {phase >= 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 pt-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-emerald-400 font-medium">Validated — Worth building</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Optimize Demo - A/B Testing visualization
function OptimizeDemo() {
  const [phase, setPhase] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={ref} className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800/80 bg-[#111113]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-white font-medium">Lesson Experiment</span>
          </div>
          <span className="text-xs text-zinc-500">Running for 7 days</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border transition-all ${phase >= 2 ? 'bg-zinc-900/30 border-zinc-700' : 'bg-zinc-900/50 border-zinc-800'}`}>
            <p className="text-xs text-zinc-500 mb-2">Version A</p>
            <p className="text-sm text-zinc-300 mb-3">Original intro</p>
            {phase >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-2xl font-semibold text-white">42%</p>
                <p className="text-xs text-zinc-500">completion</p>
              </motion.div>
            )}
          </div>
          <div className={`p-4 rounded-lg border transition-all ${phase >= 2 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-900/50 border-zinc-800'}`}>
            <p className="text-xs text-zinc-500 mb-2">Version B</p>
            <p className="text-sm text-zinc-300 mb-3">Story-based intro</p>
            {phase >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-2xl font-semibold text-emerald-400">67%</p>
                <p className="text-xs text-zinc-500">completion</p>
              </motion.div>
            )}
          </div>
        </div>

        {phase >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 py-2">
            <span className="text-emerald-400 font-semibold">+59%</span>
            <span className="text-zinc-400 text-sm">improvement</span>
            <span className="text-xs text-zinc-600 ml-2">• 95% confidence</span>
          </motion.div>
        )}

        {phase >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
            <p className="text-sm text-violet-300">
              <span className="font-medium">Recommendation:</span> Apply Version B to all students
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Analytics Demo - Completion insights
function AnalyticsDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const lessons = [
    { name: "Intro", completion: 95, status: "good" },
    { name: "Setup", completion: 88, status: "good" },
    { name: "Basics", completion: 76, status: "warning" },
    { name: "Advanced", completion: 34, status: "danger" },
    { name: "Project", completion: 28, status: "danger" },
  ];

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="bg-[#0c0c0e] border border-zinc-800 rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-zinc-800/80 bg-[#111113]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-medium">Completion Funnel</span>
            <span className="text-xs text-zinc-500">Last 30 days</span>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {lessons.map((lesson, i) => (
            <motion.div
              key={lesson.name}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-3"
            >
              <span className="text-xs text-zinc-500 w-16">{lesson.name}</span>
              <div className="flex-1 h-6 bg-zinc-800/50 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${lesson.completion}%` } : {}}
                  transition={{ duration: 0.8, delay: 0.1 * i }}
                  className={`h-full ${
                    lesson.status === "good" ? "bg-emerald-500/80" :
                    lesson.status === "warning" ? "bg-yellow-500/80" :
                    "bg-red-500/80"
                  }`}
                />
              </div>
              <span className={`text-sm font-medium w-10 text-right ${
                lesson.status === "good" ? "text-emerald-400" :
                lesson.status === "warning" ? "text-yellow-400" :
                "text-red-400"
              }`}>
                {lesson.completion}%
              </span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="px-5 py-4 bg-red-500/5 border-t border-red-500/10"
        >
          <p className="text-sm text-red-300">
            <span className="font-medium">Issue detected:</span> 55% drop at "Advanced" lesson — consider splitting into 2 parts
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// FAQ Accordion Component
function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      q: "How does course validation work?",
      a: "We analyze search trends, competitor courses, reviews, and community discussions to score your course idea's potential. You'll see demand score, competition level, niche opportunities, and revenue estimates before you spend months creating content."
    },
    {
      q: "Which platforms do you integrate with?",
      a: "We currently support Teachable, Thinkific, and Kajabi. More platforms coming soon including Podia, Gumroad, and custom solutions. No SDK or code changes required — just OAuth connection."
    },
    {
      q: "How does A/B testing work for courses?",
      a: "You upload two versions of a lesson (different intro, different length, different format). We randomly show each version to students and measure completion rate, engagement, and satisfaction. When we reach statistical significance, we tell you the winner."
    },
    {
      q: "Is my course content safe?",
      a: "We never access or store your actual video content. We only analyze behavioral data — when students start, pause, skip, or complete lessons. Your intellectual property stays on your platform."
    },
    {
      q: "How long until I see results?",
      a: "Course validation is instant. For A/B tests, it depends on your traffic — typically 1-2 weeks with 100+ daily students. We'll tell you the minimum sample size needed for reliable results."
    },
  ];

  return (
    <div className="space-y-5">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900/50 transition-colors"
          >
            <span className="text-base font-medium text-white">{faq.q}</span>
            <svg 
              className={`w-5 h-5 text-zinc-500 transition-transform ${openIndex === i ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-zinc-400 leading-relaxed">{faq.a}</p>
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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [waitlistCount, setWaitlistCount] = useState(127);
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-violet-500/[0.07] via-purple-500/[0.03] to-transparent blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-lg border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            CourseOS
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/app" className="text-sm bg-white text-black font-medium px-4 py-1.5 rounded-md hover:bg-zinc-200 transition-colors">
              Try demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className="min-h-screen flex items-center justify-center px-6 pt-14"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 text-xs text-zinc-400 border border-zinc-800 rounded-full px-3 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              For online course creators
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              Stop guessing.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                Start knowing.
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-lg mx-auto">
              Validate ideas before you build. Optimize courses after you launch. Data-driven course creation, from start to finish.
            </p>

            {/* Email form */}
            {status === "success" ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 max-w-md mx-auto"
              >
                <p className="text-emerald-400 font-medium mb-1">You're on the list!</p>
                <p className="text-sm text-zinc-400">We'll let you know when CourseOS is ready.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                  disabled={status === "loading"}
                />
                <button 
                  type="submit" 
                  className="bg-white text-black font-medium px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 whitespace-nowrap"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "..." : "Get early access"}
                </button>
              </form>
            )}
            
            <p className="text-sm text-zinc-600 mt-4">
              Join {waitlistCount}+ course creators. No spam.
            </p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div 
              animate={{ y: [0, 8, 0] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2"
            >
              <div className="w-1 h-2 bg-zinc-600 rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Problem Statement */}
      <Section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl sm:text-3xl text-zinc-300 leading-relaxed">
            <span className="text-white font-medium">80% of online courses fail.</span>
            <br />
            Creators spend months building courses nobody wants.
            <br />
            Then wonder why completion rates are under 10%.
          </p>
          <p className="text-lg text-zinc-500 mt-8">
            You don't have a content problem. You have a data problem.
          </p>
        </div>
      </Section>

      {/* Feature 1: Validate */}
      <FeatureSection
        label="Before you build"
        title="Validate ideas in seconds"
        description="Stop guessing if your course will sell. Get demand scores, competition analysis, niche opportunities, and revenue estimates before you create a single video."
      >
        <ValidateDemo />
      </FeatureSection>

      {/* Feature 2: Optimize */}
      <FeatureSection
        label="After you launch"
        title="A/B test your lessons"
        description="Find out which intro hooks students, which format keeps them engaged, and which length maximizes completion. Real experiments, real data, real improvements."
      >
        <OptimizeDemo />
      </FeatureSection>

      {/* Feature 3: Analyze */}
      <FeatureSection
        label="Always improving"
        title="See where students drop off"
        description="Visualize your completion funnel. Spot problem lessons instantly. Get AI-powered recommendations to fix drop-off points and boost your course ratings."
      >
        <AnalyticsDemo />
      </FeatureSection>

      {/* Social Proof / Stats */}
      <Section className="py-24 px-6 border-y border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-white mb-2">80%</p>
              <p className="text-sm text-zinc-500">of courses fail to profit</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">~10%</p>
              <p className="text-sm text-zinc-500">average completion rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">6 mo</p>
              <p className="text-sm text-zinc-500">average time to create</p>
            </div>
          </div>
          <p className="text-center text-zinc-400 mt-8">
            What if you could validate in minutes, not months?
          </p>
        </div>
      </Section>

      {/* How it works */}
      <Section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-16 text-center">
            How it works
          </h2>
          
          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Enter your course idea",
                desc: "Tell us what you want to teach. We'll analyze demand, competition, and opportunities.",
              },
              {
                step: "02",
                title: "Get your validation report",
                desc: "See if it's worth building. Discover niches, pricing sweet spots, and potential revenue.",
              },
              {
                step: "03",
                title: "Connect your platform",
                desc: "Link Teachable, Thinkific, or Kajabi. We start tracking student behavior automatically.",
              },
              {
                step: "04",
                title: "Run experiments, see results",
                desc: "Test different versions. Get AI recommendations. Watch completion rates climb.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6"
              >
                <div className="text-3xl font-bold text-zinc-800">{item.step}</div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section className="py-32 px-6 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-12 text-center">
            Frequently asked questions
          </h2>
          
          <FAQAccordion />
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="py-32 px-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
            Build courses that succeed
          </h2>
          <p className="text-zinc-400 mb-8">
            Join creators who validate first, optimize always.
          </p>

          {status === "success" ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-white font-medium">You're on the list!</p>
              <p className="text-sm text-zinc-400 mt-1">We'll notify you when we launch.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                disabled={status === "loading"}
              />
              <button 
                type="submit" 
                className="bg-white text-black font-medium px-6 py-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 whitespace-nowrap"
                disabled={status === "loading"}
              >
                {status === "loading" ? "..." : "Get early access"}
              </button>
            </form>
          )}
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-zinc-600">
          <span>© 2025 CourseOS</span>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
