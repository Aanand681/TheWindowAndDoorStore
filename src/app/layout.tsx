import { Geist, Geist_Mono, IBM_Plex_Sans, Merriweather } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { cn } from "@/lib/utils";

const merriweatherHeading = Merriweather({subsets:['latin'],variable:'--font-heading'});

const ibmPlexSans = IBM_Plex_Sans({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import { Providers } from "@/components/layout/Providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", ibmPlexSans.variable, merriweatherHeading.variable)}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
