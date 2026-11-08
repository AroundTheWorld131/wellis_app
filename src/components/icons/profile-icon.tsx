import Svg, { Circle, G, Path, type SvgProps } from 'react-native-svg';

type IconProps = Omit<SvgProps, 'strokeWidth'> & {
  size?: number;
  color?: string;
  /** Line weight, on the 24-unit grid. */
  strokeWidth?: number;
};

// Person inside a circle, used for the Profile tab. Drawn with lines (not filled shapes) so
// the weight can be set: an outer circle, a round head and curved shoulders.
export function ProfileIcon({ size = 24, color = '#262626', strokeWidth = 1.9, ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <G fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={12} cy={12} r={9} />
        <Circle cx={12} cy={10} r={3} />
        <Path d="M6.6 18.6C7.5 16.9 9.2 16 11 16h2c1.8 0 3.5.9 4.4 2.6" />
      </G>
    </Svg>
  );
}
