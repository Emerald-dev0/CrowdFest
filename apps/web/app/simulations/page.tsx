'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Simulation = {
  id: string;
  name: string;
  status: string;
  requestedWorkload?: any;
  createdAt: string;
};

export default function SimulationsPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiFetch('/api/v1/simulations');
        if (!cancelled) setSimulations(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Simulations</h1>
          <p className="text-slate-400">Manage and monitor your crowd simulations.</p>
        </div>
        <Link href="/simulations/new" className="gradient-bg px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:opacity-90 transition">
          New simulation
        </Link>
      </div>

      {error && <div className="mb-4 text-red-400 text-sm">{error}</div>}
      {loading && <div className="text-slate-400">Loading…</div>}

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Browsers</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Virtual users</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {simulations.map((s) => {
              const cfg = s.requestedWorkload || {};
              return (
                <tr key={s.id} className="hover:bg-white/3 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.status === 'running' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                      s.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      s.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      s.status === 'cancelled' ? 'bg-slate-600/20 text-slate-400' :
                      'bg-slate-600/20 text-slate-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{cfg?.engines?.browser?.sessions ?? '-'}</td>
                  <td className="px-6 py-4 text-white">{cfg?.engines?.http?.virtualUsers ?? '-'}</td>
                  <td className="px-6 py-4">
                    <Link href={`/simulations/${s.id}`} className="text-blue-400 text-sm hover:text-blue-300">View</Link>
                  </td>
                </tr>
              );
            })}
            {!loading && simulations.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No simulations yet. Create one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
