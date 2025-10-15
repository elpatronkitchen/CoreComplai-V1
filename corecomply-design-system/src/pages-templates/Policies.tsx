import React from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Tabs } from "../components/Tabs";

export const PoliciesTemplate: React.FC = () => {
  const templates = [
    { id: 1, title: "Privacy Policy", category: "Data Protection", status: "Published" },
    { id: 2, title: "Code of Conduct", category: "HR", status: "Draft" },
    { id: 3, title: "Information Security", category: "IT Security", status: "Published" }
  ];

  const publishSteps = [
    { step: 1, title: "Draft Policy", status: "completed" },
    { step: 2, title: "Internal Review", status: "completed" },
    { step: 3, title: "Stakeholder Approval", status: "current" },
    { step: 4, title: "Publish & Distribute", status: "pending" }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Policies</h1>
        <Button>Create New Policy</Button>
      </div>

      <Tabs
        tabs={[
          {
            id: "templates",
            label: "Policy Templates",
            content: (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} title={template.title}>
                    <p className="text-sm text-muted mb-2">{template.category}</p>
                    <Badge variant={template.status === "Published" ? "success" : "warning"}>
                      {template.status}
                    </Badge>
                  </Card>
                ))}
              </div>
            )
          },
          {
            id: "workflow",
            label: "Publishing Workflow",
            content: (
              <Card>
                <div className="space-y-4">
                  {publishSteps.map((step) => (
                    <div key={step.step} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500 text-white' : 
                        step.status === 'current' ? 'bg-primary text-white' : 'bg-gray-200'
                      }`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.title}</p>
                        <p className="text-sm text-muted capitalize">{step.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          }
        ]}
      />
    </div>
  );
};
