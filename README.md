# CoreComply Prototype (Archived)

**Status:** ✅ Archived - This is the original React + Express clickable prototype

## What is this?

This folder contains the complete original CoreComply prototype that was built with:
- **Frontend:** React 18 + Vite + TypeScript + Wouter routing
- **Backend:** Express.js + TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **UI:** Radix UI + shadcn/ui + TailwindCSS

## Why is it archived?

This prototype has been preserved as we migrate to the production stack:
- **New Frontend:** Next.js 15 (App Router) → `/apps/web`
- **New Backend:** .NET 8 Web API → `/apps/api`
- **Infrastructure:** Terraform for Azure → `/infrastructure`

## Can I still run the prototype?

Yes! To run this archived prototype:

```bash
cd prototype
npm install
npm run dev
```

The prototype will run on the same port and work exactly as before.

## Features Preserved

All features from the prototype are preserved here:
- ✅ Multi-framework support (APGF-MS, ISO 9001, ISO 27001)
- ✅ Role-based access control (9 personas)
- ✅ Controls management, evidence tracking
- ✅ Audit workflows, policy management
- ✅ Payroll audit, classification coverage
- ✅ ComplAI Buddy floating chat widget
- ✅ Framework-aware assets and reports
- ✅ Get Started Wizard, ISO starter guides
- ✅ Key Personnel, RASCI Matrix
- ✅ ROI tracking and reporting

## Production Migration

The production version is being built in parallel:
- `/apps/web` - Next.js 15 frontend
- `/apps/api` - .NET 8 backend
- `/infrastructure` - Terraform IaC for Azure deployment

See `/replit.md` for full migration documentation.

---

**Archived:** October 4, 2025
**Original Build:** January-October 2025
