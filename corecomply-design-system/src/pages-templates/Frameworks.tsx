import React from "react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";

export const FrameworksTemplate: React.FC = () => {
  const frameworks = [
    { 
      id: 1, 
      name: "APGF-MS", 
      description: "Australian Payroll Governance Framework - Management System",
      controls: 85,
      compliant: 72,
      progress: 85
    },
    { 
      id: 2, 
      name: "ISO 9001", 
      description: "Quality Management Systems",
      controls: 42,
      compliant: 38,
      progress: 90
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Compliance Frameworks</h1>

      <div className="space-y-6">
        {frameworks.map((framework) => (
          <Card key={framework.id}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{framework.name}</h3>
                <p className="text-sm text-muted mt-1">{framework.description}</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted">Total Controls</p>
                <p className="text-2xl font-bold mt-1">{framework.controls}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Compliant</p>
                <p className="text-2xl font-bold mt-1">{framework.compliant}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Progress</p>
                <p className="text-2xl font-bold mt-1">{framework.progress}%</p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full" 
                style={{ width: `${framework.progress}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
