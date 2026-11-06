import Svg, { Path, type SvgProps } from 'react-native-svg';

type IconProps = Omit<SvgProps, 'strokeWidth'> & {
  size?: number;
  color?: string;
  /** Line weight. On the 16-unit grid. */
  strokeWidth?: number;
};

// Downward line chart on an axis, used for the Progress tab. Same pattern as the Balm app's icons.
export function ProgressIcon({ size = 24, color = '#262626', strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" {...props}>
      <Path
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        // The source line trends up; flipped vertically so it trends down, like weight loss.
        d="M4.75 3.25l2.5 4.5 2.5-2.5 3.5 6M1.75 1.75v12.5h12.5"
      />
    </Svg>
  );
}
