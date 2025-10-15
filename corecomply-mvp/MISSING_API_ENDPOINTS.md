# Missing .NET API Endpoints - Comprehensive Analysis

## Current Status

### ✅ Existing Controllers
- **FrameworksController** - `/api/frameworks`
- **ControlsController** - `/api/controls`
- **PoliciesController** - `/api/policies`
- **AuditsController** - `/api/audits`
- **EvidenceController** - `/api/evidence`

---

## ❌ Critical Missing Controllers (Phase 1 - Required for MVP)

### 1. **NotificationsController** (`/api/notifications`)
**Used by:** NotificationDropdown, Dashboard, All pages
**Required endpoints:**
- `GET /api/notifications` - List all notifications for current user
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/clear-all` - Clear all notifications
- `POST /api/notifications` - Create notification (system use)

**Complete Model:**
```csharp
public class Notification {
    public string Id { get; set; }
    public string Title { get; set; }
    public string? Message { get; set; }
    public NotificationType Type { get; set; } // success, error, warning, info
    public DateTime Timestamp { get; set; }
    public bool Read { get; set; }
    public string UserId { get; set; }
    public NotificationMetadata? Metadata { get; set; }
}

public class NotificationMetadata {
    public string? TaskId { get; set; }
    public string? AuditId { get; set; }
    public string? ControlId { get; set; }
    public DateTime? DueDate { get; set; }
    public string? ActionUrl { get; set; }
}
```

---

### 2. **TasksController** (`/api/tasks`)
**Used by:** CalendarPage, Dashboard, Task assignment features
**Required endpoints:**
- `GET /api/tasks` - List all tasks (with filtering by assignee, status, date range, type)
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PUT /api/tasks/{id}/complete` - Mark task as completed
- `GET /api/tasks/calendar` - Get tasks for calendar view

**Complete Model:**
```csharp
public class Task {
    public string Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public TaskType Type { get; set; } // payroll, compliance, evidence, audit, general
    public TaskPriority Priority { get; set; } // low, medium, high, critical
    public TaskStatus Status { get; set; } // pending, in_progress, completed, overdue
    public string? Assignee { get; set; }
    public string? AssignedBy { get; set; }
    public TaskCategory Category { get; set; } // pre_payroll, post_payroll, monthly, quarterly, annual, ongoing
    public TaskRecurring? Recurring { get; set; }
    public TaskSource? Source { get; set; } // fair_work, ato, internal, compliance
    public TaskMetadata? Metadata { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class TaskRecurring {
    public RecurringFrequency Frequency { get; set; } // weekly, monthly, quarterly, annual
    public DateTime? NextDue { get; set; }
}

public class TaskMetadata {
    public string? PayrollCycle { get; set; }
    public string? AwardType { get; set; }
    public string? SubmissionType { get; set; }
    public decimal? Amount { get; set; }
}
```

---

### 3. **DashboardController** (`/api/dashboard`)
**Used by:** DashboardPage
**Required endpoints:**
- `GET /api/dashboard/stats` - Get high-level statistics
- `GET /api/dashboard/recent-activity` - Get recent activity feed
- `GET /api/dashboard/compliance-score` - Get overall compliance score
- `GET /api/dashboard/upcoming-tasks` - Get upcoming tasks summary
- `GET /api/dashboard/alerts` - Get critical alerts

**Complete Model:**
```csharp
public class DashboardStats {
    public int TotalFrameworks { get; set; }
    public int TotalControls { get; set; }
    public int TotalPolicies { get; set; }
    public int TotalAudits { get; set; }
    public int ActiveTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int OpenFindings { get; set; }
    public decimal ComplianceScore { get; set; }
}

public class DashboardActivity {
    public string Id { get; set; }
    public string Type { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime Timestamp { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
}
```

---

### 4. **FindingsController** (`/api/findings`)
**Used by:** AuditManager, PayrollAuditPage
**Required endpoints:**
- `GET /api/findings` - List all findings (with filtering)
- `GET /api/findings/{id}` - Get finding by ID
- `POST /api/findings` - Create finding
- `PUT /api/findings/{id}` - Update finding
- `DELETE /api/findings/{id}` - Delete finding
- `PUT /api/findings/{id}/status` - Update finding status
- `POST /api/findings/{id}/evidence` - Add evidence to finding

**Complete Model:**
```csharp
public class Finding {
    public string Id { get; set; }
    public string AuditSessionId { get; set; }
    public string ControlId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public FindingSeverity Severity { get; set; } // Critical, High, Medium, Low, Info
    public FindingStatus Status { get; set; } // open, in_progress, resolved
    public string Assignee { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public List<string> Evidence { get; set; }
    public string? Resolution { get; set; }
    public string CreatedBy { get; set; }
}
```

