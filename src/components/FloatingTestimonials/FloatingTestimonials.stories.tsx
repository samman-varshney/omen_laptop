import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import FloatingTestimonials from './FloatingTestimonials';

const meta: Meta<typeof FloatingTestimonials> = {
  title: 'Components/FloatingTestimonials',
  component: FloatingTestimonials,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    speed: 1.0,
    randomness: 1.0,
    spacing: 20,
    circleSize: 70,
    collision: true,
    hasChildren: true,
    wrapAround: false,
    bgColor: '#06070f',
  },
  argTypes: {
    speed: { control: { type: 'range', min: 0.1, max: 3.0, step: 0.1 } },
    randomness: { control: { type: 'range', min: 0.1, max: 2.0, step: 0.1 } },
    spacing: { control: { type: 'range', min: 0, max: 60, step: 4 } },
    circleSize: { control: { type: 'range', min: 40, max: 120, step: 4 } },
    bgColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof FloatingTestimonials>;

export const Default: Story = {
  args: {},
  render: (args) => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FloatingTestimonials {...args} />
    </div>
  ),
};

export const Slow: Story = {
  args: {
    speed: 0.3,
    randomness: 0.4,
  },
  render: (args) => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FloatingTestimonials {...args} />
    </div>
  ),
};

export const Dense: Story = {
  args: {
    speed: 1.4,
    randomness: 1.7,
    spacing: 2,
    circleSize: 54,
    collision: false,
    hasChildren: false,
    wrapAround: true,
    bgColor: '#0a0012',
  },
  render: (args) => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FloatingTestimonials {...args} />
    </div>
  ),
};

export const GhostMode: Story = {
  args: {
    speed: 0.55,
    randomness: 0.9,
    spacing: 0,
    circleSize: 74,
    collision: false,
    hasChildren: true,
    wrapAround: false,
    bgColor: '#0d1622',
  },
  render: (args) => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FloatingTestimonials {...args} />
    </div>
  ),
};

export const Space: Story = {
  args: {
    speed: 0.65,
    randomness: 1.1,
    spacing: 14,
    circleSize: 62,
    collision: true,
    hasChildren: false,
    wrapAround: true,
    bgColor: '#020308',
  },
  render: (args) => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FloatingTestimonials {...args} />
    </div>
  ),
};
export const CustomData: Story = {
  args: {
    data: [
      { name: "John Doe", role: "Developer", initials: "JD", g: ["#FF0000", "#FF7700"], img: "https://i.pravatar.cc/80?img=11", quote: "Highly customizable and easy to integrate!", r: 4 },
      { name: "Jane Smith", role: "Designer", initials: "JS", g: ["#00FF00", "#0077FF"], img: "https://i.pravatar.cc/80?img=13", quote: "The animations are incredibly smooth.", r: 5 },
    ],
    circleSize: 100,
  },
  render: (args) => (
    <div style={{ width: '100vw', height: '100vh' }}>
      <FloatingTestimonials {...args} />
    </div>
  ),
};
