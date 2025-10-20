import type { Meta, StoryObj } from "@storybook/react";
import QuizHotspot from "./index";

const meta: Meta<typeof QuizHotspot> = {
  title: "Hotspot/QuizHotspot",
  component: QuizHotspot,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
