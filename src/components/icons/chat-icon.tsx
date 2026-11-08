import Svg, { G, Path, type SvgProps } from 'react-native-svg';

type IconProps = Omit<SvgProps, 'strokeWidth'> & {
  size?: number;
  color?: string;
  /** Line weight. On the 24-unit grid. */
  strokeWidth?: number;
};

// Two speech bubbles, used for the Chat tab, traced from the reference design: a front bubble with
// a square corner at the bottom right, and a bigger one behind it, drawn only where it isn't hidden.
// The default line weight matches the reference.
export function ChatIcon({ size = 24, color = '#262626', strokeWidth = 1.87, ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <G fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {/* Back bubble: foot and square corner at the bottom left, arc ending before the front one */}
        <Path d="M5.87 16.67H2.88A.5 .5 0 0 1 2.38 16.17V9.55C2.38 5.81 5.84 2.35 9.58 2.35C11.99 2.35 14.29 3.79 15.61 5.81" />
        {/* Front bubble */}
        <Path d="M10.16 15.92C10.16 13.06 13.03 10.19 15.89 10.19C18.75 10.19 21.62 13.06 21.62 15.92V21.15A.5 .5 0 0 1 21.12 21.65H15.89C13.03 21.65 10.16 18.79 10.16 15.92Z" />
      </G>
    </Svg>
  );
}
