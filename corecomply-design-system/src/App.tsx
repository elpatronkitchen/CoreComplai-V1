import React from "react";
import { Card } from "./components/Card";
import { Button } from "./components/Button";

export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-4">CoreComply Design System</h1>
      <Card title="Preview">
        <div className="flex items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </Card>
    </div>
  );
}
