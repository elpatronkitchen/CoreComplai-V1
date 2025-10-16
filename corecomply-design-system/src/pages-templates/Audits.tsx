import React from "react";
import { Card } from "../components/Card";
import { Alert } from "../components/Alert";
import { Tabs } from "../components/Tabs";
import { Badge } from "../components/Badge";

export const AuditsTemplate: React.FC = () => {
  const frameworkAudit = {
    name: "Annual Framework Audit 2025",
    date: "15 Dec 2025",
    auditor: "External Compliance Team",
    status: "Scheduled"
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audits</h1>

      <Tabs
        tabs={[
          {
            id: "framework",
            label: "Framework Audit",
            content: (
              <div className="space-y-4">
                <Card title="Upcoming Audit">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted">Audit Name:</span>
                      <span className="font-medium">{frameworkAudit.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Scheduled Date:</span>
                      <span className="font-medium">{frameworkAudit.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Auditor:</span>
                      <span className="font-medium">{frameworkAudit.auditor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Status:</span>
                      <Badge variant="warning">{frameworkAudit.status}</Badge>
                    </div>
                  </div>
                </Card>
              </div>
            )
          },
          {
            id: "payroll",
            label: "Payroll Audit",
            content: (
              <div className="space-y-4">
                <Alert variant="info" title="Coming Soon">
                  <p className="text-sm">
                    An intelligent AI-based payroll audit tool is in development.
                  </p>
                </Alert>
                <Card>
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Payroll Audit Intelligence</h3>
                    <p className="text-muted max-w-md mx-auto">
                      Our advanced AI system will automatically detect payroll anomalies, 
                      ensure Fair Work compliance, and provide real-time audit insights.
                    </p>
                  </div>
                </Card>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};
