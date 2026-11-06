import Svg, { Circle, G, Path, type SvgProps } from 'react-native-svg';

type IconProps = Omit<SvgProps, 'strokeWidth'> & {
  size?: number;
  color?: string;
  /** Line weight. On the 24-unit grid. */
  strokeWidth?: number;
};

// Compass, used for the Discover tab. Same pattern as the Balm app's icons.
export function DiscoverIcon({ size = 24, color = '#262626', strokeWidth = 2.1, ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <Circle cx={12} cy={12} r={9} />
        <Path d="M11.307 9.739L15 9l-.739 3.693a2 2 0 0 1-1.568 1.569L9 15l.739-3.693a2 2 0 0 1 1.568-1.568" />
      </G>
    </Svg>
  );
}
