import React, { useState } from "react";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Drawer } from "../components/Drawer";
import { Button } from "../components/Button";

export const ControlsTemplate: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const controls = [
    { id: "CTRL-001", title: "Access Control Policy", framework: "APGF-MS", status: "Compliant" },
    { id: "CTRL-002", title: "Data Encryption Standards", framework: "ISO 9001", status: "In Progress" },
    { id: "CTRL-003", title: "Incident Response Plan", framework: "APGF-MS", status: "Compliant" }
  ];

  const columns = [
    { key: "id" as const, header: "Control ID" },
    { key: "title" as const, header: "Title" },
    { key: "framework" as const, header: "Framework" },
    { 
      key: "status" as const, 
      header: "Status",
      render: (value: string) => (
        <Badge variant={value === "Compliant" ? "success" : "warning"}>
          {value}
        </Badge>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Controls Management</h1>
        <Button onClick={() => setDrawerOpen(true)}>Add Control</Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input placeholder="Search controls..." />
          <Select 
            label=""
            options={[
              { value: "all", label: "All Frameworks" },
              { value: "apgf", label: "APGF-MS" },
              { value: "iso", label: "ISO 9001" }
            ]} 
          />
          <Select 
            label=""
            options={[
              { value: "all", label: "All Status" },
              { value: "compliant", label: "Compliant" },
              { value: "progress", label: "In Progress" }
            ]} 
          />
        </div>
        <Table data={controls} columns={columns} />
      </Card>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Control Details">
        <p className="text-muted">Control details and evidence would appear here.</p>
      </Drawer>
    </div>
  );
};
