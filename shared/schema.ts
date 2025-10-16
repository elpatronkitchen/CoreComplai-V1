import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const UserRole = z.enum([
  "system_admin",
  "compliance_owner", 
  "payroll_officer",
  "hr_officer",
  "finance_manager",
  "executive",
  "internal_auditor",
  "external_auditor",
  "reviewer"
]);

// Control status enum
export const ControlStatus = z.enum([
  "Compliant",
  "In Progress", 
  "Evidence Pending",
  "Not Started",
  "Audit Ready"
]);

// Policy status enum
export const PolicyStatus = z.enum([
  "Draft",
  "In Review",
  "Published", 
  "Archived"
]);

// Audit severity enum
export const AuditSeverity = z.enum([
  "Critical",
  "High",
  "Medium", 
  "Low",
  "Info"
]);

// Certification state enum
export const CertificationState = z.enum([
  "Certified",
  "Not Certified",
  "Conditionally Certified"
]);

// Evidence type enum
export const EvidenceType = z.enum([
  "General",
  "HR",
  "Payroll",
  "Finance"
]);

// Risk management enums
export const RiskImpact = z.enum([
  "Critical",
  "High", 
  "Medium",
  "Low"
]);

export const RiskLikelihood = z.enum([
  "Very Likely",
  "Likely",
  "Possible", 
  "Unlikely",
  "Very Unlikely"
]);

export const RiskStatus = z.enum([
  "Open",
  "In Progress",
  "Mitigated", 
  "Closed",
  "Under Review"
]);

export const RiskCategory = z.enum([
  "Operational",
  "Financial",
  "Compliance",
  "Strategic",
  "Reputational",
  "Technology",
  "Human Resources",
  "Legal"
]);

