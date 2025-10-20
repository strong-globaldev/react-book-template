import type { Meta, StoryObj } from "@storybook/react";
import {
  AudioIcon,
  AutoPlayIcon,
  CloseIcon,
  ExitFullScreenIcon,
  FileTextIcon,
  FullScreenIcon,
  HomeIcon,
  LeftIcon,
  LightBulbIcon,
  PuzzleIcon,
  RecordingIcon,
  SettingsIcon,
  TagIcon,
  TranslateIcon,
  VideoIcon,
} from ".";

const ICONS = [
  { name: "AudioIcon", Component: AudioIcon },
  { name: "AutoPlayIcon", Component: AutoPlayIcon },
  { name: "CloseIcon", Component: CloseIcon },
  { name: "ExitFullScreenIcon", Component: ExitFullScreenIcon },
  { name: "FileTextIcon", Component: FileTextIcon },
  { name: "FullScreenIcon", Component: FullScreenIcon },
  { name: "HomeIcon", Component: HomeIcon },
  { name: "LeftIcon", Component: LeftIcon },
  { name: "LightBulbIcon", Component: LightBulbIcon },
  { name: "PuzzleIcon", Component: PuzzleIcon },
  { name: "RecordingIcon", Component: RecordingIcon },
  { name: "SettingsIcon", Component: SettingsIcon },
  { name: "TagIcon", Component: TagIcon },
  { name: "TranslateIcon", Component: TranslateIcon },
  { name: "VideoIcon", Component: VideoIcon },
];

const meta = {
  title: "Icons/All",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Gallery: Story = {
  render: () => (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 text-white">
      {ICONS.map(({ name, Component }) => (
        <div
          key={name}
          className="flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
        >
          <Component className="h-12 w-12 text-white" />
          <span className="text-sm font-medium text-white/80">{name}</span>
        </div>
      ))}
    </div>
  ),
};
