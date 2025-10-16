# CoreComply MVP - Next Steps

## ✅ Completed Integration Work

### Phase 1: Infrastructure Setup
- ✅ Updated package.json with all required dependencies (React Router, MSAL, TanStack Query, shadcn/ui, etc.)
- ✅ Configured Azure AD B2C authentication with MSAL
- ✅ Copied complete Tailwind config and CSS design system from prototype
- ✅ Copied all 40+ shadcn UI components to MVP
- ✅ Created UserContext adapter bridging B2C claims to permission system

### Phase 2: Core Integration
- ✅ Copied AppShell, Sidebar, CommandPalette, NotificationDropdown
- ✅ Fixed all Wouter imports to use React Router DOM
- ✅ Created API client adapter with MSAL token injection
- ✅ Copied all utility libraries (permissions, i18n, helpers)
- ✅ Ported all 19 pages from prototype to MVP
- ✅ Configured complete App.tsx with react-router routes and AuthGuard
- ✅ Documented 14 missing .NET API controllers with comprehensive models

---

## 🚨 CRITICAL: Required User Actions

### Step 1: Install NPM Dependencies
**YOU MUST DO THIS FIRST** - Replit Agent cannot run npm install in subdirectories.

```bash
cd corecomply-mvp/web
npm install
```

This will install:
- React Router DOM (routing)
- MSAL React & Browser (Azure AD B2C authentication)
- TanStack React Query (data fetching)
- All Radix UI components (shadcn/ui dependencies)
- Tailwind CSS and plugins
- TypeScript types

**Expected outcome:** LSP errors will reduce from ~79 to ~0 after installation.

---

## 📋 Phase 3: Page Refactoring (TODO)

### Problem Statement
All 19 pages currently use the **prototype's Zustand store** (`useAppStore`) instead of making real API calls to the .NET backend. This was intentional during migration to preserve UI functionality.

### Pages Requiring Refactoring

#### High Priority (Core Functionality)
1. **DashboardPage** (`/`)
   - Replace `useAppStore()` with API calls
   - Fetch stats from `/api/dashboard/stats`
   - Fetch recent activity from `/api/dashboard/recent-activity`
   - Add loading/error states

2. **ControlsPage** (`/controls`)
   - Replace mock data with `/api/controls` API calls
   - Implement create/update/delete mutations
   - Add React Query cache invalidation

3. **PoliciesPage** (`/policies`)
   - Replace mock data with `/api/policies` API calls
   - Implement CRUD operations
   - Add version tracking

4. **AuditsPage** (`/audits`)
   - Replace mock data with `/api/audits` API calls
   - Implement audit session management
   - Wire up findings to `/api/findings` endpoints

5. **FrameworksPage** (`/frameworks`)
   - Replace mock data with `/api/frameworks` API calls
   - Implement CRUD operations
   - Add control association logic

#### Medium Priority
6. **NotificationDropdown** (component)
   - Replace `useAppStore` with `/api/notifications` API calls
   - Implement mark-as-read mutation
   - Add real-time updates (SignalR later)

7. **PayrollAuditPage** (`/payroll-audit`)
   - Replace `usePayrollAuditStore` with API calls
   - Wire to `/api/payroll-audit/*` endpoints
   - Implement KPI fetching, session management

8. **ReportsPage** (`/reports`)
   - Replace mock data with `/api/reports` API calls
   - Implement report generation
   - Add export functionality

9. **RiskRegisterPage** (`/risks`)
   - Replace mock data with `/api/risks` API calls
   - Implement CRUD operations
   - Add heat map visualization

#### Lower Priority
10. **PeoplePage** (`/people`)
11. **AssetsPage** (`/assets`)
12. **IntegrationsPage** (`/integrations`)
13. **AdminPage** (`/admin`)
14. **SupportPage** (`/support`)
15. **CompanyProfilePage** (`/company-profile`)
16. **CalendarPage** (`/calendar`)
17. **OnboardingPage** (`/onboarding`)

### Refactoring Pattern

For each page, follow this pattern:

