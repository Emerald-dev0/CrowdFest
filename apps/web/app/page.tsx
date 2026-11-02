"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import heroVisual from "./hero-visual.png";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space",
});

const PALETTE = [
  { name: "Sky Blue", hex: "#22d3ee" },
  { name: "Galactic Violet", hex: "#a855f7" },
  { name: "Bubblegum Pink", hex: "#f472b6" },
  { name: "Electric Blue", hex: "#22d3ee" },
  { name: "Cantaloupe Orange", hex: "#fb923c" },
  { name: "Midnight Black", hex: "#050507" },
];

type Orb = { x: number; y: number; vx: number; vy: number; r: number; color: string };

export default function Home() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [orbs, setOrbs] = useState<Orb[]>([]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    const created: Orb[] = [];
    for (let i = 0; i < 6; i++) {
      created.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: 200 + Math.random() * 400,
        color: PALETTE[i % PALETTE.length].hex,
      });
    }
    setOrbs(created);

    const animate = () => {
      setOrbs((prev) =>
        prev.map((o) => {
          let nx = o.x + o.vx;
          let ny = o.y + o.vy;
          if (nx < 0 || nx > window.innerWidth) o.vx *= -1;
          if (ny < 0 || ny > window.innerHeight) o.vy *= -1;
          const dx = (mouse.x - nx) * 0.005;
          const dy = (mouse.y - ny) * 0.005;
          o.vx += dx;
          o.vy += dy;
          o.vx *= 0.98;
          o.vy *= 0.98;
          return { ...o, x: nx, y: ny };
        })
      );
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [mouse]);

  const gradientOrbs = orbs.map(
    (o) =>
      `<div style="left:${o.x}px;top:${o.y}px;width:${o.r}px;height:${o.r}px;background:${o.color};filter:blur(80px);opacity:0.15;position:absolute;border-radius:50%;pointer-events:none;z-index:-1;"></div>`
  ).join("");

  return (
    <div className={`${inter.variable} ${space.variable} antialiased bg-[#050507] text-white selection:bg-violet-500 selection:text-white overflow-x-hidden`}>
      {/* Animated gradient orb background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div dangerouslySetInnerHTML={{ __html: gradientOrbs }} />
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
      <section className="relative min-h-[90vh] flex flex-col lg:flex-row items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-20%] w-[1200px] h-[1200px] bg-violet-600/10 rounded-full blur-[200px]"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[1400px] h-[1400px] bg-blue-600/8 rounded-full blur-[200px]"></div>
          <div className="absolute top-1/3 left-1/3 w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[160px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between gap-12">
            {/* Left: Creative typography */}
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[10px] font-medium text-blue-400 border border-blue-500/20 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Open beta · Self-hostable engine
              </div>

              <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-6 text-balance ${space.variable}`}>
                <span className="block text-white">suddenly,</span>
                <span className="block mt-2 gradient-text italic">everyone shows up.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-lg">
                AI-powered crowd simulation and application capacity testing.
                Describe your users, generate realistic journeys, and simulate them
                across real browsers and high-concurrency HTTP loads — before your
                customers discover your app's limits.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
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

              {/* Palette chips */}
              <div className="flex flex-wrap gap-3">
                {PALETTE.map((p) => (
                  <div key={p.name} className="glass px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 group hover:border-white/30 transition shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.hex }}></div>
                    <span className="text-[10px] font-medium text-slate-300 group-hover:text-white transition">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Hero visual */}
            <div className="lg:w-1/2 relative group">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group-hover:shadow-[0_0_50px_rgba(168,85,247,0.2)] transition">
                <img
                  src={heroVisual.src}
                  alt="CrowdFest hero"
                  className="w-full h-auto block transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent"></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {PALETTE.slice(0, 3).map((p) => (
                  <div key={p.name} className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center group-hover:scale-110 transition shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.hex }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product - bento grid with gradient cards */}
      <section id="product" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-balance ${space.variable}`}>
              The AI crowd simulation platform.
            </h2>
            <p className="text-slate-400 text-lg">
              Not just another HTTP benchmarking tool. CrowdFest combines AI-generated user journeys,
              real browser interaction testing, and high-concurrency load simulation in one platform.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "AI journey generation",
                color: "#22d3ee",
                icon: "🤖",
                body: "Describe your users in plain language. The AI planner turns it into structured, executable journeys — you review and approve before anything runs.",
              },
              {
                title: "Real browser agents",
                color: "#a855f7",
                icon: "🌐",
                body: "Playwright-controlled browser sessions with isolated contexts — click, type, log in, and verify real user journeys exactly as a person would.",
              },
              {
                title: "High-concurrency HTTP",
                color: "#f472b6",
                icon: "⚡",
                body: "Lightweight virtual users powered by k6 simulate hundreds of simultaneous sessions to measure throughput, latency, and capacity.",
              },
              {
                title: "Never combine the numbers",
                color: "#fb923c",
                icon: "📊",
                body: "1,000 HTTP virtual users are not 1,000 real browsers. We keep them distinct — and run both together.",
              },
            ].map((f, i) => {
              const glow = f.color === "#22d3ee" ? "bg-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]" : f.color === "#a855f7" ? "bg-violet-500/20 text-violet-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]" : f.color === "#f472b6" ? "bg-pink-500/20 text-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.4)]" : "bg-orange-500/20 text-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.4)]";
              return (
                <div key={i} className={`glass p-6 rounded-2xl border border-white/10 group relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[1px] rounded-full blur-[100px] -mr-16 -mt-16 group-hover:bg-[${f.color}]/20 transition duration-1000" style={{ backgroundColor: f.color + "1a" }}></div>
                  <div className="relative z-10">
                    <div className={`${glow} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Execution modes */}
      <section id="modes" className="py-24 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-pink-500/5 rounded-full blur-[200px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${space.variable}`}>
              Two execution modes. One simulation.
            </h2>
            <p className="text-slate-400 text-lg">
              1,000 HTTP virtual users are not 1,000 real browsers. CrowdFest keeps them distinct —
              and runs both together.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "AI browser agents",
                sub: "Real interactions",
                color: "#22d3ee",
                icon: "🌐",
                desc: "Actual browser sessions controlled by executable instructions. Open pages, click buttons, fill forms, log in, verify content, and report JavaScript errors — exactly as a real user would.",
                bestFor: "Discovering whether real journeys work",
                engine: "Playwright · Chromium · Isolated contexts",
              },
              {
                title: "Virtual users (HTTP)",
                sub: "High concurrency",
                color: "#f472b6",
                icon: "⚡",
                desc: "Lightweight simulated users executing predefined HTTP workflows. Authenticate, request data, submit forms, and maintain independent sessions at scale.",
                bestFor: "Throughput, response times & capacity",
                engine: "Grafana k6 · Closed & open models",
              },
            ].map((m, i) => {
              const glow = `0 0 60px ${m.color}33`;
              return (
                <div key={i} className="glass-strong p-8 rounded-2xl border border-white/10 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition ${m.color === "#22d3ee" ? "text-blue-400" : "text-pink-400"}`}>
                    {m.icon}
                  </div>
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-[${glow}] ${m.color === "#22d3ee" ? "bg-blue-500/20 text-blue-400" : "bg-pink-500/20 text-pink-400"}`}>
                      {m.icon}
                    </div>
                    <h3 className={`text-2xl font-bold ${space.variable}`}>{m.title}</h3>
                  </div>
                  <div className="flex -space-x-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${m.color === "#22d3ee" ? "text-blue-400 border-blue-500/20" : "text-pink-400 border-pink-500/20"}`}>
                      {m.sub}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-6 leading-relaxed">{m.desc}</p>
                  <div className="space-y-2 text-sm text-slate-400 mb-6">
                    <div className="flex items-center gap-2">
                      <span className={m.color === "#22d3ee" ? "text-blue-400" : "text-pink-400"}>✓</span>
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
        </div>
      </section>

      {/* How it works - numbered */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${space.variable}`}>
              From idea to capacity report.
            </h2>
            <p className="text-slate-400 text-lg">
              Create a simulation without writing a load-testing script.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Describe", body: "Name your app, set the target URL, and describe the user activity in plain language." },
              { num: "02", title: "Generate", body: "The AI planner converts it into structured journeys with steps, assertions, and data requirements." },
              { num: "03", title: "Approve", body: "Review the generated workflow. The AI never invents selectors or silently changes your intent." },
              { num: "04", title: "Simulate", body: "Run browser agents and HTTP virtual users together, watch live metrics, and get a capacity report." },
            ].map((s, i) => {
              const accent = i === 0 ? "#22d3ee" : i === 1 ? "#a855f7" : i === 2 ? "#f472b6" : "#fb923c";
              return (
                <div key={i} className="glass p-8 rounded-2xl border border-white/10 group relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-${accent} to-transparent`}></div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-sm mb-6 shadow-[0_0_24px_rgba(168,85,247,0.4)]`}>{s.num}</div>
                    <h3 className={`text-lg font-bold mb-2 ${space.variable}`}>{s.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live preview */}
      <section id="preview" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-orange-500/5 rounded-full blur-[200px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[200px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
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
          <div className="text-center max-w-3xl mx-auto mb-16">
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
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[200px]"></div>
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
              <a
                href="https://github.com/Emerald-dev0/CrowdFest"
                className="gradient-bg px-8 py-4 rounded-xl font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:opacity-90 transition flex items-center justify-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get started on GitHub <span className="text-lg">→</span>
              </a>
              <a href="#docs" className="glass px-8 py-4 rounded-xl font-semibold text-white hover:bg-white/10 transition flex items-center justify-center gap-2">
                Read the docs
              </a>
            </div>
            <p className="mt-10 text-[10px] text-slate-500 tracking-widest uppercase">
              CrowdFest · Open-source core · MIT licensed
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#040405] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl gradient-bg flex items-center justify-center text-[9px] font-bold text-white tracking-tighter">
              CF
            </div>
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
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(-2deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes animate-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite 2s; }
        .animate-ping { animation: animate-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease forwards; }
        .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.9s ease, transform 0.9s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .gradient-card { background: linear-gradient(135deg, #22d3ee 0%, #a855f7 45%, #f472b6 80%); }
        .glass { background: rgba(18, 18, 22, 0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.06); }
        .glass-strong { background: rgba(10, 10, 12, 0.7); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .gradient-text { background: linear-gradient(135deg, #22d3ee 0%, #a855f7 45%, #f472b6 80%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .gradient-bg { background: linear-gradient(135deg, #22d3ee 0%, #a855f7 40%, #f472b6 70%, #fb923c 100%); background-size: 200% 200%; animation: gradient-x 8s ease infinite; }
        .text-balance { text-wrap: balance; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