export const RiskRegisterType = z.enum([
  "Payroll",
  "HR",
  "Finance",
  "IT",
  "Operations",
  "Compliance"
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").$type<z.infer<typeof UserRole>>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Controls table
export const controls = pgTable("controls", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  owner: text("owner").notNull(),
  status: text("status").$type<z.infer<typeof ControlStatus>>().notNull(),
  policyId: text("policy_id"),
  updatedAt: timestamp("updated_at").defaultNow(),
  checklist: jsonb("checklist").$type<string[]>().default([]),
});

// Policies table
export const policies = pgTable("policies", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  owner: text("owner").notNull(),
  status: text("status").$type<z.infer<typeof PolicyStatus>>().notNull(),
  version: text("version").notNull().default("1.0"),
  effectiveFrom: timestamp("effective_from").defaultNow(),
  supersedesId: text("supersedes_id"),
  tags: jsonb("tags").$type<string[]>().default([]),
  frameworkId: text("framework_id").notNull().default("apgf-ms"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Evidence table
export const evidence = pgTable("evidence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  controlId: text("control_id").notNull(),
  filename: text("filename").notNull(),
  type: text("type").$type<z.infer<typeof EvidenceType>>().notNull(),
  description: text("description"),
  period: text("period"),
  tags: jsonb("tags").$type<string[]>().default([]),
  hash: text("hash").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Audit sessions table
export const auditSessions = pgTable("audit_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "internal" or "external"
  auditor: text("auditor").notNull(),
  status: text("status").notNull(), // "open", "closed"
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

// Audit findings table
export const auditFindings = pgTable("audit_findings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  controlId: text("control_id").notNull(),
  severity: text("severity").$type<z.infer<typeof AuditSeverity>>().notNull(),
  category: text("category").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// External certifications table
export const certifications = pgTable("certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  controlId: text("control_id").notNull(),
  state: text("state").$type<z.infer<typeof CertificationState>>().notNull(),
  note: text("note"),
  auditor: text("auditor").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Access logs table
export const accessLogs = pgTable("access_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(), // "policy", "control", "evidence", "audit", "framework"
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(), // "create", "read", "update", "delete", "download"
  actor: text("actor").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertControlSchema = createInsertSchema(controls).omit({ updatedAt: true });
export const insertPolicySchema = createInsertSchema(policies).omit({ createdAt: true });
export const insertEvidenceSchema = createInsertSchema(evidence).omit({ id: true, uploadedAt: true });
export const insertAuditSessionSchema = createInsertSchema(auditSessions).omit({ id: true, createdAt: true, closedAt: true });
export const insertAuditFindingSchema = createInsertSchema(auditFindings).omit({ id: true, createdAt: true });
export const insertCertificationSchema = createInsertSchema(certifications).omit({ id: true, createdAt: true });
export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({ id: true, timestamp: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Control = typeof controls.$inferSelect;
export type InsertControl = z.infer<typeof insertControlSchema>;
export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;
export type AuditSession = typeof auditSessions.$inferSelect;
export type InsertAuditSession = z.infer<typeof insertAuditSessionSchema>;
export type AuditFinding = typeof auditFindings.$inferSelect;
export type InsertAuditFinding = z.infer<typeof insertAuditFindingSchema>;
export type Certification = typeof certifications.$inferSelect;
export type InsertCertification = z.infer<typeof insertCertificationSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;
export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;

// Additional types for app state
export type Framework = {
  id: string;
  name: string;
  description: string;
  version: string;
};

export type DashboardData = {
  compliancePercent: number;
  statusBreakdown: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    actor: string;
  }>;
  deadlines: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: string;
    priority: "high" | "medium" | "low";
  }>;
};

// Risk Register schemas
const riskEntryBaseSchema = z.object({
  riskId: z.string().min(1, 'Risk ID is required'),
  title: z.string().min(1, 'Risk title is required'),
  description: z.string().min(1, 'Risk description is required'),
  category: RiskCategory,
  impact: RiskImpact,
  likelihood: RiskLikelihood,
  riskRating: z.string(), // Calculated from impact × likelihood
  owner: z.string().min(1, 'Risk owner is required'),
  assignedTo: z.string().optional(),
  status: RiskStatus,
  mitigationStrategies: z.array(z.string()),
  controlMeasures: z.array(z.string()),
  reviewDate: z.string().optional(),
  notes: z.string().optional(),
  registerType: RiskRegisterType
});

export const insertRiskEntrySchema = riskEntryBaseSchema;
export type InsertRiskEntry = z.infer<typeof insertRiskEntrySchema>;

export type RiskEntry = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
} & InsertRiskEntry;

const riskRegisterBaseSchema = z.object({
  name: z.string().min(1, 'Register name is required'),
  description: z.string().optional(),
  type: RiskRegisterType,
  owner: z.string().min(1, 'Register owner is required'),
  reviewFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'annually']),
  lastReviewDate: z.string().optional(),
  nextReviewDate: z.string().optional(),
  risks: z.array(z.string()) // Array of risk entry IDs
});

export const insertRiskRegisterSchema = riskRegisterBaseSchema;
export type InsertRiskRegister = z.infer<typeof insertRiskRegisterSchema>;

export type RiskRegister = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
} & InsertRiskRegister;

// Company Profile schemas
const companyProfileBaseSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  tradingName: z.string().optional(),
  abn: z.string().optional(),
  acn: z.string().optional(),
  industry: z.string().min(1, 'Industry is required'),
  businessStructure: z.enum(['sole_trader', 'partnership', 'company', 'trust', 'other']),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    suburb: z.string().min(1, 'Suburb is required'),
    state: z.string().min(1, 'State is required'),
    postcode: z.string().min(1, 'Postcode is required'),
    country: z.string().min(1, 'Country is required')
  }),
  mailingAddress: z.object({
    street: z.string(),
    suburb: z.string(),
    state: z.string(),
    postcode: z.string(),
    country: z.string(),
    sameAsPhysical: z.boolean().optional()
  }).optional(),
  contactDetails: z.object({
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Valid email is required'),
    website: z.string().optional()
  }),
  keyPersonnel: z.object({
    // Executive Level
    ceo: z.string().optional(),
    executive: z.string().optional(),
    operationsDirector: z.string().optional(),
    cro: z.string().optional(), // Chief Risk Officer
    
    // Finance
    cfo: z.string().optional(),
    financeManager: z.string().optional(),
    financeOfficer: z.string().optional(),
    controller: z.string().optional(),
    externalAccountant: z.string().optional(),
    
    // HR & Payroll
    hrManager: z.string().optional(),
    hrOfficer: z.string().optional(),
    hrCoordinator: z.string().optional(),
    payrollManager: z.string().optional(),
    payrollOfficer: z.string().optional(),
    recruitmentSpecialist: z.string().optional(),
    lineManager: z.string().optional(),
    
    // Compliance & Audit
    complianceOwner: z.string().optional(),
    complianceOfficer: z.string().optional(),
    complianceAnalyst: z.string().optional(),
    complianceManager: z.string().optional(), // Added
    internalAuditor: z.string().optional(),
    seniorAuditor: z.string().optional(),
    juniorAuditor: z.string().optional(),
    externalAuditor: z.string().optional(),
    observer: z.string().optional(),
    reviewer: z.string().optional(),
    
    // IT & Security
    systemAdministrator: z.string().optional(),
    itInfoSec: z.string().optional(),
    itSecurityManager: z.string().optional(),
    ciso: z.string().optional(), // Chief Information Security Officer
    
    // Legal & Privacy
    legalIr: z.string().optional(),
    privacyOfficer: z.string().optional(),
    dataProtectionOfficer: z.string().optional(),
    
    // Risk & Business Continuity
    riskManager: z.string().optional(), // Added
    businessContinuityLead: z.string().optional(), // Added
    
    // External/Other
    externalSme: z.string().optional()
  }),
  businessDetails: z.object({
    employeeCount: z.number().min(0, 'Employee count must be 0 or greater'),
    annualTurnover: z.string().optional(),
    operatingStates: z.array(z.string()),
    hasOverseasOperations: z.boolean(),
    primaryActivities: z.array(z.string())
  }),
  regulatoryInfo: z.object({
    licences: z.array(z.object({
      type: z.string(),
      number: z.string(),
      expiryDate: z.string().optional(),
      issuingAuthority: z.string()
    })),
    registrations: z.array(z.object({
      type: z.string(),
      number: z.string(),
      authority: z.string()
    })),
    complianceFrameworks: z.array(z.string())
  }).optional(),
  financialDetails: z.object({
    financialYearEnd: z.string(),
    reportingCurrency: z.enum(['AUD', 'USD', 'EUR', 'GBP', 'other']),
    taxationStatus: z.string()
  }).optional()
});

