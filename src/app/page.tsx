"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import WaitlistForm from "./components/WaitlistForm";

// Types
interface IdeaCard {
  id: string;
  title: string;
  time: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  items: IdeaCard[];
}

// Typing animation words
const typingWords = ["validated experiments", "shipped products", "team alignment", "real insights"];

// Initial kanban data
const initialColumns: KanbanColumn[] = [
  { 
    id: "inbox", 
    title: "Inbox", 
    items: [
      { id: "1", title: "AI-powered search", time: "2d ago" },
      { id: "2", title: "Mobile app v2", time: "2d ago" },
      { id: "3", title: "API rate limiting", time: "3d ago" },
    ] 
  },
  { 
    id: "evaluating", 
    title: "Evaluating", 
    color: "var(--yellow)",
    items: [
      { id: "4", title: "Dashboard redesign", time: "1d ago" },
      { id: "5", title: "Slack integration", time: "2d ago" },
    ] 
  },
  { 
    id: "experiment", 
    title: "Experiment", 
    color: "var(--accent)",
    items: [
      { id: "6", title: "Onboarding flow", time: "1d ago" },
    ] 
  },
  { 
    id: "shipped", 
    title: "Shipped", 
    color: "var(--green)",
    items: [
      { id: "7", title: "Dark mode", time: "5d ago" },
      { id: "8", title: "Export to CSV", time: "1w ago" },
    ] 
  },
];

// Sortable Item Component
function SortableItem({ item }: { item: IdeaCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border)] hover:border-[var(--border-hover)] transition-all cursor-grab active:cursor-grabbing"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <p className="text-sm text-[var(--text-primary)]">{item.title}</p>
      <div className="flex items-center gap-2 mt-2">
        <div className="w-4 h-4 rounded-full bg-[var(--accent)]/20" />
        <span className="text-xs text-[var(--text-tertiary)]">{item.time}</span>
      </div>
    </motion.div>
  );
}

// Droppable Column Component
function DroppableColumn({ column }: { column: KanbanColumn }) {
  const { setNodeRef } = useSortable({ id: column.id });

  return (
    <div ref={setNodeRef} className="space-y-3 min-h-[150px]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{column.title}</span>
        <span 
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ 
            color: column.color || "var(--text-tertiary)",
            background: column.color ? `${column.color}15` : "var(--bg-hover)"
          }}
        >
          {column.items.length}
        </span>
      </div>
      <SortableContext items={column.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {column.items.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

// 3D Tilt Card Component
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXVal = (y - centerY) / 10;
    const rotateYVal = (centerX - x) / 10;
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
      }}
      className={`transition-transform duration-100 ease-out ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Interactive Slider Component
function InteractiveSlider({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="text-[var(--text-primary)] font-medium">{value}/10</span>
      </div>
      <div className="relative h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
        <motion.div 
          className="absolute h-full rounded-full"
          style={{ background: color, width: `${value * 10}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 10}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full opacity-0 absolute cursor-pointer"
        style={{ height: "20px", top: "-4px" }}
      />
    </div>
  );
}

