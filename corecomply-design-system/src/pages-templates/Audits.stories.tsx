import type { Meta, StoryObj } from "@storybook/react";
import { AuditsTemplate } from "./Audits";

const meta: Meta<typeof AuditsTemplate> = {
  title: "Page Templates/Audits",
  component: AuditsTemplate,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AuditsTemplate>;

export const Default: Story = {};
