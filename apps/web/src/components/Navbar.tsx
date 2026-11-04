import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050507]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center text-[10px] font-bold text-white tracking-tighter shadow-[0_0_24px_rgba(34,211,238,0.3)]">
              CF
            </div>
            <span className="font-bold text-lg tracking-tight font-space">CrowdFest</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="/simulations" className="hover:text-white transition">Simulations</Link>
            <Link href="/reports" className="hover:text-white transition">Reports</Link>
            <Link href="/simulations/new" className="hover:text-white transition">New</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Emerald-dev0/CrowdFest"
              target="_blank"
              rel="noopener noreferrer"
              className="glass px-4 py-1.5 rounded-full text-sm font-medium text-white hover:bg-white/10 transition border border-white/10"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
