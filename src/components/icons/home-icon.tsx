import Svg, { G, Path, type SvgProps } from 'react-native-svg';

type IconProps = Omit<SvgProps, 'strokeWidth'> & {
  size?: number;
  color?: string;
  /** Line weight, on the 24-unit grid. */
  strokeWidth?: number;
};

// Rounded house with a steep roof and a door line.
const OUTLINE =
  'M12 20L6.6 20A2.6 2.6 0 0 1 4 17.4L4 11.72A3 3 0 0 1 4.85 9.63L10.21 4.1A2.5 2.5 0 0 1 13.79 4.1L19.15 9.63A3 3 0 0 1 20 11.72L20 17.4A2.6 2.6 0 0 1 17.4 20L12 20Z';
// Ends inside the floor line so its round cap never pokes out below the house.
const DOOR = 'M12 16V19';

// Outlined house, used for the Home tab.
export function HomeIcon({ size = 24, color = '#262626', strokeWidth = 2, ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <G fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <Path d={OUTLINE} />
        <Path d={DOOR} />
      </G>
    </Svg>
  );
}