// Scroll Animation Wrapper
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Counter Component
function AnimatedCounter({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const end = target;
    const incrementTime = (duration * 1000) / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function Home() {
  // Mouse follower state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  // Typing animation state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Kanban state
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Evaluation slider state
  const [scores, setScores] = useState({ market: 7, effort: 5, team: 8 });

  // How it works state
  const [activeStep, setActiveStep] = useState(0);

  // Scroll progress
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.9]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mouse follower effect
  useEffect(() => {
    if (!isClient) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isClient]);

  // Typing animation effect
  useEffect(() => {
    const currentWord = typingWords[currentWordIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % typingWords.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentWordIndex]);

  // Auto-rotate How it works
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const activeColumn = columns.find(col => col.items.some(item => item.id === active.id));
    const overColumn = columns.find(col => col.id === over.id || col.items.some(item => item.id === over.id));
    
    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    const activeItem = activeColumn.items.find(item => item.id === active.id);
    if (!activeItem) return;

    setColumns(prev => prev.map(col => {
      if (col.id === activeColumn.id) {
        return { ...col, items: col.items.filter(item => item.id !== active.id) };
      }
      if (col.id === overColumn.id) {
        return { ...col, items: [...col.items, activeItem] };
      }
      return col;
    }));
  };

  const activeItem = activeId ? columns.flatMap(c => c.items).find(i => i.id === activeId) : null;

  const howItWorksSteps = [
    {
      step: "01",
      title: "Collect",
      desc: "Drop ideas into the inbox from Slack, email, or web. AI automatically tags and summarizes each idea.",
      visual: (
        <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">New idea captured</span>
          </div>
          <div className="space-y-2">
            {["AI-powered search feature", "Mobile app redesign"].map((idea, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border)]"
              >
                <p className="text-sm text-[var(--text-primary)]">{idea}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      step: "02",
      title: "Evaluate",
      desc: "Team members score ideas on market fit, effort, and team alignment. Top ideas rise to the surface automatically.",
      visual: (
        <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border)] space-y-4">
          <div className="text-sm text-[var(--text-secondary)] mb-2">Rate this idea:</div>
          {[
            { label: "Market Fit", value: 8, color: "var(--green)" },
            { label: "Effort", value: 4, color: "var(--yellow)" },
            { label: "Team Fit", value: 9, color: "var(--accent)" },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-tertiary)]">{item.label}</span>
                <span className="text-[var(--text-primary)]">{item.value}/10</span>
              </div>
              <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value * 10}%` }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      step: "03",
      title: "Experiment",
      desc: "Run small tests on winning ideas. Ship or kill—either way, you learn and document the outcome.",
      visual: (
        <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[var(--text-secondary)]">Experiment Progress</span>
            <span className="text-xs px-2 py-0.5 bg-[var(--green)]/10 text-[var(--green)] rounded-full">Active</span>
          </div>
          <div className="space-y-3">
            {["Research", "Build MVP", "Ship & Measure"].map((phase, i) => (
              <div key={i} className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.3 }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    i < 2 ? "bg-[var(--green)] text-white" : "bg-[var(--bg-hover)] text-[var(--text-tertiary)]"
                  }`}
                >
                  {i < 2 ? "✓" : i + 1}
                </motion.div>
                <span className={`text-sm ${i < 2 ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
                  {phase}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Mouse Follower */}
      {isClient && (
        <motion.div
          className="mouse-follower hidden lg:block"
          animate={{ x: mousePosition.x, y: mousePosition.y }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />
      )}

      {/* Navigation */}
      <motion.nav 
        style={{ opacity: headerOpacity }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] glass"
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
              <motion.svg 
                className="w-6 h-6 text-[var(--accent)]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </motion.svg>
              Briefix
            </a>
            <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
              <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
              <a href="#how" className="hover:text-[var(--text-primary)] transition-colors">How it works</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block">
              Log in
            </a>
            <motion.a 
              href="#waitlist" 
              className="btn-primary text-sm py-2.5 px-5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get started
            </motion.a>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="section-label">Idea Management for Startups</p>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[clamp(40px,6vw,64px)] font-bold leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] mb-6"
            >
              Turn scattered ideas into
              <br />
              <span className="gradient-text">
                {displayText}
                <span className="typing-cursor" />
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xl"
            >
              Stop letting ideas die in Notion docs and spreadsheets. Collect, evaluate, and prioritize ideas as a team—then run experiments that actually ship.
            </motion.p>
            
            <motion.div 
              id="waitlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <WaitlistForm showCounter={true} />
              <p className="mt-4 text-xs text-[var(--text-tertiary)]">
                Free for small teams. No credit card required.
              </p>
            </motion.div>
          </div>

          {/* Hero Visual - Interactive Kanban */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20"
          >
            <div className="card p-1 overflow-hidden">
              <div className="bg-[var(--bg-surface)] rounded-xl">
                {/* Window header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)] ml-2">Idea Pipeline</span>
                  </div>
                  <span className="text-xs text-[var(--accent)]">Try dragging cards →</span>
                </div>
                
                {/* Kanban board */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="p-6 grid grid-cols-4 gap-4">
                    {columns.map((column) => (
                      <DroppableColumn key={column.id} column={column} />
                    ))}
                  </div>
                  <DragOverlay>
                    {activeItem ? (
                      <div className="bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--accent)] shadow-lg">
                        <p className="text-sm text-[var(--text-primary)]">{activeItem.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-4 h-4 rounded-full bg-[var(--accent)]/20" />
                          <span className="text-xs text-[var(--text-tertiary)]">{activeItem.time}</span>
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 12000, suffix: "+", label: "Ideas tracked" },
              { value: 500, suffix: "+", label: "Teams using Briefix" },
              { value: 87, suffix: "%", label: "Ideas shipped faster" },
              { value: 4.9, suffix: "/5", label: "User rating" },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                    <AnimatedCounter target={stat.value} />
                    {stat.suffix}
                  </div>
                  <div className="text-sm text-[var(--text-tertiary)] mt-1">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="max-w-2xl mb-16">
              <p className="section-label">The Problem</p>
              <h2 className="section-title mb-4">
                Ideas deserve better than a graveyard
              </h2>
              <p className="section-desc">
                Your team generates dozens of ideas every month. Most of them end up forgotten in random docs, never evaluated, never tested. Sound familiar?
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                ),
                title: "Scattered everywhere",
                desc: "Notion, Slack, spreadsheets, sticky notes... ideas live in too many places to track.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "No review process",
                desc: "Without a structured evaluation, good ideas get buried under urgent tasks.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Gut-based decisions",
                desc: "Who decides what to build next? Usually whoever speaks loudest in the meeting.",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <TiltCard className="h-full">
                  <div className="card p-6 h-full">
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {item.icon}
                    </motion.div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Evaluation Demo */}
      <section className="py-24 px-6 bg-[var(--bg-elevated)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <p className="section-label">Try it yourself</p>
                <h2 className="section-title mb-4">
                  Data-driven decisions
                </h2>
                <p className="section-desc mb-8">
                  Rate ideas on multiple dimensions. See how scores affect priority rankings in real-time.
                </p>
                
                {/* Interactive Sliders */}
                <div className="space-y-6">
                  <div className="relative">
                    <InteractiveSlider
                      label="Market Fit"
                      value={scores.market}
                      onChange={(v) => setScores({ ...scores, market: v })}
                      color="var(--green)"
                    />
                  </div>
                  <div className="relative">
                    <InteractiveSlider
                      label="Effort"
                      value={scores.effort}
                      onChange={(v) => setScores({ ...scores, effort: v })}
                      color="var(--yellow)"
                    />
                  </div>
                  <div className="relative">
                    <InteractiveSlider
                      label="Team Fit"
                      value={scores.team}
                      onChange={(v) => setScores({ ...scores, team: v })}
                      color="var(--accent)"
                    />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="card p-6">
                <div className="text-sm text-[var(--text-secondary)] mb-4">Priority Score</div>
                <motion.div 
                  className="text-6xl font-bold gradient-text mb-4"
                  key={`${scores.market}-${scores.effort}-${scores.team}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                >
                  {Math.round(((scores.market * 3 + (10 - scores.effort) * 2 + scores.team * 2) / 7) * 10)}
                </motion.div>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Based on weighted average of Market Fit (3x), Effort (2x inverse), and Team Fit (2x)
                </p>
                
                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <div className="text-sm text-[var(--text-secondary)] mb-3">Recommendation</div>
                  <motion.div
                    key={scores.market + scores.team}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                      (scores.market + scores.team) / 2 > 7
                        ? "bg-[var(--green)]/10 text-[var(--green)]"
                        : (scores.market + scores.team) / 2 > 5
                        ? "bg-[var(--yellow)]/10 text-[var(--yellow)]"
                        : "bg-[var(--red)]/10 text-[var(--red)]"
                    }`}
                  >
                    {(scores.market + scores.team) / 2 > 7
                      ? "🚀 Ship it!"
                      : (scores.market + scores.team) / 2 > 5
                      ? "🧪 Experiment first"
                      : "❄️ Keep in backlog"}
                  </motion.div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="max-w-2xl mb-16">
              <p className="section-label">Features</p>
              <h2 className="section-title mb-4">
                Built for how teams actually work
              </h2>
              <p className="section-desc">
                Briefix fits into your existing workflow. Capture ideas fast, evaluate them together, and track experiments from start to finish.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                ),
                title: "Idea Inbox",
                desc: "Capture ideas from anywhere—Slack, email, or web. AI suggests tags and summaries automatically.",
                tag: "30 sec capture",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Team Scoring",
                desc: "Rate ideas on Market, Effort, Team Fit, and more. Anonymous voting removes bias.",
                tag: "Data-driven",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                ),
                title: "Experiment Pipeline",
                desc: "Move ideas through Research → Build → Ship stages. Connect to Linear, Notion, or Jira.",
                tag: "End-to-end",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Kill Log",
                desc: "Document why ideas were killed. Learn from the past—revisit when timing changes.",
                tag: "Never forget",
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <TiltCard>
                  <motion.div 
                    className="card p-6 group h-full"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border)]">
                        {feature.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
                  </motion.div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - Interactive */}
      <section id="how" className="py-24 px-6 bg-[var(--bg-elevated)]">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="section-label">How it works</p>
              <h2 className="section-title">
                Three steps to better ideas
              </h2>
            </div>
          </ScrollReveal>

          {/* Step indicators */}
          <div className="flex justify-center gap-4 mb-12">
            {howItWorksSteps.map((item, i) => (
              <motion.button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`step-indicator ${activeStep === i ? "active" : "inactive"}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.step}
              </motion.button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto mb-12">
            <div className="progress-bar">
              <motion.div 
                className="progress-bar-fill"
                initial={{ width: "33%" }}
                animate={{ width: `${((activeStep + 1) / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  {howItWorksSteps[activeStep].title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {howItWorksSteps[activeStep].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {howItWorksSteps[activeStep].visual}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="section-label">Built for</p>
              <h2 className="section-title">
                Teams that ship fast
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Early-stage startups",
                desc: "5-20 person teams with more ideas than time"
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: "Innovation teams",
                desc: "Corporate squads exploring new opportunities"
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: "Product squads",
                desc: "Feature teams managing experiment backlogs"
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: "Indie hackers",
                desc: "Solo builders validating multiple ideas"
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <TiltCard>
                  <motion.div 
                    className="card p-5 text-center h-full"
                    whileHover={{ y: -5 }}
                  >
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      {item.icon}
                    </motion.div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{item.desc}</p>
                  </motion.div>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-[var(--border)] relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4"
              whileInView={{ scale: [0.9, 1] }}
              transition={{ duration: 0.5 }}
            >
              Ready to stop losing ideas?
            </motion.h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8">
              Join the waitlist and get early access when we launch.
            </p>
            <div className="flex justify-center">
              <WaitlistForm showCounter={true} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold">Briefix</span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              © 2025 Briefix. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
              <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
              <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