---

### 5. **PayrollAuditController** (`/api/payroll-audit`)
**Used by:** PayrollAuditPage
**Required endpoints:**
- `GET /api/payroll-audit/kpis` - Get payroll audit KPIs
- `GET /api/payroll-audit/sessions` - List audit sessions
- `POST /api/payroll-audit/sessions` - Start new audit session
- `GET /api/payroll-audit/sessions/{id}` - Get session details
- `GET /api/payroll-audit/integration-health` - Get integration status
- `GET /api/payroll-audit/payrun-validations` - Get payrun validations
- `GET /api/payroll-audit/employee-variances` - Get employee variances
- `POST /api/payroll-audit/export` - Export audit data

**Complete Model:**
```csharp
public class PayrollAuditKPIs {
    public int TotalExceptions { get; set; }
    public decimal VarianceAmount { get; set; }
    public int EmployeesAffected { get; set; }
    public double SuccessRate { get; set; }
    public DateTime LastSyncTime { get; set; }
}

public class AuditSession {
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public AuditType Type { get; set; } // internal, external
    public AuditStatus Status { get; set; } // draft, scheduled, in_progress, completed
    public string Auditor { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<string> Scope { get; set; }
    public List<string> Findings { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
}

public class IntegrationHealth {
    public IntegrationSource PayrollSource { get; set; }
    public IntegrationSource TaaSource { get; set; }
}

public class IntegrationSource {
    public string Name { get; set; }
    public IntegrationStatus Status { get; set; } // Connected, Auth Required, Error
    public DateTime? LastSync { get; set; }
}
```

---

## ❌ Medium Priority Controllers (Phase 2)

### 6. **PeopleController** (`/api/people`)
**Used by:** PeoplePage
**Required endpoints:**
- `GET /api/people` - List all people/staff
- `GET /api/people/{id}` - Get person by ID
- `POST /api/people` - Create person
- `PUT /api/people/{id}` - Update person
- `DELETE /api/people/{id}` - Delete person
- `GET /api/people/departments` - Get all departments

**Complete Model:**
```csharp
public class Person {
    public string Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string? Phone { get; set; }
    public string? JobTitle { get; set; }
    public string Role { get; set; }
    public string Department { get; set; }
    public PersonStatus Status { get; set; } // Active, Inactive, OnLeave
    public DateTime? StartDate { get; set; }
    public DateTime? LastLogin { get; set; }
    public string? AvatarUrl { get; set; }
}
```

---

### 7. **AdminController** (`/api/admin`)
**Used by:** AdminPage
**Required endpoints:**
- `GET /api/admin/users` - List all users (with pagination, filtering)
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `PUT /api/admin/users/{id}/role` - Update user role
- `GET /api/admin/access-logs` - Get access logs
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

**Complete Model:**
```csharp
public class AdminUser {
    public string Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Role { get; set; }
    public UserStatus Status { get; set; } // Active, Inactive, Locked
    public DateTime? LastLogin { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; }
}

public class AccessLog {
    public string Id { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Action { get; set; }
    public DateTime Timestamp { get; set; }
    public string IPAddress { get; set; }
    public string? Details { get; set; }
}

public class SystemSettings {
    public string Key { get; set; }
    public string Value { get; set; }
    public string Type { get; set; } // string, number, boolean, json
    public string Category { get; set; }
    public string? Description { get; set; }
}
```

---

### 8. **ReportsController** (`/api/reports`)
**Used by:** ReportsPage
**Required endpoints:**
- `GET /api/reports` - List all reports
- `GET /api/reports/{id}` - Get report by ID
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/{id}/export` - Export report (PDF/Excel)
- `GET /api/reports/templates` - Get available report templates
- `PUT /api/reports/{id}/schedule` - Schedule report

**Complete Model:**
```csharp
public class Report {
    public string Id { get; set; }
    public string Name { get; set; }
    public ReportType Type { get; set; } // compliance, gap_analysis, audit, risk, executive
    public string Description { get; set; }
    public DateTime? LastGenerated { get; set; }
    public ReportStatus Status { get; set; } // ready, generating, scheduled, failed
    public string? Schedule { get; set; } // cron expression
    public string? Framework { get; set; }
    public ReportFormat Format { get; set; } // pdf, excel, csv
    public string CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public ReportParameters? Parameters { get; set; }
}

