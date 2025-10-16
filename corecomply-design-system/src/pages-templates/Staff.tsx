import React from "react";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { Tabs } from "../components/Tabs";

export const StaffTemplate: React.FC = () => {
  const staff = [
    { id: 1, name: "Sarah Johnson", role: "Compliance Manager", department: "Compliance", status: "Active" },
    { id: 2, name: "Michael Chen", role: "HR Officer", department: "Human Resources", status: "Active" },
    { id: 3, name: "Emma Wilson", role: "Payroll Officer", department: "Finance", status: "Active" }
  ];

  const columns = [
    { key: "name" as const, header: "Name" },
    { key: "role" as const, header: "Role" },
    { key: "department" as const, header: "Department" },
    { 
      key: "status" as const, 
      header: "Status",
      render: (value: string | number) => <Badge variant="success">{String(value)}</Badge>
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Staff Management</h1>

      <Tabs
        tabs={[
          {
            id: "directory",
            label: "Staff Directory",
            content: (
              <Card>
                <Table data={staff} columns={columns} />
              </Card>
            )
          },
          {
            id: "payroll",
            label: "Timesheets ↔ Payslips",
            content: (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Timesheets">
                  <div className="space-y-3">
                    {staff.map((person) => (
                      <div key={person.id} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{person.name}</p>
                          <p className="text-sm text-muted">{person.role}</p>
                        </div>
                        <Badge variant="success">40 hrs</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Payslips">
                  <div className="space-y-3">
                    {staff.map((person) => (
                      <div key={person.id} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{person.name}</p>
                          <p className="text-sm text-muted">Current Period</p>
                        </div>
                        <Badge variant="info">Processed</Badge>
                      </div>
                    ))}
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
