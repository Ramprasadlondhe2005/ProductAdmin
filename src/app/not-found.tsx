import Link from 'next/link';
import { Home, PackageX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-md w-full shadow-2xl space-y-4">
        <div className="w-16 h-16 bg-rose-950/60 border border-rose-900/40 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
          <PackageX className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-100">404</h1>
        <h2 className="text-lg font-bold text-slate-200">Page Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          The page or product resource you are looking for doesn’t exist or has been moved.
        </p>

        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-sky-600/20"
          >
            <Home className="w-4 h-4" />
            <span>Go to Admin Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
