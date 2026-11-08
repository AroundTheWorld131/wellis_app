// The two medications the shot log offers, each with its dose steps in mg.
export const MEDICATIONS = [
  { name: 'Mounjaro', doses: [2.5, 5, 7.5, 10, 12.5, 15] },
  { name: 'Ozempic', doses: [0.25, 0.5, 1, 2] },
] as const;

export type Medication = (typeof MEDICATIONS)[number]['name'];

export const MEDICATION_NAMES: Medication[] = MEDICATIONS.map((option) => option.name);

/** Picked for a first shot, or when the last shot's medication is no longer offered. */
export const DEFAULT_MEDICATION: Medication = 'Mounjaro';

export function isMedication(name: string): name is Medication {
  return (MEDICATION_NAMES as string[]).includes(name);
}

/** The dose steps for a medication. */
export function dosesFor(medication: Medication): readonly number[] {
  return MEDICATIONS.find((option) => option.name === medication)?.doses ?? [];
}

// Where shots can go, in the order people usually rotate through them.
export const INJECTION_SITES = [
  'Stomach, upper left',
  'Stomach, upper right',
  'Stomach, lower left',
  'Stomach, lower right',
  'Thigh, left',
  'Thigh, right',
  'Arm, left',
  'Arm, right',
];

/** The site after `last` in the rotation, so a new shot suggests a different spot. */
export function nextSite(last: string) {
  const index = INJECTION_SITES.indexOf(last);
  return index === -1 ? INJECTION_SITES[0] : INJECTION_SITES[(index + 1) % INJECTION_SITES.length];
}

/** "2.5 mg", "0.25 mg". */
export function formatDose(doseMg: number) {
  return `${doseMg} mg`;
}