public class ReportParameters {
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<string>? FrameworkIds { get; set; }
    public List<string>? ControlIds { get; set; }
    public string? Scope { get; set; }
}
```

---

## ❌ Lower Priority Controllers (Phase 3)

### 9. **RisksController** (`/api/risks`)
**Used by:** RiskRegisterPage
**Required endpoints:**
- `GET /api/risks` - List all risks (with filtering by category)
- `GET /api/risks/{id}` - Get risk by ID
- `POST /api/risks` - Create risk
- `PUT /api/risks/{id}` - Update risk
- `DELETE /api/risks/{id}` - Delete risk
- `GET /api/risks/heat-map` - Get risk heat map data

**Complete Model:**
```csharp
public class Risk {
    public string Id { get; set; }
    public string RiskId { get; set; } // e.g., "PR001", "HR001"
    public string Title { get; set; }
    public string Description { get; set; }
    public RiskCategory Category { get; set; } // Payroll, HR, Finance, Operational, Legal
    public RiskImpact Impact { get; set; } // Critical, High, Medium, Low
    public RiskLikelihood Likelihood { get; set; } // Almost Certain, Likely, Possible, Unlikely, Rare
    public string RiskRating { get; set; } // High, Medium-High, Medium, Low
    public string Owner { get; set; }
    public string AssignedTo { get; set; }
    public RiskStatus Status { get; set; } // Open, In Progress, Mitigated, Closed
    public List<string> MitigationStrategies { get; set; }
    public List<string> ControlMeasures { get; set; }
    public DateTime ReviewDate { get; set; }
    public string? Notes { get; set; }
    public string RegisterType { get; set; } // Payroll, HR, Finance
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; }
    public string LastUpdatedBy { get; set; }
}
```

---

### 10. **AssetsController** (`/api/assets`)
**Used by:** AssetsPage (Employee Records Management)
**Required endpoints:**
- `GET /api/assets/employee-records` - List all employee records
- `GET /api/assets/employee-records/{id}` - Get employee record by ID
- `POST /api/assets/employee-records` - Create employee record
- `PUT /api/assets/employee-records/{id}` - Update employee record
- `DELETE /api/assets/employee-records/{id}` - Delete employee record
- `GET /api/assets/employee-records/{id}/documents` - Get documents for employee

**Complete Model:**
```csharp
public class EmployeeRecord {
    public string Id { get; set; }
    public string Name { get; set; }
    public string EmployeeId { get; set; }
    public string Department { get; set; }
    public RecordStatus Status { get; set; } // Active, Inactive, Archived
    public DateTime StartDate { get; set; }
    public DateTime RetentionDate { get; set; }
    public List<string> RecordTypes { get; set; } // Contract, TFN Declaration, Super Choice, etc
    public int ComplianceScore { get; set; }
    public DateTime? LastAudit { get; set; }
    public string Location { get; set; } // NSW, VIC, QLD, etc
}
```

---

### 11. **IntegrationsController** (`/api/integrations`)
**Used by:** IntegrationsPage
**Required endpoints:**
- `GET /api/integrations` - List all integrations
- `GET /api/integrations/{id}` - Get integration by ID
- `POST /api/integrations/{id}/connect` - Connect integration
- `DELETE /api/integrations/{id}/disconnect` - Disconnect integration
- `GET /api/integrations/{id}/status` - Get integration status
- `POST /api/integrations/{id}/sync` - Trigger manual sync
- `GET /api/integrations/{id}/logs` - Get integration sync logs

**Complete Model:**
```csharp
public class Integration {
    public string Id { get; set; }
    public string Name { get; set; }
    public IntegrationType Type { get; set; } // Payroll, TimeAttendance, HRSystem, FinancialSystem
    public IntegrationStatus Status { get; set; } // Connected, Disconnected, Error, Syncing
    public DateTime? LastSync { get; set; }
    public DateTime? NextSync { get; set; }
    public IntegrationConfig Configuration { get; set; }
    public string? ErrorMessage { get; set; }
}

public class IntegrationConfig {
    public string? ApiKey { get; set; }
    public string? ApiUrl { get; set; }
    public string? TenantId { get; set; }
    public Dictionary<string, string>? Settings { get; set; }
}
```

---

### 12. **SupportController** (`/api/support`)
**Used by:** SupportPage
**Required endpoints:**
- `GET /api/support/tickets` - List support tickets
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets/{id}` - Get ticket by ID
- `POST /api/support/tickets/{id}/reply` - Reply to ticket
- `PUT /api/support/tickets/{id}/status` - Update ticket status
- `PUT /api/support/tickets/{id}/close` - Close ticket

