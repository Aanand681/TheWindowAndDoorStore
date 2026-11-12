"use client"

import { RefreshCw, LogIn } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-950 p-4 font-sans text-slate-100">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-2xl font-bold text-red-400">
            !
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Critical Application Error
            </h2>
            <p className="text-sm text-slate-400">
              {error.message ||
                "The application failed to initialize properly."}
            </p>
            {error.digest && (
              <p className="rounded-md bg-slate-950 p-2 font-mono text-xs text-slate-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              <RefreshCw className="h-4 w-4" />
              Reload App
            </button>
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              <LogIn className="h-4 w-4" />
              Login
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
