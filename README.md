# The Window & Door Store - Internal Tools Platform

> A comprehensive Next.js application for quote calculation, PDF generation, review workflows, and admin management for a window/door company.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Run development server
npm run dev

# Type check
npm run typecheck

# Lint & Format
npm run lint && npm run format

# Build for production
npm run build
```

---

## 🏗 Architecture Overview

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # REST API endpoints
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── quotes/        # Quote CRUD, review, Odoo, reminders, flush
│   │   ├── promos/        # Promo management
│   │   ├── users/         # Staff management
│   │   ├── regions/       # Region pricing
│   │   ├── settings/      # Global settings
│   │   └── ...
│   ├── admin/             # Admin dashboard pages
│   ├── quote-studio/      # PDF Studio (supplier PDF → customer PDF)
│   ├── quotes/            # Quotes & Review queue
│   └── page.tsx           # Main calculator (promo + tax + review)
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── QuotesTab.tsx      # Quote review/management (reusable)
│   ├── QuoteInvoice.tsx   # Quote PDF generation (3 templates)
│   ├── QuotePreviewModal.tsx
│   ├── NotificationBell.tsx
│   ├── UserProfileMenu.tsx
│   └── ...
├── lib/
│   ├── auth.ts            # NextAuth config (credentials + rate limiting)
│   ├── mongodb.ts         # Mongoose connection (cached for serverless)
│   ├── promo-logic.ts     # Core pricing/promo calculations
│   ├── pdf-parser.ts      # Supplier PDF text extraction
│   ├── pdf-studio/        # PDF Studio: extractor + generator
│   ├── client-cache.ts    # In-memory SWR-style cache
│   ├── quote-diff.ts      # Quote change detection
│   ├── email.ts           # Nodemailer templates
│   └── pusher-server/client.ts  # Real-time notifications
├── models/                # Mongoose schemas
├── hooks/                 # Custom React hooks
└── middleware.ts          # Auth protection (Edge runtime ready)
```

---

## 🎯 Key Features

| Feature | Description | Location |
|---------|-------------|----------|
| **Promo Calculator** | Dynamic promos (BOGO, Free Parts, %, Combo), surcharge, upgrades | `src/lib/promo-logic.ts`, `src/app/page.tsx` |
| **Tax & Labour Calculator** | Region-based, JC/Misc/Labour, custom overrides | `src/components/TaxCalculatorTab.tsx` |
| **Quote Review Workflow** | Sales → Review (Approve/Return) → Odoo Entry → Complete | `src/app/api/quotes/`, `src/components/QuotesTab.tsx` |
| **PDF Quote Studio** | Upload supplier PDF → Extract CAD + data → Generate clean customer PDF | `src/app/quote-studio/`, `src/lib/pdf-studio/` |
| **Real-time Notifications** | Pusher for quote assignments, reviews, Odoo updates | `src/lib/pusher-*.ts` |
| **Admin Dashboard** | Settings, Tax, Regions, Staff, Promos, Geofence Map | `src/app/admin/` |
| **Role-Based Access** | SUPERADMIN, ADMIN, MANAGER, SALES, CLERK with granular permissions | `src/lib/auth.ts`, `src/models/Department.ts` |

---

## ⚙️ Environment Variables

Create `.env.local` with:

```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Auth
NEXTAUTH_SECRET=your-32-char-secret
NEXTAUTH_URL=http://localhost:3000  # Auto-corrected on Vercel

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-password
EMAIL_FROM="Window & Door Store <noreply@yourdomain.com>"

# Pusher (Real-time)
PUSHER_APP_ID=xxx
PUSHER_KEY=xxx
PUSHER_SECRET=xxx
PUSHER_CLUSTER=us2
NEXT_PUBLIC_PUSHER_KEY=xxx
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📦 Deployment (Vercel)

### 1. Connect Repository
- Import project in Vercel
- Framework: Next.js (auto-detected)

### 2. Environment Variables
Add all variables from `.env.local` to Vercel Project Settings → Environment Variables

### 3. Build Settings (Auto-detected)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### 4. Vercel Configuration (`vercel.json`)
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "crons": [
    {
      "path": "/api/quotes/reminders",
      "schedule": "0 9 * * 1-5"
    }
  ]
}
```

