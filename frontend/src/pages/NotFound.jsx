export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="relative text-center px-12 py-16 max-w-md rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-slate-400">
          Error
        </span>

        <h1 className="text-[8rem] font-extrabold text-[#1e40af] leading-none">
          404
        </h1>

        <p className="mt-4 text-xl font-light text-slate-700">
          Page not found
        </p>

        <p className="mt-6 text-sm text-slate-500 leading-relaxed">
          Sorry, the page you are looking for doesn’t exist or has been moved.
        </p>

        <a
          href="/"
          className="inline-block mt-10 px-6 py-3 text-sm font-medium rounded-full bg-[#1e40af] text-white hover:bg-[#1e40af]/80 transition"
        >
          Return home
        </a>
      </div>
    </div>
  );
}
