'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch, WS_BASE } from '@/lib/api';

type Simulation = { id: string; name: string; status: string; requestedWorkload?: any; startedAt?: string; endedAt?: string };
type MetricRow = { metricName: string; value: number; timeBucket: string };
type EventRow = { id: string; eventType: string; payload: any; timestamp: string };

export default function SimulationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [wsStatus, setWsStatus] = useState<string>('connecting');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const s = await apiFetch(`/api/v1/simulations/${id}`);
        if (!cancelled) setSim(s);
        const m = await apiFetch(`/api/v1/simulations/${id}/metrics`);
        if (!cancelled) setMetrics(m);
        const e = await apiFetch(`/api/v1/simulations/${id}/events`);
        if (!cancelled) setEvents(e);
      } catch {}
    }
    load();
    const interval = setInterval(load, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(WS_BASE);
      ws.onopen = () => setWsStatus('connected');
      ws.onclose = () => setWsStatus('disconnected');
      ws.onerror = () => setWsStatus('error');
      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          if (data.simulationId && data.simulationId !== id) return;
          if (data.payload?.status) {
            setSim((prev) => (prev ? { ...prev, status: data.payload.status } : prev));
          }
          if (data.payload?.snapshot) setSnapshot(data.payload.snapshot);
          if (data.payload?.eventType === 'metrics.updated' && data.payload?.payload?.snapshot) {
            setSnapshot(data.payload.payload.snapshot);
          }
        } catch {}
      };
    } catch {
      setWsStatus('error');
    }
    return () => { ws?.close(); };
  }, [id]);

  const stop = async () => {
    await apiFetch(`/api/v1/simulations/${id}/cancel`, { method: 'POST' });
  };

  const exportReport = async () => {
    try {
      const r = await apiFetch(`/api/v1/simulations/${id}/report`);
      const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (!sim) return <div className="min-h-screen py-24 px-4 text-slate-400">Loading…</div>;

  const cfg = sim.requestedWorkload || {};
  const latestP95 = metrics.filter(m => m.metricName === 'p95_latency_ms').slice(-1)[0]?.value;
  const latestRps = metrics.filter(m => m.metricName === 'requests_per_second').slice(-1)[0]?.value;
  const latestErr = metrics.filter(m => m.metricName === 'error_rate').slice(-1)[0]?.value;

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{sim.name}</h1>
          <p className="text-slate-400">Live monitoring and results. WS: {wsStatus}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          sim.status === 'running' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
          sim.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          sim.status === 'failed' ? 'bg-red-500/20 text-red-400' :
          'bg-slate-600/20 text-slate-400'
        }`}>{sim.status}</span>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Active browsers', value: snapshot?.activeBrowserSessions ?? cfg?.engines?.browser?.sessions ?? 0, color: 'text-blue-400' },
          { label: 'Virtual users', value: snapshot?.activeHttpUsers ?? cfg?.engines?.http?.virtualUsers ?? 0, color: 'text-pink-400' },
          { label: 'Requests / sec', value: snapshot?.requestsPerSecond ?? latestRps ?? 0, color: 'text-violet-400' },
          { label: 'P95 latency', value: `${snapshot?.p95LatencyMs ?? latestP95 ?? 0}ms`, color: 'text-emerald-400' },
        ].map((m) => (
          <div key={m.label} className="glass p-6 rounded-2xl border border-white/10">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{m.label}</div>
            <div className={`text-3xl font-bold ${m.color} mb-1`}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-6">Live activity feed</h3>
          <div className="space-y-2 text-sm text-slate-300 max-h-80 overflow-y-auto">
            {events.slice(-30).reverse().map((e) => (
              <div key={e.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span className="font-mono text-[10px] text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</span>
                <span className="ml-1">{e.eventType}</span>
              </div>
            ))}
            {events.length === 0 && <div className="text-slate-500">No events yet.</div>}
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-6">P95 latency over time</h3>
          <div className="h-64 flex items-end gap-1">
            {metrics.filter(m => m.metricName === 'p95_latency_ms').slice(-40).map((m, i) => {
              const h = Math.min(100, (m.value / 500) * 100);
              return <div key={i} className="flex-1 bg-blue-500/60 rounded-t" style={{ height: `${h}%` }} title={`${m.value}ms`} />;
            })}
            {metrics.filter(m => m.metricName === 'p95_latency_ms').length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">Waiting for metrics…</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 glass rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-6">Controls</h3>
        <div className="flex gap-3">
          <button onClick={stop} className="px-6 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 transition border border-white/10">
            Stop simulation
          </button>
          <button onClick={exportReport} className="px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(244,114,182,0.35)] hover:opacity-90 transition gradient-bg">
            Export report
          </button>
          <button onClick={() => router.push('/reports')} className="px-6 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 transition border border-white/10">
            View reports
          </button>
        </div>
      </div>
    </div>
  );
}
