'use client';

import { RefreshCw, LogIn } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans p-4">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Critical Application Error</h2>
            <p className="text-slate-400 text-sm">
              {error.message || 'The application failed to initialize properly.'}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-slate-500 bg-slate-950 p-2 rounded-md">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Reload App
            </button>
            <a
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-medium transition"
            >
              <LogIn className="w-4 h-4" />
              Login
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