export const insertCompanyProfileSchema = companyProfileBaseSchema;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;

export type CompanyProfile = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
} & InsertCompanyProfile;

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: {
    taskId?: string;
    taskType?: string;
    dueDate?: string;
    priority?: string;
    assignedBy?: string;
    [key: string]: any;
  };
};

// Classification Audit enums
export const ClassificationStatus = z.enum([
  "pending",
  "proposed",
  "accepted",
  "rejected"
]);

export const TaskStatus = z.enum([
  "open",
  "in_progress",
  "under_review",
  "completed"
]);

export const TaskPriority = z.enum([
  "high",
  "medium",
  "low"
]);

export const AnomalyDetectorType = z.enum([
  "sg_mismatch",
  "stp_recon",
  "payslip_sla"
]);

export const AnomalySeverity = z.enum([
  "high",
  "medium",
  "low"
]);

// Positions table for classification
export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  department: text("department"),
  employmentType: text("employment_type"),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Classifications table
export const classifications = pgTable("classifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  positionId: text("position_id").notNull(),
  classificationCode: text("classification_code").notNull(),
  classificationName: text("classification_name").notNull(),
  confidence: text("confidence").notNull(),
  status: text("status").$type<z.infer<typeof ClassificationStatus>>().notNull().default("pending"),
  snippets: jsonb("snippets").$type<any[]>().default([]),
  vetoes: jsonb("vetoes").$type<any[]>().default([]),
  notes: text("notes"),
  precedentRefs: jsonb("precedent_refs").$type<string[]>().default([]),
  acceptedBy: text("accepted_by"),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit items table
export const auditItems = pgTable("audit_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditId: text("audit_id").notNull(),
  obligationRef: text("obligation_ref").notNull(),
  controlRef: text("control_ref"),
  title: text("title").notNull(),
  description: text("description"),
  evidenceIds: jsonb("evidence_ids").$type<string[]>().default([]),
  status: text("status").notNull().default("needs_review"),
  confidence: text("confidence"),
  autoMatched: text("auto_matched").notNull().default("false"),
  coveragePercent: text("coverage_percent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks table for audit workflows
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  controlRef: text("control_ref").notNull(),
  priority: text("priority").$type<z.infer<typeof TaskPriority>>().notNull(),
  assignee: text("assignee").notNull(),
  approver: text("approver").notNull(),
  watchers: jsonb("watchers").$type<string[]>().default([]),
  sodWarning: text("sod_warning").notNull().default("false"),
  dueDate: timestamp("due_date"),
  status: text("status").$type<z.infer<typeof TaskStatus>>().notNull().default("open"),
  anomalyId: text("anomaly_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Precedents table for ML learning
export const precedents = pgTable("precedents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pattern: jsonb("pattern").$type<Record<string, any>>().notNull(),
  outcome: jsonb("outcome").$type<Record<string, any>>().notNull(),
  reviewerId: text("reviewer_id").notNull(),
  positionType: text("position_type"),
  classificationCode: text("classification_code"),
  confidence: text("confidence"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Anomalies table
export const anomalies = pgTable("anomalies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  detectorType: text("detector_type").$type<z.infer<typeof AnomalyDetectorType>>().notNull(),
  severity: text("severity").$type<z.infer<typeof AnomalySeverity>>().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  reasonCodes: jsonb("reason_codes").$type<string[]>().default([]),
  linkedArtefacts: jsonb("linked_artefacts").$type<any[]>().default([]),
  resolved: text("resolved").notNull().default("false"),
  resolvedBy: text("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  detectedAt: timestamp("detected_at").defaultNow(),
});

// Review metrics table
export const reviewMetrics = pgTable("review_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewerId: text("reviewer_id").notNull(),
  itemId: text("item_id").notNull(),
  itemType: text("item_type").notNull(),
  timeToValidate: text("time_to_validate"),
  firstPassAccepted: text("first_pass_accepted").notNull().default("false"),
  returnCount: text("return_count").notNull().default("0"),
  baselineMinutes: text("baseline_minutes"),
  actualMinutes: text("actual_minutes"),
  hoursAvoided: text("hours_avoided"),
  dollarsSaved: text("dollars_saved"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ROI validation tracking table
export const roiValidations = pgTable("roi_validations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemType: text("item_type").notNull(), // 'classification' | 'audit_item'
  itemId: text("item_id").notNull(),
  reviewerId: text("reviewer_id").notNull(),
  baselineMinutes: integer("baseline_minutes").notNull(), // 30 for classification, 45 for audit item
  actualMinutes: integer("actual_minutes").notNull(),
  hoursAvoided: numeric("hours_avoided", { precision: 10, scale: 2 }).notNull(),
  dollarsSaved: numeric("dollars_saved", { precision: 10, scale: 2 }).notNull(), // Based on AUD$450/hr rate
  validatedAt: timestamp("validated_at").defaultNow(),
});

// Subscription plans enum
export const SubscriptionPlan = z.enum([
  "annual", // $10,000 AUD/year
  "monthly" // $1,000 AUD/month
]);

// Subscription status enum
export const SubscriptionStatus = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid"
]);

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").$type<z.infer<typeof SubscriptionPlan>>().notNull(),
  status: text("status").$type<z.infer<typeof SubscriptionStatus>>().notNull(),
  trialEndsAt: timestamp("trial_ends_at"), // 15 days from signup
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User frameworks table (tracks purchased frameworks)
export const userFrameworks = pgTable("user_frameworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  frameworkId: text("framework_id").notNull(), // 'apgf-ms', 'iso-9001', 'iso-27001'
  stripePaymentId: text("stripe_payment_id"),
  bundlePurchase: integer("bundle_purchase").default(0), // 1 if part of $3k bundle, 0 if individual
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  stripeInvoiceId: text("stripe_invoice_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // in AUD
  currency: text("currency").notNull().default("AUD"),
  status: text("status").notNull(), // 'paid', 'pending', 'failed'
  invoiceUrl: text("invoice_url"), // PDF download link from Stripe
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for new tables
export const insertPositionSchema = createInsertSchema(positions).omit({ id: true, createdAt: true });
export const insertClassificationSchema = createInsertSchema(classifications).omit({ id: true, createdAt: true, acceptedAt: true });
export const insertAuditItemSchema = createInsertSchema(auditItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPrecedentSchema = createInsertSchema(precedents).omit({ id: true, createdAt: true });
export const insertAnomalySchema = createInsertSchema(anomalies).omit({ id: true, detectedAt: true, resolvedAt: true });
export const insertReviewMetricSchema = createInsertSchema(reviewMetrics).omit({ id: true, createdAt: true });

// Billing insert schemas
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserFrameworkSchema = createInsertSchema(userFrameworks).omit({ id: true, purchasedAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });

// ROI validation schema that accepts numbers from API clients and coerces to strings for Drizzle
export const insertROIValidationSchema = z.object({
  itemType: z.string().min(1),
  itemId: z.string().min(1),
  reviewerId: z.string().min(1),
  baselineMinutes: z.number().int().positive(),
  actualMinutes: z.number().int().positive(),
  hoursAvoided: z.number().nonnegative(),
  dollarsSaved: z.number().nonnegative()
}).transform(data => ({
  ...data,
  hoursAvoided: data.hoursAvoided.toFixed(2),
  dollarsSaved: data.dollarsSaved.toFixed(2)
}));

// Types for new tables
export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Classification = typeof classifications.$inferSelect;
export type InsertClassification = z.infer<typeof insertClassificationSchema>;
export type AuditItem = typeof auditItems.$inferSelect;
export type InsertAuditItem = z.infer<typeof insertAuditItemSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Precedent = typeof precedents.$inferSelect;
export type InsertPrecedent = z.infer<typeof insertPrecedentSchema>;
export type Anomaly = typeof anomalies.$inferSelect;
export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;
export type ReviewMetric = typeof reviewMetrics.$inferSelect;
export type InsertReviewMetric = z.infer<typeof insertReviewMetricSchema>;
export type ROIValidation = typeof roiValidations.$inferSelect;
export type InsertROIValidation = z.infer<typeof insertROIValidationSchema>;

// Billing types
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type UserFramework = typeof userFrameworks.$inferSelect;
export type InsertUserFramework = z.infer<typeof insertUserFrameworkSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;