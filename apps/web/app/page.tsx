'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-[#050507] text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[-20%] left-[-10%] w-[900px] h-[900px] bg-violet-600/20 rounded-full blur-[180px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-cyan-500/15 rounded-full blur-[180px]" />
          <div className="absolute top-[30%] right-[20%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[160px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-slate-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Open source · Self-hostable
            </div>
            <h1 className="font-space text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              Know what happens when <span className="gradient-text">everyone shows up.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
              CrowdFest simulates real users and HTTP crowds against your application — with AI-generated journeys, isolated browser contexts, and live capacity metrics.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/simulations/new" className="gradient-bg px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:opacity-90 transition">
                Launch a simulation →
              </Link>
              <Link href="/simulations" className="glass px-6 py-3 rounded-xl font-semibold text-white hover:bg-white/10 transition border border-white/10">
                View dashboard
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500">
              <div><span className="text-white font-semibold">2 modes</span> · browser + HTTP</div>
              <div><span className="text-white font-semibold">15 tables</span> · full schema</div>
              <div><span className="text-white font-semibold">Live</span> · WebSocket metrics</div>
            </div>
          </div>
          <div className="relative">
            <div className="glass rounded-3xl border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium text-slate-400">Live simulation</div>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> running
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[
                  { label: 'Browsers', value: '12', color: 'text-cyan-400' },
                  { label: 'Virtual users', value: '240', color: 'text-pink-400' },
                  { label: 'RPS', value: '1.8k', color: 'text-violet-400' },
                  { label: 'P95', value: '312ms', color: 'text-emerald-400' },
                ].map((m) => (
                  <div key={m.label} className="glass rounded-2xl border border-white/5 p-4">
                    <div className="text-xs text-slate-500">{m.label}</div>
                    <div className={`text-2xl font-bold ${m.color} mt-1`}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div className="h-32 flex items-end gap-1">
                {Array.from({ length: 32 }).map((_, i) => {
                  const h = 20 + Math.round(Math.sin(i / 3) * 30 + Math.random() * 20);
                  return <div key={i} className="flex-1 bg-gradient-to-t from-violet-500/40 to-cyan-400/80 rounded-t" style={{ height: `${h}%` }} />;
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="font-space text-4xl font-bold">Everything you need to test at scale</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">From AI-generated journeys to reproducible reports.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'AI scenario generation', desc: 'Describe your user flows in plain English. The planner builds journeys, the builder structures steps, the validator checks scope.', color: 'from-cyan-500 to-blue-500' },
            { title: 'Real browser contexts', desc: 'Playwright isolates cookies, storage, and sessions per simulated user. Real clicks, real forms, real JavaScript errors.', color: 'from-violet-500 to-fuchsia-500' },
            { title: 'HTTP crowd load', desc: 'k6 drives thousands of lightweight virtual users with realistic traffic patterns and threshold checks.', color: 'from-pink-500 to-orange-500' },
            { title: 'Live metrics', desc: 'WebSocket streams RPS, latency percentiles, and error rates as the test runs.', color: 'from-emerald-500 to-cyan-500' },
            { title: 'AI analysis', desc: 'Post-run reports distinguish measured facts from hypotheses and suggest bottlenecks.', color: 'from-orange-500 to-red-500' },
            { title: 'Security first', desc: 'SSRF prevention, target verification, execution limits, and per-org budgets built in.', color: 'from-blue-500 to-violet-500' },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl border border-white/10 p-6 hover:border-white/20 transition">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} mb-4`} />
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="glass rounded-3xl border border-white/10 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-600/10 to-cyan-500/10" />
          <h2 className="font-space text-4xl font-bold mb-4">Ready to test your capacity?</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">Spin up a simulation in under a minute. No scripts required.</p>
          <Link href="/simulations/new" className="gradient-bg px-8 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:opacity-90 transition inline-block">
            Create your first simulation →
          </Link>
        </div>
      </section>
    </div>
  );
}
