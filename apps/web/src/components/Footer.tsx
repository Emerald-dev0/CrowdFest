export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center text-[8px] font-bold text-white">CF</div>
          <span>CrowdFest · AI crowd simulation platform</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/Emerald-dev0/CrowdFest" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  );
}
