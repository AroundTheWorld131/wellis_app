import Svg, { G, Path, type SvgProps } from 'react-native-svg';

type IconProps = Omit<SvgProps, 'strokeWidth'> & {
  size?: number;
  color?: string;
  /** Line weight. On the 24-unit grid. */
  strokeWidth?: number;
};

// Outlined speech bubble with three dots, used for the Chat tab. Same pattern as the Balm app's icons.
export function ChatIcon({ size = 24, color = '#262626', strokeWidth = 2.3, ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeWidth={strokeWidth}>
        <Path
          strokeLinejoin="round"
          d="M14 19c3.771 0 5.657 0 6.828-1.172S22 14.771 22 11s0-5.657-1.172-6.828S17.771 3 14 3h-4C6.229 3 4.343 3 3.172 4.172S2 7.229 2 11s0 5.657 1.172 6.828c.653.654 1.528.943 2.828 1.07"
        />
        <Path d="M12 11v.01M8 11v.01m8-.01v.01M14 19c-1.236 0-2.598.5-3.841 1.145c-1.998 1.037-2.997 1.556-3.489 1.225s-.399-1.355-.212-3.404L6.5 17.5" />
      </G>
    </Svg>
  );
}
