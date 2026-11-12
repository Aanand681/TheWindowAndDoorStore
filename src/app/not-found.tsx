import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Home, Inbox, FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 w-full max-w-md space-y-6 rounded-2xl border border-border/60 bg-card/80 p-8 text-center shadow-xl backdrop-blur-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileQuestion className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-widest text-primary uppercase">
            404 Error
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The page, quote, or resource you are looking for does not exist or
            may have been moved.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <Link
            href="/"
            className={buttonVariants({
              variant: "default",
              className: "cursor-pointer gap-2 rounded-full",
            })}
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/quotes"
            className={buttonVariants({
              variant: "outline",
              className: "cursor-pointer gap-2 rounded-full",
            })}
          >
            <Inbox className="h-4 w-4 text-amber-500" />
            <span>Quotes &amp; Bin</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
