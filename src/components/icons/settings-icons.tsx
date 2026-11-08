import type { ReactNode } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export type SettingsIconName =
  | 'weight'
  | 'water'
  | 'steps'
  | 'heart'
  | 'person'
  | 'mail'
  | 'bell'
  | 'globe'
  | 'card'
  | 'ruler'
  | 'calendar'
  | 'chat'
  | 'help'
  | 'document'
  | 'shield'
  | 'logout';

// Thin, rounded outline icons for the Profile rows, in the style of iOS settings lists.
// Each is drawn on a 24-unit grid and stroked, so one color and line weight fits them all.
const ICONS: Record<SettingsIconName, ReactNode> = {
  // Bathroom scale: rounded body with a dial and needle.
  weight: (
    <>
      <Rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <Path d="M7.75 11a4.25 4.25 0 0 1 8.5 0" />
      <Path d="m12 11 1.7-2.9" />
    </>
  ),
  // Water drop with a small shine on the lower left.
  water: (
    <>
      <Path d="M12 3.75c2.9 3.3 6 6.75 6 10.1a6 6 0 0 1-12 0c0-3.35 3.1-6.8 6-10.1z" />
      <Path d="M9 14.25a3 3 0 0 0 3 3" />
    </>
  ),
  // Two footprints, one a step ahead of the other.
  steps: (
    <>
      <Path d="M7.5 3.25c1.8 0 3 2 3 4.6 0 2.1-.6 3.4-1 4.4h-4c-.4-1-1-2.3-1-4.4 0-2.6 1.2-4.6 3-4.6z" />
      <Path d="M5.6 14.5h3.8v.9a1.9 1.9 0 0 1-3.8 0z" />
      <Path d="M16.5 6.75c1.8 0 3 2 3 4.6 0 2.1-.6 3.4-1 4.4h-4c-.4-1-1-2.3-1-4.4 0-2.6 1.2-4.6 3-4.6z" />
      <Path d="M14.6 18h3.8v.9a1.9 1.9 0 0 1-3.8 0z" />
    </>
  ),
  // Heart, for Apple Health.
  heart: (
    <Path d="M12 19.35s-7.75-4.5-7.75-10.25A4.25 4.25 0 0 1 12 6.5a4.25 4.25 0 0 1 7.75 2.6c0 5.75-7.75 10.25-7.75 10.25z" />
  ),
  // Head and shoulders.
  person: (
    <>
      <Circle cx="12" cy="8" r="3.75" />
      <Path d="M5 19.75c.9-3.4 3.7-5.5 7-5.5s6.1 2.1 7 5.5" />
    </>
  ),
  // Envelope with a soft fold.
  mail: (
    <>
      <Rect x="3.25" y="5.25" width="17.5" height="13.5" rx="3" />
      <Path d="m4 7.5 6.8 5a2 2 0 0 0 2.4 0l6.8-5" />
    </>
  ),
  // Bell with rounded feet and a clapper.
  bell: (
    <>
      <Path d="M6 10.25a6 6 0 0 1 12 0v3.4l1.15 1.65a.9.9 0 0 1-.74 1.45H5.59a.9.9 0 0 1-.74-1.45L6 13.65z" />
      <Path d="M10.3 19.5a2 2 0 0 0 3.4 0" />
    </>
  ),
  // Globe with an equator and a meridian, for language.
  globe: (
    <>
      <Circle cx="12" cy="12" r="8.75" />
      <Path d="M3.25 12h17.5" />
      <Path d="M12 3.25c2.3 2.4 3.5 5.3 3.5 8.75s-1.2 6.35-3.5 8.75c-2.3-2.4-3.5-5.3-3.5-8.75S9.7 5.65 12 3.25z" />
    </>
  ),
  // Payment card with a stripe and a short number line, for the subscription.
  card: (
    <>
      <Rect x="3.25" y="5.5" width="17.5" height="13" rx="3" />
      <Path d="M3.25 10h17.5" />
      <Path d="M7 15h3.5" />
    </>
  ),
  // Calendar page with two rings, for the day the user started.
  calendar: (
    <>
      <Rect x="3.75" y="5" width="16.5" height="15.25" rx="3" />
      <Path d="M3.75 9.5h16.5M8.5 3v4M15.5 3v4" />
    </>
  ),
  // Upright ruler with tick marks, for height.
  ruler: (
    <>
      <Rect x="7.5" y="3.25" width="9" height="17.5" rx="2.5" />
      <Path d="M7.5 7.5h3M7.5 11h4.5M7.5 14.5h3M7.5 18h4.5" />
    </>
  ),
  // Speech bubble with a tail on the lower left.
  chat: (
    <Path d="M12 4.25c4.6 0 8.25 3.1 8.25 7s-3.65 7-8.25 7c-1.05 0-2.05-.15-3-.45L5 19.25l1.05-3.35C4.75 14.65 3.75 12.95 3.75 11.25c0-3.9 3.65-7 8.25-7z" />
  ),
  // Question mark in a circle.
  help: (
    <>
      <Circle cx="12" cy="12" r="8.75" />
      <Path d="M9.5 9.5a2.6 2.6 0 0 1 5.05.85c0 1.75-2.55 2.25-2.55 4" />
      <Path d="M12 17.25h.01" />
    </>
  ),
  // Page with a folded corner and two lines of text.
  document: (
    <>
      <Path d="M13.5 3.5H7.75A2.25 2.25 0 0 0 5.5 5.75v12.5a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25V8.5z" />
      <Path d="M13.5 3.5v3.25c0 .97.78 1.75 1.75 1.75h3.25" />
      <Path d="M9 13h6M9 16.5h4" />
    </>
  ),
  // Shield with a check mark.
  shield: (
    <>
      <Path d="M12 3.5 5.5 6v5.25c0 4.25 2.75 7.4 6.5 9.25 3.75-1.85 6.5-5 6.5-9.25V6z" />
      <Path d="m9.25 12.25 1.9 1.9 3.6-3.9" />
    </>
  ),
  // Open door with an arrow pointing out.
  logout: (
    <>
      <Path d="M10 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h3" />
      <Path d="m14.5 8 4 4-4 4" />
      <Path d="M18.5 12h-9" />
    </>
  ),
};

type SettingsIconProps = {
  name: SettingsIconName;
  size?: number;
  color?: string;
  /** Line weight, on the 24-unit grid. */
  strokeWidth?: number;
};

export function SettingsIcon({ name, size = 22, color = '#1c1c1e', strokeWidth = 2 }: SettingsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        {ICONS[name]}
      </G>
    </Svg>
  );
}
