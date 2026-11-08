import { Image, type ImageSource } from 'expo-image';
import { router, type Href } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnimatedButton } from '@/components/animated-button';

// Tile width in a shelf; the photo is square, like an album cover.
const TILE_WIDTH = 130;
const TILE_GAP = 12;

type ShelfTileProps = {
  image?: ImageSource | number;
  /** Shown behind the photo, and on its own when there's no photo. */
  tint?: string;
  title: string;
  /** Grey line under the title, like "10 min". */
  meta: string;
  /** Where the tile goes. Without one, the tile isn't tappable yet. */
  href?: Href;
  /** SF Symbol shown on the tint when there's no photo. */
  symbol?: SFSymbol;
};

// Apple Music style tile: a square photo with rounded corners, the name and a grey line
// underneath, no card around it.
export function ShelfTile({ image, tint = '#f6f6f9', title, meta, href, symbol }: ShelfTileProps) {
  const content = (
    <>
      <View style={[styles.photo, { backgroundColor: tint }]}>
        {image ? (
          <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        ) : symbol ? (
          <SymbolView name={symbol} size={30} weight="medium" tintColor="rgba(0, 0, 0, 0.28)" />
        ) : null}
      </View>
      <Text style={styles.tileTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {meta}
      </Text>
    </>
  );

  // Without a destination the tile is a plain view: no press animation, no haptic.
  if (!href) return <View style={styles.tile}>{content}</View>;
  return (
    <AnimatedButton navigates onPress={() => router.push(href)} scaleTo={0.97} style={styles.tile}>
      {content}
    </AnimatedButton>
  );
}

type ShelfProps = {
  title: string;
  /** Space on both sides, matching the page's padding, so the first tile lines up. */
  inset: number;
  onSeeAll?: () => void;
  /** The ShelfTiles. */
  children: ReactNode;
};

// Apple Music style shelf: a bold title with a chevron, then a row of tiles that scrolls
// sideways and snaps tile by tile.
export function Shelf({ title, inset, onSeeAll, children }: ShelfProps) {
  return (
    <View style={styles.shelf}>
      <AnimatedButton onPress={onSeeAll} disableAnimation style={[styles.header, { marginHorizontal: inset }]}>
        <Text style={styles.title}>{title}</Text>
        <SymbolView
          name="chevron.right"
          size={15}
          weight="bold"
          tintColor="rgba(0, 0, 0, 0.35)"
          fallback={<Text style={styles.chevronFallback}>›</Text>}
        />
      </AnimatedButton>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={TILE_WIDTH + TILE_GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: inset, gap: TILE_GAP }}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shelf: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#262626',
  },
  chevronFallback: {
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.35)',
  },
  tile: {
    width: TILE_WIDTH,
  },
  photo: {
    width: TILE_WIDTH,
    height: TILE_WIDTH,
    marginBottom: 8,
    borderRadius: 12,
    borderCurve: 'continuous',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
    color: '#262626',
  },
  meta: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.5)',
  },
});
