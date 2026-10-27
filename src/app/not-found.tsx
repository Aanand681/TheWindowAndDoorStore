import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Home, Inbox, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md shadow-xl relative z-10">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-primary">404 Error</span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The page, quote, or resource you are looking for does not exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className={buttonVariants({ variant: 'default', className: 'gap-2 rounded-full cursor-pointer' })}
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/quotes"
            className={buttonVariants({ variant: 'outline', className: 'gap-2 rounded-full cursor-pointer' })}
          >
            <Inbox className="w-4 h-4 text-amber-500" />
            <span>Quotes &amp; Bin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
