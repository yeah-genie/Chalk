import Link from "next/link";
import Image from "next/image";

// ===================================
// CHALK - PREMIUM LANDING PAGE
// "Unfakeable Portfolio" Brand Strategy
// ===================================

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-[#10b981]/30">
      {/* Aurora Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#10b981]/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#09090b]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center shadow-lg shadow-[#10b981]/20 transition-transform group-hover:scale-110">
              <Image src="/logo.png" alt="Chalk" width={24} height={24} className="invert brightness-0" />
            </div>
            <span className="font-bold text-xl tracking-tight">Chalk</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Features</Link>
            <Link href="#subjects" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Curriculum</Link>
            <Link href="/login" className="text-sm text-[#a1a1aa] hover:text-white transition-colors">Pricing</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#a1a1aa] hover:text-white transition-colors">Sign in</Link>
            <Link
              href="/login"
              className="text-sm px-5 py-2.5 bg-[#10b981] text-black rounded-full font-bold hover:opacity-90 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col items-center pt-32 pb-20 px-6">
        <div className="max-w-4xl text-center z-10">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-10 transition-colors hover:bg-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
            <span className="text-[#a1a1aa] text-xs font-medium tracking-wide uppercase">New: Blank Slate Curriculum Ingestion</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            Turn Lessons into <span className="text-[#10b981] blur-[0.5px]">Proof</span>.
            <br />
            Build your <span className="bg-gradient-to-r from-emerald-400 to-[#10b981] bg-clip-text text-transparent italic">Unfakeable Portfolio</span>.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[#a1a1aa] mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Chalk automatically analyzes your tutoring sessions to build an objective map of student growth.
            Stop recording hours, <span className="text-white font-medium">start proving mastery</span>.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-[#10b981] text-black rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">Start Tracking for Free</span>
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl font-semibold text-lg hover:bg-white/[0.06] transition-all"
            >
              See the Platform
            </Link>
          </div>
        </div>

        {/* Product Preview Section with Shadow/Aura */}
        <div className="relative w-full max-w-5xl mx-auto z-10 px-4 group">
          <div className="absolute inset-0 bg-[#10b981]/20 blur-[100px] rounded-full scale-90 group-hover:scale-100 transition-transform duration-700" />
          <div className="relative rounded-3xl border border-white/[0.1] bg-[#09090b]/50 backdrop-blur-md overflow-hidden shadow-2xl">
            <div className="h-10 border-b border-white/[0.05] bg-white/[0.02] flex items-center px-4 gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.1]" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.1]" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/[0.1]" />
              <div className="ml-auto flex items-center gap-4 text-[10px] text-white/30 font-mono uppercase tracking-widest">
                Mastery Matrix • v4.0
              </div>
            </div>
            <div className="p-2 md:p-4">
              <Image
                src="/product-preview.png"
                alt="Chalk Mastery Board"
                width={1200}
                height={675}
                className="rounded-xl shadow-inner brightness-[0.85] group-hover:brightness-100 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Trust Section removed as per user request */}

      {/* Benefits Section */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Expertise, Automated.</h2>
            <p className="text-[#a1a1aa] text-xl font-light">
              We handle the 80% of reporting paperwork so you can focus on the 20% of human connection that actually drives learning.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Benefit 1 */}
            <div className="group space-y-6">
              <div className="w-14 h-14 bg-[#10b981]/10 rounded-2xl flex items-center justify-center border border-[#10b981]/20 transition-colors group-hover:bg-[#10b981]/20">
                <svg className="w-7 h-7 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold">Zero-Action Capture</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                No notes, no forms. Just record your session. Our AI extracts every concept taught and student reaction with clinical precision.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="group space-y-6">
              <div className="w-14 h-14 bg-[#10b981]/10 rounded-2xl flex items-center justify-center border border-[#10b981]/20 transition-colors group-hover:bg-[#10b981]/20">
                <svg className="w-7 h-7 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold">Objective Analytics</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                Stop guessing comprehension. Build a heat-map of student mastery calibrated against official exam standards (AP, SAT, IB).
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="group space-y-6">
              <div className="w-14 h-14 bg-[#10b981]/10 rounded-2xl flex items-center justify-center border border-[#10b981]/20 transition-colors group-hover:bg-[#10b981]/20">
                <svg className="w-7 h-7 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold">One-Click Trust</h3>
              <p className="text-[#a1a1aa] leading-relaxed">
                Generate shareable growth reports in seconds. Give parents the "Aha!" moment they need to keep renewing your sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Board Section */}
      <section id="subjects" className="py-24 px-6 bg-white/[0.015] border-y border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Ready for every challenge.</h2>
            <p className="text-[#a1a1aa] max-w-xl mx-auto">Chalk grows with you. Use our pre-built graphs or let AI build your custom roadmap as you teach.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['AP Calculus', 'AP Physics', 'SAT Math', 'Custom Slate'].map((item) => (
              <div key={item} className="p-6 rounded-3xl bg-[#18181b] border border-white/[0.05] hover:border-[#10b981]/50 transition-all cursor-default group">
                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center mb-4 text-[#10b981] group-hover:scale-110 transition-transform font-bold">
                  {item === 'Custom Slate' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  ) : '✓'}
                </div>
                <h4 className="font-semibold text-lg mb-1">{item}</h4>
                <p className="text-xs text-[#71717a]">Infrastructure Ready</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#10b981]/5 blur-[120px] rounded-full scale-50" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">Stop saying you're great.<br /><span className="text-[#10b981]">Show them why.</span></h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-5 bg-[#10b981] text-black rounded-2xl font-bold text-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
          >
            Build My Portfolio Now
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#10b981] flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-sm" />
            </div>
            <span className="font-bold">Chalk</span>
          </div>
          <div className="flex gap-10 text-sm text-[#71717a]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <p className="text-sm text-[#71717a]">
            © 2024 Chalk. The Proof Generation Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
