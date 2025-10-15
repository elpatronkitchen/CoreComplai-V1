import React from "react";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Tabs } from "../components/Tabs";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Button } from "../components/Button";

export const IntegrationsTemplate: React.FC = () => {
  const connections = [
    { id: 1, name: "Fair Work Commission API", type: "Payroll", status: "Connected" },
    { id: 2, name: "Australian Taxation Office", type: "Tax", status: "Connected" },
    { id: 3, name: "MYOB AccountRight", type: "Accounting", status: "Pending" }
  ];

  const syncLogs = [
    { timestamp: "2025-01-15 09:30", integration: "Fair Work API", status: "Success", records: 247 },
    { timestamp: "2025-01-15 08:00", integration: "ATO API", status: "Success", records: 89 },
    { timestamp: "2025-01-14 16:45", integration: "MYOB", status: "Failed", records: 0 }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>

      <Tabs
        tabs={[
          {
            id: "connections",
            label: "Connections",
            content: (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {connections.map((conn) => (
                  <Card key={conn.id}>
                    <div className="mb-3">
                      <h3 className="font-semibold">{conn.name}</h3>
                      <p className="text-sm text-muted">{conn.type}</p>
                    </div>
                    <Badge variant={conn.status === "Connected" ? "success" : "warning"}>
                      {conn.status}
                    </Badge>
                  </Card>
                ))}
              </div>
            )
          },
          {
            id: "mappings",
            label: "Data Mappings",
            content: (
              <Card>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Source Field" placeholder="external_employee_id" />
                    <Input label="CoreComply Field" placeholder="staff_id" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select 
                      label="Transformation" 
                      options={[
                        { value: "none", label: "None" },
                        { value: "uppercase", label: "Uppercase" },
                        { value: "lowercase", label: "Lowercase" }
                      ]} 
                    />
                    <div className="flex items-end">
                      <Button>Add Mapping</Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          },
          {
            id: "logs",
            label: "Sync Logs",
            content: (
              <Card>
                <div className="space-y-3">
                  {syncLogs.map((log, i) => (
                    <div key={i} className="flex items-center justify-between pb-3 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{log.integration}</p>
                        <p className="text-sm text-muted">{log.timestamp}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted">{log.records} records</span>
                        <Badge variant={log.status === "Success" ? "success" : "error"}>
                          {log.status}
                        </Badge>
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
