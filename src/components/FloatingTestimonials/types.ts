export interface Testimonial {
  name: string;
  role: string;
  initials: string;
  g: [string, string]; // Gradients: [color1, color2]
  img: string;
  quote: string;
  r: number; // Star rating out of 5
}

export interface FloatingTestimonialsProps {
  /** Array of testimonials to display */
  data?: Testimonial[];
  /** Animation speed multiplier. Default: 1.0 */
  speed?: number;
  /** Randomness multiplier. Default: 1.0 */
  randomness?: number;
  /** Minimum spacing between circles. Default: 20 */
  spacing?: number;
  /** Size of each circle in px. Default: 70 */
  circleSize?: number;
  /** Whether circles repel each other. Default: true */
  collision?: boolean;
  /** Show hero slot and repel circles from center. Default: true */
  hasChildren?: boolean;
  /** Exiting one side re-enters opposite instead of bouncing. Default: false */
  wrapAround?: boolean;
  /** Background color. Used for blending edges and tooltip styling. Default: "#06070f" */
  bgColor?: string;
  /** Optional hero content slot */
  children?: React.ReactNode;
}

export interface CircleNode {
  data: Testimonial;
  index: number;
  size: number;
  r: number;
  paused: boolean;
  hovered: boolean;
  el: HTMLDivElement | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  update?(siblings: CircleNode[]): void;
  buildDOM?(): HTMLDivElement;
}
