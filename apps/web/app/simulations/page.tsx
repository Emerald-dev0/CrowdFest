import Link from 'next/link';

export default function SimulationsPage() {
  const simulations = [
    { id: 'sim_001', name: 'Staging capacity test', status: 'completed', browsers: 5, users: 100, rps: 840, p95: '320ms', errors: '0.2%' },
    { id: 'sim_002', name: 'Login journey validation', status: 'running', browsers: 3, users: 50, rps: 420, p95: '450ms', errors: '1.1%' },
    { id: 'sim_003', name: 'Checkout burst test', status: 'draft', browsers: 0, users: 0, rps: 0, p95: '-', errors: '-' },
  ];

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

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Browsers</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Virtual users</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">RPS</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">P95</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Errors</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {simulations.map((s) => (
              <tr key={s.id} className="hover:bg-white/3 transition">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    s.status === 'running' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                    s.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    s.status === 'draft' ? 'bg-slate-600/20 text-slate-400' :
                    'bg-pink-500/20 text-pink-400'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-white">{s.browsers}</td>
                <td className="px-6 py-4 text-white">{s.users}</td>
                <td className="px-6 py-4 text-slate-300">{s.rps}</td>
                <td className="px-6 py-4 text-slate-300">{s.p95}</td>
                <td className="px-6 py-4 text-slate-300">{s.errors}</td>
                <td className="px-6 py-4">
                  <Link href={`/simulations/${s.id}`} className="text-blue-400 text-sm hover:text-blue-300">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
