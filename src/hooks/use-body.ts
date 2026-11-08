import { useQuery } from 'convex/react';

import { MOCK_GOAL_WEIGHT_KG, MOCK_HEIGHT_CM, MOCK_STARTING_WEIGHT_KG, USE_MOCK_HISTORY } from '@/constants/mock-history';
import { api } from '../../convex/_generated/api';

const MOCK_BODY = { startingWeightKg: MOCK_STARTING_WEIGHT_KG, heightCm: MOCK_HEIGHT_CM };

/**
 * The user's starting weight and height; either is missing until entered. Undefined while
 * loading, null when signed out. While USE_MOCK_HISTORY is on, the demo values instead.
 */
export function useBody() {
  const saved = useQuery(api.body.get, USE_MOCK_HISTORY ? 'skip' : {});
  return USE_MOCK_HISTORY ? MOCK_BODY : saved;
}

/**
 * The user's weight goal in kg, or undefined while loading or signed out. While
 * USE_MOCK_HISTORY is on, the demo goal instead, so it matches the demo weigh-ins.
 */
export function useGoalWeightKg() {
  const goals = useQuery(api.goals.get);
  return USE_MOCK_HISTORY ? MOCK_GOAL_WEIGHT_KG : goals?.weightKg;
}
