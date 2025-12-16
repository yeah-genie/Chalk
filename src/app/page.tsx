import WaitlistForm from "./components/WaitlistForm";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg-page)]/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Relay
            </a>
            <div className="hidden md:flex items-center gap-6 text-sm text-[var(--text-secondary)]">
              <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Features</a>
              <a href="#how" className="hover:text-[var(--text-primary)] transition-colors">How it works</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block">
              Log in
            </a>
            <a href="#waitlist" className="btn-primary text-sm py-2 px-4">
              Get started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-3xl">
            <div className="animate-fade-in">
              <p className="section-label">Idea Management for Startups</p>
            </div>
            
            <h1 className="text-[clamp(40px,6vw,64px)] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] mb-6 animate-fade-in delay-1">
              Turn scattered ideas into
              <br />
              <span className="text-[var(--text-secondary)]">validated experiments</span>
          </h1>
            
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-xl animate-fade-in delay-2">
              Stop letting ideas die in Notion docs and spreadsheets. Collect, evaluate, and prioritize ideas as a team—then run experiments that actually ship.
            </p>
            
            <div id="waitlist" className="animate-fade-in delay-3">
              <WaitlistForm />
              <p className="mt-3 text-xs text-[var(--text-tertiary)]">
                Free for small teams. No credit card required.
              </p>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 animate-fade-in delay-4">
            <div className="card p-1 overflow-hidden">
              <div className="bg-[var(--bg-surface)] rounded-lg">
                {/* Window header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)] ml-2">Idea Pipeline</span>
                </div>
                
                {/* Kanban preview */}
                <div className="p-6 grid grid-cols-4 gap-4">
                  {[
                    { title: "Inbox", count: 12, items: ["AI-powered search", "Mobile app v2", "API rate limiting"] },
                    { title: "Evaluating", count: 5, items: ["Dashboard redesign", "Slack integration"], color: "var(--yellow)" },
                    { title: "Experiment", count: 3, items: ["Onboarding flow"], color: "var(--accent)" },
                    { title: "Shipped", count: 8, items: ["Dark mode", "Export to CSV"], color: "var(--green)" },
                  ].map((col, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">{col.title}</span>
                        <span 
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ 
                            color: col.color || "var(--text-tertiary)",
                            background: col.color ? `${col.color}15` : "var(--bg-hover)"
                          }}
                        >
                          {col.count}
                        </span>
                      </div>
                      {col.items.map((item, j) => (
                        <div 
                          key={j} 
                          className="bg-[var(--bg-elevated)] rounded-lg p-3 border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors cursor-pointer"
                        >
                          <p className="text-sm text-[var(--text-primary)]">{item}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-4 h-4 rounded-full bg-[var(--accent)]/20" />
                            <span className="text-xs text-[var(--text-tertiary)]">2d ago</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="section-label">The Problem</p>
            <h2 className="section-title mb-4">
              Ideas deserve better than a graveyard
            </h2>
            <p className="section-desc">
              Your team generates dozens of ideas every month. Most of them end up forgotten in random docs, never evaluated, never tested. Sound familiar?
            </p>
          </div>

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
              <div key={i} className="card p-6">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base font-medium text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[var(--bg-elevated)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="section-label">Features</p>
            <h2 className="section-title mb-4">
              Built for how teams actually work
            </h2>
            <p className="section-desc">
              Relay fits into your existing workflow. Capture ideas fast, evaluate them together, and track experiments from start to finish.
            </p>
          </div>

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
              <div key={i} className="card p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                    {feature.icon}
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border)]">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label">How it works</p>
            <h2 className="section-title">
              Three steps to better ideas
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Collect",
                desc: "Drop ideas into the inbox from Slack or web. AI handles the organization.",
              },
              {
                step: "02",
                title: "Evaluate",
                desc: "Team members score ideas weekly. Top ideas rise to the surface automatically.",
              },
              {
                step: "03",
                title: "Experiment",
                desc: "Run small tests on winning ideas. Ship or kill—either way, you learn.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] flex items-center justify-center mx-auto mb-6">
                  <span className="text-sm font-semibold text-[var(--accent)]">{item.step}</span>
                </div>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For who */}
      <section className="py-24 px-6 bg-[var(--bg-elevated)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="section-label">Built for</p>
            <h2 className="section-title">
              Teams that ship fast
            </h2>
          </div>

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
              <div key={i} className="card p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] mx-auto mb-3">
                  {item.icon}
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">{item.title}</h3>
                <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-[var(--text-primary)] mb-4">
            Ready to stop losing ideas?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Join the waitlist and get early access when we launch.
          </p>
          <div className="flex justify-center">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <svg className="w-4 h-4 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-medium">Relay</span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              © 2024 Relay. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-[var(--text-tertiary)]">
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