```tsx
// BEFORE (using Zustand prototype store)
import { useAppStore } from '@/lib/store';

function ControlsPage() {
  const { controls, addControl } = useAppStore();
  // ...
}

// AFTER (using React Query + .NET API)
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Control, InsertControl } from '@shared/types';

function ControlsPage() {
  // Fetch data
  const { data: controls, isLoading } = useQuery<Control[]>({
    queryKey: ['/api/controls']
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: InsertControl) => 
      apiRequest('/api/controls', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/controls'] });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Control> }) =>
      apiRequest(`/api/controls/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/controls'] });
    }
  });

  // Delete mutation  
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/controls/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/controls'] });
    }
  });

  if (isLoading) return <div>Loading...</div>;
  
  return (
    // Use controls data and mutation functions
  );
}
```

### Key Changes Required
1. Remove all `useAppStore()` imports
2. Replace with `useQuery` for data fetching
3. Replace with `useMutation` for create/update/delete
4. Add loading/error states
5. Use React Query cache invalidation
6. Import types from shared schema or define locally
7. Update imports to use `@/lib/queryClient`

---

## 🔧 Backend Development Requirements

### Phase 1 Controllers (Must implement FIRST)
See `MISSING_API_ENDPOINTS.md` for complete specifications.

1. **DashboardController** - Dashboard metrics
2. **NotificationsController** - User notifications
3. **TasksController** - Task management
4. **FindingsController** - Audit findings
5. **PeopleController** - User management
6. **AdminController** - System administration

### Phase 2 Controllers
7. **PayrollAuditController** - Advanced payroll features
8. **OnboardingController** - First-time setup
9. **ReportsController** - Analytics

### Phase 3 Controllers
10-14. Risk, Assets, Integrations, Support, Company

---

## 🐛 Known Issues & TODOs

### Authentication
- [ ] Test B2C login flow end-to-end
- [ ] Verify role claim mapping (extension_Role → system roles)
- [ ] Test permission-based UI rendering
- [ ] Implement token refresh handling

### Routing
- [ ] Test all routes with AuthGuard
- [ ] Verify protected routes redirect to login
- [ ] Test deep linking after authentication
- [ ] Add 404 handling for invalid routes

### Data Flow
- [ ] Remove all Zustand store dependencies from pages
- [ ] Implement proper error boundaries
- [ ] Add global error handling for API failures
- [ ] Implement optimistic updates where appropriate

### UI/UX
- [ ] Replace `useAppStore` dark mode with proper theme provider
- [ ] Fix sidebar active state detection (currently uses Wouter logic)
- [ ] Add loading skeletons for all data fetching
- [ ] Implement toast notifications for mutations

### Type Safety
- [ ] Create shared TypeScript types for all API models
- [ ] Add Zod schemas for API validation
- [ ] Type all React Query hooks properly
- [ ] Remove `any` types from copied components

---

## 📝 Additional Notes

### Current State
- **Frontend**: Fully integrated structure, ready for API connection
- **Backend**: 5 controllers exist, 14 controllers documented but not implemented
- **Authentication**: B2C configured, needs testing
- **Routing**: Complete with AuthGuard protection
- **Design System**: Fully ported from prototype

### What Works Now (Without Backend)
- Login UI (but won't authenticate without backend)
- All page UIs render (using prototype mock data)
- Navigation and routing
- Permission-based UI hiding (using B2C roles)
- Design system and theming

### What Needs Backend
- Actual data CRUD operations
- Authentication/authorization
- Notifications
- Task management
- Audit workflows
- Reporting
- Everything else 😅

---

## 🚀 Getting Started

### For Frontend Developers
1. Run `npm install` in `corecomply-mvp/web/`
2. Start with Dashboard refactoring (template above)
3. Follow the refactoring pattern for each page
4. Remove Zustand dependencies progressively
5. Test with mock backend endpoints or MSW

### For Backend Developers
1. Review `MISSING_API_ENDPOINTS.md`
2. Implement Phase 1 controllers first (Dashboard, Notifications, Tasks, Findings, People, Admin)
3. Follow .NET best practices (Entity Framework, FluentValidation, AutoMapper)
4. Add Swagger documentation for all endpoints
5. Test with Postman or integration tests
6. Once Phase 1 is done, frontend can start connecting

### For Full Stack Integration
1. Backend implements an endpoint
2. Frontend refactors corresponding page
3. Test end-to-end with real auth
4. Fix any type mismatches
5. Add error handling
6. Move to next endpoint

---

## 📚 Reference Documentation

- **API Endpoints**: See `MISSING_API_ENDPOINTS.md`
- **Authentication**: See `ENTRA-ID-SETUP.md` (in Azure infrastructure docs)
- **Deployment**: See `DEPLOYING.md` (in Azure infrastructure docs)
- **Design System**: See `corecomply-design-system/README.md`

---

## ✨ Success Criteria

MVP is complete when:
- [ ] All Phase 1 backend endpoints implemented
- [ ] All pages refactored to use real API calls
- [ ] Azure AD B2C authentication works end-to-end
- [ ] All CRUD operations functional
- [ ] Audit workflows complete
- [ ] User can login and perform core compliance tasks
- [ ] Zero prototype/mock data in production code
