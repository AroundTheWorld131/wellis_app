import type { ImageSource } from 'expo-image';

/**
 * Sample recipes for the Discover tab: high protein, modest portions, easy on a GLP-1.
 * Nutrition is a rough estimate per serving. TODO: check the numbers, and move recipes to
 * Convex if they should change without an app release.
 */
export type Recipe = {
  id: string;
  title: string;
  /** One line under the title. */
  summary: string;
  /** Photo of the dish. Without one, the card shows a soft tinted block. */
  image?: ImageSource | number;
  /** Background behind the photo, and the whole block when there's no photo yet. */
  tint: string;
  minutes: number;
  servings: number;
  proteinG: number;
  kcal: number;
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  ingredients: string[];
  steps: string[];
};

export const RECIPES: Recipe[] = [
  {
    id: 'smoked-salmon-avocado-toast',
    image: require('@/assets/images/recipes/avocado-toast.jpg'),
    title: 'Smoked salmon avocado toast',
    summary: 'Sourdough, soft eggs and peppery rocket',
    tint: '#eef0e6',
    minutes: 10,
    servings: 1,
    proteinG: 32,
    kcal: 480,
    meal: 'Breakfast',
    ingredients: [
      '1 slice of sourdough',
      '½ ripe avocado',
      '60 g smoked salmon',
      '2 eggs',
      'A handful of rocket and a few cherry tomatoes',
      'Lemon, chilli flakes, salt and pepper',
    ],
    steps: [
      'Boil the eggs for 7 minutes, then cool and peel.',
      'Toast the sourdough. Mash the avocado with a squeeze of lemon and a pinch of salt.',
      'Spread the avocado on the toast and layer the smoked salmon on top.',
      'Serve with the halved eggs, rocket and tomatoes. Finish with chilli flakes and pepper.',
    ],
  },
  {
    id: 'chicken-corn-lettuce-wraps',
    image: require('@/assets/images/recipes/lettuce-wraps.jpg'),
    title: 'Chicken & sweetcorn lettuce wraps',
    summary: 'Creamy shredded chicken in crisp romaine boats',
    tint: '#e7efe3',
    minutes: 10,
    servings: 2,
    proteinG: 38,
    kcal: 340,
    meal: 'Lunch',
    ingredients: [
      '300 g cooked chicken breast, shredded',
      '100 g sweetcorn, drained',
      '3 tbsp Greek yoghurt',
      '1 tbsp light mayonnaise',
      '1 tsp lemon juice',
      'Salt and plenty of black pepper',
      '1 head of romaine lettuce',
    ],
    steps: [
      'Mix the yoghurt, mayonnaise and lemon juice in a bowl.',
      'Stir in the chicken and sweetcorn, then season with salt and black pepper.',
      'Separate the romaine into large leaves, rinse and pat dry.',
      'Spoon the chicken into the leaves and finish with more pepper.',
    ],
  },
  {
    id: 'steak-potatoes-asparagus',
    image: require('@/assets/images/recipes/steak.jpg'),
    title: 'Steak, crispy potatoes & asparagus',
    summary: 'A pub classic, made lighter in the oven',
    tint: '#f1ebe2',
    minutes: 35,
    servings: 2,
    proteinG: 42,
    kcal: 520,
    meal: 'Dinner',
    ingredients: [
      '2 lean sirloin steaks (about 175 g each)',
      '400 g waxy potatoes, cut into wedges',
      '1 bunch of asparagus, ends trimmed',
      '1 tbsp olive oil',
      '1 tsp smoked paprika',
      'Salt and black pepper',
    ],
    steps: [
      'Heat the oven to 220°C. Toss the potatoes with half the oil, the paprika and salt, then roast for 25 minutes.',
      'Add the asparagus to the tray for the last 8 minutes.',
      'Pat the steaks dry and season well. Sear in a very hot pan for 2–3 minutes a side for medium-rare.',
      'Rest the steaks for 5 minutes, slice against the grain and serve with the potatoes and asparagus.',
    ],
  },
  {
    id: 'chilli-noodles-dumplings-eggs',
    image: require('@/assets/images/recipes/noodles.jpg'),
    title: 'Chilli noodles with dumplings & jammy eggs',
    summary: 'Spicy, comforting and ready in 15 minutes',
    tint: '#f5e9dc',
    minutes: 15,
    servings: 2,
    proteinG: 30,
    kcal: 560,
    meal: 'Dinner',
    ingredients: [
      '2 nests of wheat noodles',
      '10 frozen chicken or prawn dumplings',
      '3 eggs',
      '2 tbsp chilli crisp',
      '1 tbsp soy sauce',
      '1 tsp rice vinegar',
      '½ cucumber, sliced',
      '2 spring onions, sliced',
    ],
    steps: [
      'Boil the eggs for 6½ minutes, then cool them in cold water and peel.',
      'Cook the dumplings as the pack says. Add the noodles for the last 3 minutes.',
      'Mix the chilli crisp, soy sauce and vinegar. Drain the noodles and dumplings and toss them in the sauce.',
      'Top with halved eggs, cucumber, spring onion and a little more chilli crisp.',
    ],
  },
  {
    id: 'salmon-sweet-potato-cottage-cheese',
    image: require('@/assets/images/recipes/salmon.jpg'),
    title: 'Glazed salmon, sweet potato & cottage cheese',
    summary: 'Sweet, salty and packed with protein',
    tint: '#f6e6da',
    minutes: 30,
    servings: 2,
    proteinG: 40,
    kcal: 540,
    meal: 'Dinner',
    ingredients: [
      '2 salmon fillets',
      '2 medium sweet potatoes, cubed',
      '150 g cottage cheese',
      '1 tbsp honey',
      '1 tbsp soy sauce',
      '1 tsp olive oil',
      'Chilli flakes and dried parsley',
      'Side salad: leaves, tomatoes, avocado',
    ],
    steps: [
      'Heat the oven to 210°C. Toss the sweet potato with the oil and salt, then roast for 25 minutes.',
      'Mix the honey and soy sauce. Brush it over the salmon and bake for the last 12 minutes.',
      'Plate the sweet potato and salmon and spoon the cottage cheese on top.',
      'Finish with chilli flakes and parsley, and serve with the salad.',
    ],
  },
];
