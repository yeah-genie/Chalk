
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  ShieldCheck, 
  BarChart2, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle2,
  Lock,
  Search
} from 'lucide-react';
import { Button } from '../components/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-950 selection:bg-indigo-100 dark:selection:bg-indigo-900">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-600 fill-indigo-600" size={24} />
            <span className="text-xl font-bold tracking-tight dark:text-white">Chalk</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Zero-Action Portfolio Generation
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Your lessons already create data. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              We turn it into your portfolio.
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop manually updating resumes and chasing parents for testimonials. Chalk syncs with Zoom and Gmail to build your professional brand automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="group">
                Start Free 
                <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">Watch Demo</Button>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            <img 
              src="https://picsum.photos/seed/dashboard-preview/1200/600" 
              alt="Dashboard Preview" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold dark:text-white">Why Tutors Choose Chalk</h2>
            <p className="text-slate-600 dark:text-slate-400">Independent tutoring is hard. We make the business side invisible.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Proof of Quality", 
                desc: "Parents don't trust claims, they trust data. Show your average score improvements automatically.",
                icon: ShieldCheck,
                color: "bg-emerald-100 text-emerald-600"
              },
              { 
                title: "Platform Independence", 
                desc: "Don't let Wyzant or Varsity Tutors own your reputation. Build your own portable profile.",
                icon: Lock,
                color: "bg-blue-100 text-blue-600"
              },
              { 
                title: "Scalable Trust", 
                desc: "Send potential leads a live link with your verified session history and response times.",
                icon: Search,
                color: "bg-indigo-100 text-indigo-600"
              }
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 dark:text-white">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 dark:text-slate-400">Join 500+ elite tutors growing their business with Chalk.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Free", price: "0", features: ["1 Student Profile", "Basic Analytics", "Zoom Integration"] },
              { name: "Standard", price: "12", features: ["10 Student Profiles", "Gmail Analysis", "Custom Slug", "Verified Badges"], popular: true },
              { name: "Pro", price: "29", features: ["Unlimited Students", "Advanced Reports", "White-label Domain", "Priority Support"] }
            ].map((plan, i) => (
              <div key={i} className={`
                p-8 rounded-2xl border bg-white dark:bg-slate-900 relative
                ${plan.popular ? 'border-indigo-500 shadow-xl shadow-indigo-100 dark:shadow-none ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-800'}
              `}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold mb-2 dark:text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold dark:text-white">${plan.price}</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle2 size={18} className="text-indigo-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button fullWidth variant={plan.popular ? 'primary' : 'outline'}>
                  {plan.price === "0" ? 'Start Free' : 'Choose Plan'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="text-indigo-600 fill-indigo-600" size={24} />
            <span className="text-xl font-bold tracking-tight dark:text-white">Chalk</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 Chalk Technologies Inc. Built for tutors, by tutors.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
