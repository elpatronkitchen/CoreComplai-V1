import React from "react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";

export const DashboardTemplate: React.FC = () => {
  const kpis = [
    { title: "Total Controls", value: "247", change: "+12", trend: "up" },
    { title: "Compliance Score", value: "94%", change: "+3%", trend: "up" },
    { title: "Pending Tasks", value: "18", change: "-5", trend: "down" }
  ];

  const activities = [
    { type: "audit", message: "Annual audit scheduled for 15 Dec 2025", time: "2 hours ago" },
    { type: "policy", message: "Privacy Policy v2.1 published", time: "5 hours ago" },
    { type: "evidence", message: "Payroll evidence uploaded by HR team", time: "1 day ago" }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{kpi.title}</p>
                <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                <p className={`text-sm mt-1 ${kpi.trend === 'up' ? 'text-green-600' : 'text-muted'}`}>
                  {kpi.change}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Recent Activity">
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
              <Badge variant={activity.type === 'audit' ? 'warning' : 'success'}>
                {activity.type.toUpperCase()}
              </Badge>
              <div className="flex-1">
                <p className="text-sm text-primary">{activity.message}</p>
                <p className="text-xs text-muted mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
