import nodemailer from "nodemailer"

export function getAppUrl(request?: Request): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.APP_URL) return process.env.APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  if (request) {
    const rawHost =
      request.headers.get("x-forwarded-host") || request.headers.get("host")
    if (rawHost) {
      const host = rawHost.split(":")[0].toLowerCase()
      // Allowlist verification to prevent Host Header Injection
      const isAllowedHost =
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.startsWith("192.168.") ||
        host.startsWith("10.") ||
        host.endsWith(".vercel.app") ||
        (process.env.VERCEL_URL && host === process.env.VERCEL_URL)

      if (isAllowedHost) {
        const proto =
          request.headers.get("x-forwarded-proto") ||
          (process.env.NODE_ENV === "production" ? "https" : "http")
        return `${proto}://${rawHost}`
      }
    }
  }

  return "http://localhost:3000"
}

export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email
  const [local, domain] = email.split("@")
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`
  }
  return `${local.slice(0, 2)}${"*".repeat(Math.max(3, local.length - 2))}@${domain}`
}

export function getEmailTransporterConfig() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || "587", 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from =
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    '"The Window & Door Store" <noreply@vwd.com>'

  const hasSmtp = Boolean(host && user && pass)
  return { host, port, user, pass, from, hasSmtp }
}

export function createNodemailerTransporter() {
  const { host, port, user, pass } = getEmailTransporterConfig()
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465 || process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  })
}
