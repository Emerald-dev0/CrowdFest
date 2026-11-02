export default function ReportsPage() {
  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-slate-400">Downloadable performance reports and AI-generated analysis.</p>
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 md:p-10">
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 text-2xl mx-auto mb-6">
            📊
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No reports yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Run a simulation to generate a performance report with executive summary,
            latency breakdowns, user journey results, and AI-powered failure analysis.
          </p>
          <a
            href="/simulations/new"
            className="mt-6 inline-block gradient-bg px-8 py-3 rounded-xl font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:opacity-90 transition"
          >
            Create a simulation →
          </a>
        </div>
      </div>
    </div>
  );
}