### 5. Domain & SSL
- Add custom domain in Vercel
- SSL auto-provisioned

---

## 🔧 Performance Optimizations (Applied)

| Optimization | Status | Details |
|--------------|--------|---------|
| React Compiler (Next.js 16+) | ✅ Enabled | `experimental.reactCompiler: true` |
| Package Import Optimization | ✅ Enabled | `lucide-react`, `@hugeicons/react`, `sonner` |
| Image Optimization | ✅ Enabled | AVIF/WebP, responsive sizes |
| Dynamic Imports | 🟡 Partial | PDF Studio, Map, Heavy components |
| API Response Caching (ISR) | 🟡 Planned | Promos, Settings, Regions |
| Edge Middleware | 🟡 Ready | `middleware.ts` compatible |
| Bundle Analysis | 🟡 Run `npm run build` | Check `.next/analyze` |

### Performance Targets
- **LCP (Calculator):** < 1.5s
- **TTI (Calculator):** < 2s
- **First Load JS (Main):** < 200 KB gzipped
- **API p95 Latency:** < 500ms

---

## 🗄 Database Schema (MongoDB)

### Core Collections
- **SavedQuote** - Quotes with full snapshot, review workflow, Odoo tracking
- **User** - Staff accounts, roles, departments, permissions
- **Department** - Permission templates (canReviewQuote, canAccessAdmin, etc.)
- **Promo** - Dynamic promotions (BOGO, Free Parts, %, Combo)
- **RegionConfig** - Per-sqft rates, setup fees, map coordinates
- **Settings** - Global surcharge, tax rates, upgrade thresholds
- **Notification** - Real-time + email notifications

### Critical Indexes (Run Once)
```javascript
// In MongoDB shell
use windowdoorstore

db.savedquotes.createIndex({ status: 1, assignedTo: 1, createdAt: -1 })
db.savedquotes.createIndex({ odooAssignedTo: 1, odooStatus: 1, createdAt: -1 })
db.savedquotes.createIndex({ preparedBy: 1, status: 1, createdAt: -1 })
db.savedquotes.createIndex({ quoteNumber: "text", customerName: "text", preparedBy: "text" })
```

---

## 👥 User Roles & Permissions

| Role | Calculator | Quotes | PDF Studio | Admin | Review | Odoo Entry |
|------|------------|--------|------------|-------|--------|------------|
| SUPERADMIN | ✅ | ✅ All | ✅ | ✅ Full | ✅ All | ✅ All |
| ADMIN | ✅ | ✅ All | ✅ | ✅ Most | ✅ Assigned | ✅ All |
| MANAGER | ✅ | ✅ Assigned | ✅ | ❌ | ✅ Assigned | ✅ Assigned |
| SALES | ✅ | ✅ Own | ✅ | ❌ | ❌ | ❌ |
| CLERK | ✅ | ✅ Assigned | ❌ | ❌ | ❌ | ✅ Assigned |

**Permission Granularity:** Department-based + Custom overrides per user

---

## 🔄 Quote Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   SALES     │────▶│   REVIEW    │────▶│    ODOO     │────▶│  COMPLETED  │
│  Prepares   │     │  Approves/  │     │   CLERK     │     │  (Archived) │
│  Quote      │     │  Returns    │     │  Enters SO# │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
  PENDING_          APPROVED/           PENDING_ENTRY        COMPLETED
  REVIEW            MODIFIED/                                             
                    RETURNED
