'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Step = 1 | 2 | 3 | 4;

export default function NewSimulationPage() {
  const router = useRouter();
  const [stepNum, setStepNum] = useState<number>(1);
  const step = stepNum as Step;
  const [form, setForm] = useState({
    name: '',
    target: '',
    description: '',
    browserSessions: 5,
    virtualUsers: 50,
    durationSeconds: 120,
  });
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [launchedId, setLaunchedId] = useState<string | null>(null);

  const next = () => setStepNum((s) => (s < 4 ? s + 1 : s));
  const back = () => setStepNum((s) => (s > 1 ? s - 1 : s));

  const launch = async () => {
    setLaunching(true);
    setError(null);
    try {
      const res = await apiFetch('/api/v1/simulations/quick', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setLaunchedId(res.simulation.id);
      setStepNum(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLaunching(false);
    }
  };

  const steps = [
    { num: '01', title: 'Target & description' },
    { num: '02', title: 'Crowd configuration' },
    { num: '03', title: 'Review & approve' },
    { num: '04', title: 'Launch' },
  ];

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">New simulation</h1>
          <p className="text-slate-400">Define your crowd test before launching.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-10">
        {steps.map((s, i) => {
          const active = i + 1 === step;
          const completed = i + 1 < step;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${completed ? 'bg-blue-500 text-white' : active ? 'gradient-bg text-white' : 'bg-white/10 text-slate-500 border border-white/10'}`}>
                {s.num}
              </div>
              {i < steps.length - 1 && <div className="h-px flex-1 bg-white/10"></div>}
              <span className={`text-sm font-medium ${active ? 'text-white' : 'text-slate-400'}`}>{s.title}</span>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl border border-white/10 p-8 md:p-12 shadow-2xl">
        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-white mb-6">Target & description</h2>
            <div className="space-y-6 max-w-lg">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Simulation name</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition"
                  placeholder="e.g. Staging capacity test"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Target URL</label>
                <input
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition"
                  placeholder="https://staging.example.com"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">User journey description</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition"
                  rows={4}
                  placeholder="e.g. Users register, create projects, invite team members, view dashboards"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button onClick={next} disabled={!form.name || !form.target} className="gradient-bg px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:opacity-90 transition disabled:opacity-50 disabled:pointer-events-none">
                Next →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-white mb-6">Crowd configuration</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-xl">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Browser sessions</label>
                    <span className="text-xs text-blue-400 font-mono">{form.browserSessions}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="20" step="1"
                    value={form.browserSessions}
                    onChange={(e) => setForm({ ...form, browserSessions: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Virtual users (HTTP)</label>
                    <span className="text-xs text-pink-400 font-mono">{form.virtualUsers}</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="500" step="10"
                    value={form.virtualUsers}
                    onChange={(e) => setForm({ ...form, virtualUsers: Number(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Duration</label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
                    value={form.durationSeconds}
                    onChange={(e) => setForm({ ...form, durationSeconds: Number(e.target.value) })}
                  >
                    <option value={60}>60 seconds</option>
                    <option value={120}>120 seconds</option>
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={back} className="text-slate-400 hover:text-white transition">← Back</button>
              <button onClick={next} className="gradient-bg px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:opacity-90 transition">
                Next →
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-xl font-bold text-white mb-6">Review & launch</h2>
            <div className="space-y-4 max-w-lg">
              <div><label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Name</label><p className="text-white">{form.name}</p></div>
              <div><label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Target</label><p className="text-white truncate">{form.target}</p></div>
              <div><label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Browser sessions</label><p className="text-white">{form.browserSessions}</p></div>
              <div><label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Virtual users</label><p className="text-white">{form.virtualUsers}</p></div>
              <div><label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Duration</label><p className="text-white">{form.durationSeconds}s</p></div>
            </div>
            {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
            <div className="mt-10 flex justify-between">
              <button onClick={back} className="text-slate-400 hover:text-white transition">← Back</button>
              <button onClick={launch} disabled={launching} className="gradient-bg px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:opacity-90 transition disabled:opacity-50">
                {launching ? 'Launching…' : 'Launch simulation →'}
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-2xl mb-6">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Simulation launched</h2>
              <p className="text-slate-400 mb-8">Your crowd test is running. Watch live metrics below.</p>
              <button
                onClick={() => launchedId && router.push(`/simulations/${launchedId}`)}
                className="gradient-bg px-8 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:opacity-90 transition"
              >
                View live monitoring →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
