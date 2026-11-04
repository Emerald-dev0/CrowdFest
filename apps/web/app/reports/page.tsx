'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Simulation = { id: string; name: string; status: string; createdAt: string };

export default function ReportsPage() {
  const [sims, setSims] = useState<Simulation[]>([]);
  const [reports, setReports] = useState<Record<string, any>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await apiFetch('/api/v1/simulations');
        if (cancelled) return;
        setSims(data);
        for (const s of data) {
          if (s.status === 'completed') {
            try {
              const r = await apiFetch(`/api/v1/simulations/${s.id}/report`);
              if (!cancelled) setReports((prev) => ({ ...prev, [s.id]: r }));
            } catch {}
          }
        }
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-slate-400">Downloadable performance reports and AI-generated analysis.</p>
      </div>

      <div className="space-y-6">
        {sims.filter(s => s.status === 'completed').map((s) => {
          const r = reports[s.id];
          return (
            <div key={s.id} className="glass rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <p className="text-xs text-slate-500">{s.id}</p>
                </div>
                {r && (
                  <a
                    href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(r.reportJson, null, 2))}`}
                    download={`report-${s.id}.json`}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition border border-white/10"
                  >
                    Download JSON
                  </a>
                )}
              </div>
              {r ? (
                <div className="text-sm text-slate-300">
                  <p>Throughput: {r.reportJson?.performance?.throughput?.toFixed?.(1) ?? '-'} rps</p>
                  <p>P95 latency: {r.reportJson?.performance?.p95Ms?.toFixed?.(0) ?? '-'} ms</p>
                  <p>Error rate: {((r.reportJson?.performance?.errorRate ?? 0) * 100).toFixed(2)}%</p>
                  <p>Result: {r.reportJson?.executiveSummary?.overallResult}</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Loading report…</p>
              )}
            </div>
          );
        })}
        {sims.filter(s => s.status === 'completed').length === 0 && (
          <div className="glass rounded-2xl border border-white/10 p-6 md:p-10 text-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 text-2xl mx-auto mb-6">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">No reports yet</h3>
            <p className="text-slate-400 max-w-md mx-auto">Run a simulation to generate a performance report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
