export default function SimulationDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Simulation {params.id}</h1>
          <p className="text-slate-400">Live monitoring and results.</p>
        </div>
      </div>

      {/* Live metrics */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Active browsers', value: '5', color: 'text-blue-400', sub: 'isolated contexts' },
          { label: 'Virtual users', value: '100', color: 'text-pink-400', sub: 'HTTP load' },
          { label: 'Requests / sec', value: '840', color: 'text-violet-400', sub: 'throughput' },
        ].map((m) => (
          <div key={m.label} className="glass p-6 rounded-2xl border border-white/10">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{m.label}</div>
            <div className={`text-3xl font-bold ${m.color} mb-1`}>{m.value}</div>
            <div className="text-xs text-slate-500">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Activity feed */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-6">Live activity feed</h3>
          <div className="space-y-3 text-sm text-slate-300 no-scrollbar">
            {[
              '17:42:01 Browser agent 03 completed login',
              '17:42:02 Virtual user 128 completed dashboard request',
              '17:42:03 Browser agent 02 encountered an error',
              '17:42:04 API response exceeded configured threshold',
              '17:42:05 Simulation entering next workload stage',
            ].map((line, i) => {
              const [time, ...rest] = line.split(' ');
              return (
                <div key={i} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                  <span className="font-mono text-[10px] text-slate-500">{time}</span>
                  <span className="ml-1">{rest.join(' ')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latency chart placeholder */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-bold text-white mb-6">P95 latency over time</h3>
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            Live metrics stream via WebSocket — connect the API to stream real data.
          </div>
        </div>
      </div>

      <div className="mt-10 glass rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-6">Controls</h3>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-xl font-semibold text-white bg-white/10 hover:bg-white/20 transition border border-white/10">
            Stop simulation
          </button>
          <button className="px-6 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(244,114,182,0.35)] hover:opacity-90 transition gradient-bg">
            Export report
          </button>
        </div>
      </div>
    </div>
  );
}
