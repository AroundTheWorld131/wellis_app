import { useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_MS = 24 * 60 * 60 * 1000;

// The seven days of the current week, Monday first.
function currentWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // getDay() is 0 for Sunday; shift so Monday is 0.
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today.getTime() - mondayOffset * DAY_MS);
  return {
    todayIndex: mondayOffset,
    days: DAY_LETTERS.map((letter, index) => ({
      letter,
      date: new Date(monday.getTime() + index * DAY_MS),
    })),
  };
}

// Mon–Sun row with today highlighted. Days still to come are greyed out.
// TODO: show the selected day's data in the Home cards.
export function WeekStrip({ style }: { style?: StyleProp<ViewStyle> }) {
  const [{ days, todayIndex }] = useState(currentWeek);
  const [selectedIndex, setSelectedIndex] = useState(todayIndex);

  return (
    <View style={[styles.row, style]}>
      {days.map((day, index) => {
        const selected = index === selectedIndex;
        const upcoming = index > todayIndex;
        return (
          <AnimatedButton
            key={day.date.getTime()}
            onPress={() => setSelectedIndex(index)}
            scaleTo={0.92}
            style={[styles.day, selected && styles.selectedDay]}>
            <Text style={[styles.letter, selected && styles.selectedLetter]}>{day.letter}</Text>
            <Text style={[styles.number, upcoming && styles.upcomingNumber]}>
              {day.date.getDate()}
            </Text>
          </AnimatedButton>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 18,
    borderCurve: 'continuous',
  },
  selectedDay: {
    backgroundColor: '#ffffff',
  },
  letter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a3a3a3',
  },
  selectedLetter: {
    color: '#262626',
  },
  number: {
    fontFamily: 'BricolageGrotesque_Condensed800ExtraBold',
    fontSize: 22,
    color: '#262626',
  },
  upcomingNumber: {
    color: '#a3a3a3',
  },
});
