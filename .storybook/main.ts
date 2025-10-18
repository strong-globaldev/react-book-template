import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: ["@storybook/addon-docs"],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  }
};

export default config;