```

**Statuses:** `PENDING_REVIEW` → `APPROVED`/`MODIFIED`/`RETURNED` → `PENDING_ENTRY` → `COMPLETED`

---

## 📋 Improvement Tracker

See **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** for detailed analysis and roadmap.

### Current Phase: Pre-Production Hardening

**Immediate Actions (This Week):**
- [ ] Split monolithic `page.tsx` into route segments (`/`, `/quotes`, `/tax`, `/review/[id]`)
- [ ] Add Zod env validation (`src/env.ts`)
- [ ] Add error boundaries (`app/error.tsx`, `app/global-error.tsx`)
- [ ] Create compound MongoDB indexes
- [ ] Enable API caching for read-heavy endpoints
- [ ] Dynamic import PDF Studio (`next/dynamic`)
- [ ] Convert logo to WebP + use `next/image`
- [ ] Add `vercel.json` with function config + cron

---

## 🧪 Testing Strategy (Planned)

```bash
# Unit tests (Vitest)
npm run test:unit

# E2E tests (Playwright)
npm run test:e2e

# Type check
npm run typecheck

# Lint
npm run lint
```

**Priority Test Coverage:**
1. `promo-logic.ts` - All promo types, edge cases
2. `quote-diff.ts` - Change detection accuracy
3. `pdf-parser.ts` - Various supplier PDF formats
4. API routes - Auth, validation, workflow transitions

---

## 📝 Development Guidelines

### Code Style
- **TypeScript strict mode** - No `any` without justification
- **Functional components** + hooks
- **Server Components by default** - `'use client'` only when needed
- **Colocated types** - Define interfaces near usage

### Git Workflow
```bash
# Feature branch
git checkout -b feature/quote-export-pdf

# Commit format
git commit -m "feat(quotes): add PDF export for approved quotes"

# PR → Review → Merge → Deploy preview → Production
```

### Adding New Promos
1. Admin → Promos → Create new promo (type: BOGO/FREE_PARTS/PERCENTAGE/COMBO)
2. Set `isActive: true` and `order` for display priority
3. Test in Calculator - auto-applies lowest qualifying promo

### Adding New Regions
1. Admin → Regions → Add region with:
   - `code` (unique), `name`, `perSqFtRate`, `fixedSetupFee`
   - `mapCenter` [lat, lng], `mapZoom`
2. Tax Calculator auto-loads region defaults

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection timeout | Check `MONGODB_URI` allows Vercel IPs (0.0.0.0/0) |
| NextAuth "Invalid callback URL" | Ensure `NEXTAUTH_URL` matches deployment domain |
| Pusher not connecting | Verify `NEXT_PUBLIC_PUSHER_KEY/CLUSTER` in browser console |
| PDF extraction fails | Check supplier PDF format matches parser expectations |
| Build fails on `pdfjs-dist` | Ensure `workerSrc` CDN URL is accessible |

### Debug Commands
```bash
# Check MongoDB connection
npx tsx -e "require('./src/lib/mongodb').default().then(() => console.log('Connected'))"

# Verify NextAuth config
npx tsx -e "console.log(require('./src/lib/auth').authOptions)"

# Analyze bundle
ANALYZE=true npm run build
```

---

## 📚 Documentation Links

- [Next.js 16 Docs](https://nextjs.org/docs)
- [NextAuth v4 Docs](https://next-auth.js.org/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Pusher Docs](https://pusher.com/docs)
- [Vercel Deployment](https://vercel.com/docs/concepts/deployments)

---

## 🆘 Support & Maintenance

### Internal Contacts
- **Lead Developer:** Cheeku (SUPERADMIN)
- **Primary Admin:** [Admin User]
- **Odoo Integration:** [Clerk Team]

### Monitoring
- **Vercel Analytics** - Page views, performance
- **Vercel Logs** - Function invocations, errors
- **MongoDB Atlas** - Query performance, connections
- **Pusher Dashboard** - Message throughput, connections

### Backup Strategy
- **MongoDB:** Atlas automated daily backups + point-in-time recovery
- **Vercel:** Git history + preview deployments
- **Environment:** `.env.example` tracked, secrets in Vercel only

---

## 📄 License & Ownership

**Proprietary** - Internal tool for The Window & Door Store.  
Not for external distribution without written permission.

---

*Last Updated: October 26, 2026*  
*Next Review: Before Production Deploy*