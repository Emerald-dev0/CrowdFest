"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space",
});

const PALETTE = [
  { name: "Sky Blue", hex: "#22d3ee", glow: "rgba(34,211,238,0.35)" },
  { name: "Galactic Violet", hex: "#a855f7", glow: "rgba(168,85,247,0.35)" },
  { name: "Bubblegum Pink", hex: "#f472b6", glow: "rgba(244,114,182,0.35)" },
  { name: "Electric Blue", hex: "#22d3ee", glow: "rgba(34,211,238,0.35)" },
  { name: "Cantaloupe Orange", hex: "#fb923c", glow: "rgba(251,146,60,0.35)" },
  { name: "Midnight Black", hex: "#050507", glow: "rgba(255,255,255,0.1)" },
];

const HERO_LINES = [
  "Know what happens when",
  "everyone shows up.",
];

export default function Home() {
  const [revealKeys, setRevealKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const keys = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const key = (e.target as HTMLElement).dataset.key!;
            keys.add(key);
            setRevealKeys(new Set(keys));
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll<HTMLElement>("[data-key]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const cls = (key: string, extra: string): string => {
    return `reveal ${revealKeys.has(key) ? "visible" : ""} ${extra}`.trim();
  };

  return (
    <div className={`min-h-screen flex flex-col ${inter.variable} ${space.variable} antialiased bg-[#050507] text-white selection:bg-violet-500 selection:text-white overflow-x-hidden`}>
      {/* Background gradient glows matching references */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[140px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[900px] h-[900px] bg-blue-600/8 rounded-full blur-[140px] animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Nav */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 bg-[#050507]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-card flex items-center justify-center text-[10px] font-bold text-white tracking-tighter shadow-[0_0_24px_rgba(34,211,238,0.3)] border border-white/10">
                CF
              </div>
              <span className={`font-bold text-lg tracking-tight ${space.variable}`}>CrowdFest</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              <a href="#product" className="hover:text-white transition">Product</a>
              <a href="#modes" className="hover:text-white transition">Execution Modes</a>
              <a href="#how-it-works" className="hover:text-white transition">How it works</a>
              <a href="#preview" className="hover:text-white transition">Live preview</a>
            </div>
            <div className="flex items-center gap-3">
              <a href="#docs" className="text-sm font-medium text-slate-400 hover:text-white transition">Docs</a>
              <a
                href="https://github.com/Emerald-dev0/CrowdFest"
                className="glass px-4 py-1.5 rounded-full text-sm font-medium text-white hover:bg-white/10 transition border border-white/10"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 lg:pt-52 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            {/* Content */}
            <div data-key="hero-text" className={cls("hero-text", "")}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[10px] font-medium text-blue-400 border border-blue-500/20 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Open beta · Self-hostable engine
              </div>
              <h1 className={`font-bold text-6xl md:text-8xl leading-none mb-8 text-balance ${space.variable}`}>
                <span className="gradient-text">Know what happens</span><br />
                <span className="text-white">when everyone shows up.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10 max-w-lg">
                AI-powered crowd simulation and application capacity testing.
                Describe your users, generate realistic journeys, and simulate them
                across real browsers and high-concurrency HTTP loads — before your
                customers discover your app's limits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <a
                  href="/simulations/new"
                  className="gradient-bg px-8 py-4 rounded-xl font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Start simulating <span className="text-lg">→</span>
                </a>
                <a
                  href="#preview"
                  className="glass px-8 py-4 rounded-xl font-semibold text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
                >
                  <span className="w-5 h-5 border-2 border-current border-transparent rounded-full animate-spin"></span>
                  See it in action
                </a>
              </div>
              {/* Palette chips like references */}
              <div className="flex flex-wrap gap-4 mt-8">
                {PALETTE.map((p) => (
                  <div key={p.name} className="glass px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 group hover:border-white/30 transition">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.hex }}></div>
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white transition">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard mock like references */}
            <div data-key="hero-mock" className={cls("hero-mock", "relative h-[520px] lg:h-[640px] flex items-center justify-center")}>
              <div className="relative w-full h-full max-w-md lg:max-w-lg glass rounded-[2rem] p-1 shadow-2xl border border-white/10 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-violet-500/3 to-pink-500/5 -z-10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500"></div>
                <div className="absolute top-6 left-6 flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                </div>
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400/80"></div>
                      <span className="text-xs font-medium text-slate-300">crowdfest.local</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
                        Running
                      </span>
                      <span>5m 12s</span>
                    </div>
                  </div>
                  <div className="flex-1 p-6 overflow-hidden relative">
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[5, 120, 840].map((v, i) => (
                        <div key={i} className="glass p-3 rounded-xl">
                          <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                            {["Browsers", "Users", "RPS"][i]}
                          </div>
                          <div className="text-2xl font-bold text-white">{v}</div>
                        </div>
                      ))}
                    </div>
                    <svg className="w-full h-40" viewBox="0 0 600 160" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stop-color="#22d3ee" />
                          <stop offset="100%" stop-color="#a855f7" />
                        </linearGradient>
                      </defs>
                      <polyline
                        fill="none"
                        stroke="url(#heroLine)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="20,110 50,95 80,125 110,75 140,115 170,85 200,130 230,65 260,100 290,55 320,105 350,70 380,120 410,80 440,135 470,75 500,125 530,60 560,100"
                      />
                    </svg>
                    <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        Browser agent 03 completed login
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
                        Virtual user 128 dashboard request
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></div>
                        P95: 320ms
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating palette chips like references */}
              <div className="absolute -top-8 -left-6 w-24 h-24 rounded-[1.5rem] glass border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.3)] animate-float">
                <div className="p-2 text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-tight">
                  Sky Blue<br />Electric Blue
                </div>
              </div>
              <div className="absolute -bottom-12 -right-8 w-24 h-24 rounded-[1.5rem] glass border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-float-delayed">
                <div className="p-2 text-[9px] font-bold text-violet-400 uppercase tracking-widest leading-tight">
                  Galactic Violet
                </div>
              </div>
              <div className="absolute top-1/2 right-[-30px] w-20 h-20 rounded-[1.5rem] glass border border-white/10 shadow-[0_0_30px_rgba(244,114,182,0.3)]">
                <div className="p-2 text-[9px] font-bold text-pink-400 uppercase tracking-widest leading-tight">
                  Bubblegum Pink
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product - dark sections with copy like references */}
      <section id="product" className="py-24 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[140px] animate-float"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[140px] animate-float-delayed"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-20 ${cls("product-head", "")}`}>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-balance ${space.variable}`}>
              The AI crowd simulation platform.
            </h2>
            <p className="text-slate-400 text-lg">
              Not just another HTTP benchmarking tool. CrowdFest combines AI-generated user journeys,
              real browser interaction testing, and high-concurrency load simulation in one platform.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "AI journey generation", color: "blue", icon: "🤖", body: "Describe your users in plain language. The AI planner turns it into structured, executable journeys — you review and approve before anything runs." },
              { title: "Real browser agents", color: "violet", icon: "🌐", body: "Playwright-controlled browser sessions with isolated contexts — click, type, log in, and verify real user journeys exactly as a person would." },
              { title: "High-concurrency HTTP", color: "pink", icon: "⚡", body: "Lightweight virtual users powered by k6 simulate hundreds of simultaneous sessions to measure throughput, latency, and capacity." },
            ].map((f, i) => {
              const chip = f.color === "blue" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : f.color === "violet" ? "bg-violet-500/10 text-violet-400 border-violet-500/20" : "bg-pink-500/10 text-pink-400 border-pink-500/20";
              return (
                <div key={i} className={`glass p-6 rounded-2xl border border-white/10 group hover:border-white/30 transition ${chip}`}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Execution modes */}
      <section id="modes" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] bg-pink-500/5 rounded-full blur-[140px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-20 ${cls("modes-head", "")}`}>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${space.variable}`}>
              Two execution modes. One simulation.
            </h2>
            <p className="text-slate-400 text-lg">
              1,000 HTTP virtual users are not 1,000 real browsers. CrowdFest keeps them distinct —
              and runs both together.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {[
              { title: "AI browser agents", sub: "Real interactions", color: "blue", icon: "🌐", desc: "Actual browser sessions controlled by executable instructions. Open pages, click buttons, fill forms, log in, verify content, and report JavaScript errors — exactly as a real user would.", bestFor: "Discovering whether real journeys work", engine: "Playwright · Chromium · Isolated contexts" },
              { title: "Virtual users (HTTP)", sub: "High concurrency", color: "pink", icon: "⚡", desc: "Lightweight simulated users executing predefined HTTP workflows. Authenticate, request data, submit forms, and maintain independent sessions at scale.", bestFor: "Throughput, response times & capacity", engine: "Grafana k6 · Closed & open models" },
            ].map((m, i) => {
              const glow = m.color === "blue" ? "bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]" : "bg-pink-500/20 text-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.4)]";
              const chip = m.color === "blue" ? "text-blue-400 border-blue-500/20" : "text-pink-400 border-pink-500/20";
              return (
                <div key={i} className="glass-strong p-8 rounded-2xl border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.04] group-hover:opacity-[0.12] transition">{m.icon}</div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${glow}`}>{m.icon}</div>
                    <h3 className={`text-2xl font-bold ${space.variable}`}>{m.title}</h3>
                  </div>
                  <div className="flex -space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border ${chip}`}>{m.sub}</span>
                  </div>
                  <p className="text-slate-400 mb-6 leading-relaxed">{m.desc}</p>
                  <div className="space-y-2 text-sm text-slate-400 mb-6">
                    <div className="flex items-center gap-2">
                      <span className={m.color === "blue" ? "text-blue-400" : "text-pink-400"}>✓</span>
                      {m.bestFor}
                    </div>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Engine</div>
                    <div className="text-sm font-medium text-white">{m.engine}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={`mt-16 glass p-8 rounded-2xl border border-white/10 ${cls("modes-note", "")}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className={`text-xl font-bold mb-2 ${space.variable}`}>Never combine the numbers.</h3>
                <p className="text-slate-400 leading-relaxed">
                  The dashboard always distinguishes concurrent browser sessions, concurrent virtual users,
                  concurrent requests, and arrival rate — so you never mistake generator load for application
                  capacity.
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Browser sessions</div>
                <div className="w-px h-4 bg-white/20"></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-400"></div> Virtual users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-20 ${cls("steps-head", "")}`}>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${space.variable}`}>
              From idea to capacity report.
            </h2>
            <p className="text-slate-400 text-lg">
              Create a simulation without writing a load-testing script.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Describe", body: "Name your app, set the target URL, and describe the user activity in plain language." },
              { num: "02", title: "Generate", body: "The AI planner converts it into structured journeys with steps, assertions, and data requirements." },
              { num: "03", title: "Approve", body: "Review the generated workflow. The AI never invents selectors or silently changes your intent." },
              { num: "04", title: "Simulate", body: "Run browser agents and HTTP virtual users together, watch live metrics, and get a capacity report." },
            ].map((s, i) => (
              <div key={i} data-key={`step-${i}`} className={cls(`step-${i}`, "")}>
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm mb-5 shadow-[0_0_24px_rgba(168,85,247,0.4)]">{s.num}</div>
                <h3 className={`text-lg font-bold mb-2 ${space.variable}`}>{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live preview */}
      <section id="preview" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[140px] animate-float"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-blue-500/5 rounded-full blur-[140px] animate-float-delayed"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-20 ${cls("preview-head", "")}`}>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${space.variable}`}>
              Watch the crowd arrive.
            </h2>
            <p className="text-slate-400 text-lg">
              Live activity feed, concurrent session counts, P95/P99 latency, and error rates — updated
              in real time during execution.
            </p>
          </div>
          <div className="glass rounded-[2rem] border border-white/10 p-1 md:p-2 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/8 via-blue-500/8 to-violet-500/8 -z-10"></div>
            <div className="flex flex-col lg:flex-row h-[600px]">
              <div className="lg:w-1/3 border-r border-white/5 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-white">Simulation config</h3>
                  <button className="text-xs text-blue-400 font-medium hover:text-blue-300">Edit</button>
                </div>
                <div className="space-y-4 text-xs text-slate-400">
                  {[
                    ["Target", "https://staging.example.com"],
                    ["Model", "Closed workload"],
                    ["Browser sessions", "5"],
                    ["Virtual users", "100"],
                    ["Duration", "120s"],
                    ["P95 threshold", "500ms"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span>{k}</span>
                      <span className="text-white truncate max-w-[140px]">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-7 flex gap-2">
                  <button className="flex-1 glass px-3 py-2.5 rounded-xl text-xs font-medium text-white border border-white/10 hover:bg-white/10 transition">Start</button>
                  <button className="px-3 py-2.5 rounded-xl bg-white/10 text-xs font-medium text-white hover:bg-white/20 transition">Stop</button>
                </div>
              </div>
              <div className="lg:w-2/3 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Live activity feed</h3>
                  <span className="text-[10px] text-slate-500 font-mono">17:42:01 · 17:42:07</span>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-3">
                  {[
                    { who: "Browser agent 03", action: "completed login", err: false },
                    { who: "Virtual user 128", action: "completed dashboard request", err: false },
                    { who: "Browser agent 02", action: "encountered an error", err: true },
                    { who: "API response", action: "exceeded configured threshold", err: false },
                    { who: "Simulation", action: "entering next workload stage", err: false },
                  ].map((e, i) => (
                    <div key={i} className={`flex items-start gap-3 animate-fade-in`} style={{ animationDelay: `${i * 0.2}s` }}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${e.err ? "bg-red-500" : "bg-blue-400"}`}></div>
                      <div className="text-sm text-slate-300">{e.who} <span className={e.err ? "text-red-400" : "text-white"}>{` ${e.action}`}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-24 border-y border-white/5 bg-[#08080a]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${cls("tech-head", "")}`}>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${space.variable}`}>
              Built on proven infrastructure.
            </h2>
            <p className="text-slate-400 text-lg">
              A modular monolith control plane with independent execution workers — no
              fifteen-microservice over-engineering.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            {["Next.js", "Fastify", "PostgreSQL", "Redis + BullMQ", "Playwright", "k6", "OpenTelemetry", "S3-compatible"].map((t, i) => (
              <div key={i} className="glass p-5 rounded-xl border border-white/10 hover:border-white/20 transition group">
                <div className="text-lg mb-2 group-hover:scale-110 transition">{t}</div>
                <div className="text-[10px] text-slate-500">{i % 2 === 0 ? "Dashboard frontend" : i === 1 ? "Control-plane API" : i === 2 ? "Source of truth" : i === 3 ? "Job coordination" : i === 4 ? "Real browsers" : i === 5 ? "HTTP load engine" : i === 6 ? "Execution tracing" : "Reports & artifacts"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="start" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[140px] animate-float"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-[2rem] border border-white/10 p-8 md:p-14 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500"></div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${space.variable}`}>
              Ready to find your capacity?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Open beta is live. The execution engine is self-hostable — run it locally or deploy with Docker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://github.com/Emerald-dev0/CrowdFest" className="gradient-bg px-8 py-4 rounded-xl font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:opacity-90 transition flex items-center justify-center gap-2" target="_blank" rel="noopener noreferrer">
                Get started on GitHub <span className="text-lg">→</span>
              </a>
              <a href="#docs" className="glass px-8 py-4 rounded-xl font-semibold text-white hover:bg-white/10 transition flex items-center justify-center gap-2">Read the docs</a>
            </div>
            <p className="mt-10 text-[10px] text-slate-500 tracking-widest uppercase">CrowdFest · Open-source core · MIT licensed</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#040405] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl gradient-bg flex items-center justify-center text-[9px] font-bold text-white tracking-tighter">CF</div>
            <span className={`font-bold text-sm tracking-tight ${space.variable}`}>CrowdFest</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-slate-500">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Security</a>
            <span className="opacity-50">·</span>
            <span>Built for developers.</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)rotate(0deg)}50%{transform:translateY(-20px)rotate(2deg)} }
        @keyframes float-delayed { 0%,100%{transform:translateY(0)rotate(0deg)}50%{transform:translateY(-16px)rotate(-2deg)} }
        @keyframes gradient-x { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
        @keyframes animate-ping { 75%,100%{transform:scale(2);opacity:0} }
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        .animate-float{animation:float 6s ease-in-out infinite}
        .animate-float-delayed{animation:float-delayed 8s ease-in-out infinite 2s}
        .animate-ping{animation:animate-ping 2s cubic-bezier(0,0,0.2,1) infinite}
        .animate-fade-in{animation:fade-in 0.6s ease forwards}
        .reveal{opacity:0;transform:translateY(30px);transition:opacity 0.9s ease,transform 0.9s ease}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .gradient-card{background:linear-gradient(135deg,#22d3ee 0%,#a855f7 45%,#f472b6 80%)}
        .glass{background:rgba(18,18,22,0.6);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.06)}
        .glass-strong{background:rgba(10,10,12,0.7);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.08)}
        .gradient-text{background:linear-gradient(135deg,#22d3ee 0%,#a855f7 45%,#f472b6 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .gradient-bg{background:linear-gradient(135deg,#22d3ee 0%,#a855f7 40%,#f472b6 70%,#fb923c 100%);background-size:200% 200%;animation:gradient-x 8s ease infinite}
        .text-balance{text-wrap:balance}
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  );
}
