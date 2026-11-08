import { StyleSheet } from 'react-native';

import { Shelf, ShelfTile } from '@/components/discover/shelf';
import { SkyScreen } from '@/components/sky-screen';
import { ARTICLES, MENTAL_HEALTH, type DiscoverRead } from '@/constants/discover-reads';
import { RECIPES } from '@/constants/recipes';
import { WORKOUTS } from '@/constants/workouts';

const PAGE_PADDING = 22;

// An article or mental health tile: its photo, or a tint with an icon.
function readTile(read: DiscoverRead) {
  return (
    <ShelfTile
      key={read.id}
      image={read.image}
      tint={read.tint}
      symbol={read.symbol}
      title={read.title}
      meta={read.meta}
    />
  );
}

// Apple Music style shelves, each scrolling sideways: recipes, workouts, mental health and
// articles. The tiles don't open anything for now.
export default function DiscoverScreen() {
  return (
    // On the Home page's sky, over a white page.
    <SkyScreen contentStyle={styles.content} pageColor="#ffffff">
        <Shelf title="Recipes" inset={PAGE_PADDING}>
          {RECIPES.map((recipe) => (
            <ShelfTile
              key={recipe.id}
              image={recipe.image}
              tint={recipe.tint}
              title={recipe.title}
              meta={`${recipe.minutes} min`}
            />
          ))}
        </Shelf>
        <Shelf title="Workouts" inset={PAGE_PADDING}>
          {WORKOUTS.map((workout) => (
            <ShelfTile
              key={workout.id}
              image={workout.image}
              title={workout.title}
              meta={`${workout.minutes} min`}
            />
          ))}
        </Shelf>
        <Shelf title="Mental health" inset={PAGE_PADDING}>
          {MENTAL_HEALTH.map(readTile)}
        </Shelf>
        <Shelf title="Articles" inset={PAGE_PADDING}>
          {ARTICLES.map(readTile)}
        </Shelf>
    </SkyScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    // Room so the last shelf can scroll clear of the floating tab bar.
    paddingBottom: 120,
    gap: 28,
  },
});
