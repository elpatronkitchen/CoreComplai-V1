import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Button } from "./Button";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: <p>This is a basic card with some content.</p>,
  },
};

export const WithTitle: Story = {
  args: {
    title: "Card Title",
    children: <p>This card has a title and content.</p>,
  },
};

export const WithActions: Story = {
  args: {
    title: "Actions Card",
    children: (
      <div>
        <p className="mb-4">This card includes action buttons.</p>
        <div className="flex gap-2">
          <Button size="sm">Approve</Button>
          <Button size="sm" variant="secondary">Reject</Button>
        </div>
      </div>
    ),
  },
};

export const Complex: Story = {
  args: {
    title: "Compliance Summary",
    children: (
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted">Total Controls:</span>
          <span className="font-semibold">247</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Compliance Rate:</span>
          <span className="font-semibold text-green-600">94%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-accent h-2 rounded-full" style={{ width: "94%" }} />
        </div>
      </div>
    ),
  },
};