**Complete Model:**
```csharp
public class SupportTicket {
    public string Id { get; set; }
    public string Subject { get; set; }
    public string Description { get; set; }
    public TicketStatus Status { get; set; } // Open, In Progress, Waiting, Resolved, Closed
    public TicketPriority Priority { get; set; } // Low, Normal, High, Urgent
    public string CreatedBy { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? ResolvedDate { get; set; }
    public List<TicketReply> Replies { get; set; }
}

public class TicketReply {
    public string Id { get; set; }
    public string TicketId { get; set; }
    public string Message { get; set; }
    public string CreatedBy { get; set; }
    public DateTime CreatedDate { get; set; }
    public bool IsStaffReply { get; set; }
}
```

---

### 13. **CompanyController** (`/api/company`)
**Used by:** CompanyProfilePage
**Required endpoints:**
- `GET /api/company/profile` - Get company profile
- `PUT /api/company/profile` - Update company profile
- `GET /api/company/settings` - Get company settings
- `PUT /api/company/settings` - Update company settings
- `POST /api/company/logo` - Upload company logo

**Complete Model:**
```csharp
public class CompanyProfile {
    public string Id { get; set; }
    public string Name { get; set; }
    public string? Industry { get; set; }
    public string? Size { get; set; } // Small, Medium, Large, Enterprise
    public CompanyAddress? Address { get; set; }
    public CompanyContact? ContactInfo { get; set; }
    public string? LogoUrl { get; set; }
    public string? ABN { get; set; }
    public string? ACN { get; set; }
}

public class CompanyAddress {
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? PostCode { get; set; }
    public string? Country { get; set; }
}

public class CompanyContact {
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Website { get; set; }
}
```

---

### 14. **OnboardingController** (`/api/onboarding`)
**Used by:** OnboardingPage
**Required endpoints:**
- `GET /api/onboarding/status` - Get onboarding status
- `POST /api/onboarding/select-framework` - Select active framework
- `GET /api/onboarding/next-steps` - Get next onboarding steps

**Complete Model:**
```csharp
public class OnboardingStatus {
    public bool IsComplete { get; set; }
    public string? ActiveFrameworkId { get; set; }
    public List<OnboardingStep> CompletedSteps { get; set; }
    public List<OnboardingStep> RemainingSteps { get; set; }
}

public class OnboardingStep {
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public bool IsComplete { get; set; }
    public int Order { get; set; }
}
```

---

## Implementation Roadmap (CORRECTED)

### Phase 1 (High Priority - Core MVP Functionality)
**Must be implemented first:**
1. **DashboardController** - Required for main landing page
2. **NotificationsController** - Critical for user feedback system
3. **TasksController** - Core functionality for compliance workflows
4. **FindingsController** - Essential for audit workflows
5. **PeopleController** - Required before Admin (user management)
6. **AdminController** - Depends on People, required for user administration

### Phase 2 (Medium Priority - Enhanced Functionality)
**Depends on Phase 1:**
7. **PayrollAuditController** - Advanced payroll features
8. **OnboardingController** - First-time user experience
9. **ReportsController** - Analytics and reporting (depends on all above data)

### Phase 3 (Lower Priority - Additional Features)
**Nice to have:**
10. **RisksController** - Risk management
11. **AssetsController** - Asset/record management
12. **IntegrationsController** - Third-party integrations
13. **SupportController** - Help desk functionality
14. **CompanyController** - Company profile management

---

## Cross-Cutting Concerns

### Authentication & Authorization
- All endpoints require Azure AD B2C Bearer token
- Role-based access control (RBAC) at controller/action level
- Claim-based permissions (extension_Role claim)

### Data Patterns
- **Pagination**: Use `PagedResult<T>` for list endpoints
- **Filtering**: Support OData-style filtering where applicable
- **Sorting**: Support multiple sort fields
- **Search**: Full-text search on major entities

### Error Handling
- Standardized error responses with proper HTTP status codes
- ProblemDetails format for errors
- Comprehensive validation with FluentValidation

### Performance
- Response caching where appropriate
- ETag support for concurrency control
- Async/await throughout
- Database indexing on common query fields

---

## Notes for .NET Implementation

1. **Entity Framework Core**: Use Code First with migrations
2. **Swagger/OpenAPI**: Full API documentation
3. **Logging**: Application Insights integration
4. **Validation**: FluentValidation for request validation
5. **Mapping**: AutoMapper for DTO transformations
6. **Testing**: Unit tests for controllers, integration tests for flows
