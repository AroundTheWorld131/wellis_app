import Svg, { Path, type SvgProps } from 'react-native-svg';

type IconProps = Omit<SvgProps, 'strokeWidth'> & {
  size?: number;
  color?: string;
  /** Line weight. Outline added around the filled shape, on the 24-unit grid. */
  strokeWidth?: number;
};

// Outlined house, used for the Home tab. Same pattern as the Balm app's icons.
export function HomeIcon({ size = 24, color = '#262626', strokeWidth = 0, ...props }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <Path
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.033 2.883a3 3 0 0 1 3.934 0l7 6.076A3 3 0 0 1 22 11.225V19a3 3 0 0 1-3 3h-3.5a1.5 1.5 0 0 1-1.5-1.5v-6.813h-4V20.5A1.5 1.5 0 0 1 8.5 22H5a3 3 0 0 1-3-3v-7.775a3 3 0 0 1 1.033-2.266zm2.623 1.51a1 1 0 0 0-1.312 0l-7 6.077a1 1 0 0 0-.344.755V19a1 1 0 0 0 1 1h3v-6.313a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V20h3a1 1 0 0 0 1-1v-7.775a1 1 0 0 0-.345-.755z"
      />
    </Svg>
  );
}
