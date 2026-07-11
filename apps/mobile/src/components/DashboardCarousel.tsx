import React, { useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Image } from 'expo-image';

const CARD_SPACING = -18;

type CarouselCardId = 'training' | 'news' | 'history';

interface CarouselCard {
  id: CarouselCardId;
  title: string;
  subtitle: string;
  backgroundColor: string;
}

const CARD_IMAGE_SOURCES = {
  training: require('../../assets/training-image.jpg'),
  news: require('../../assets/actualite-mobile.jpg'),
  history: require('../../assets/historique-card-mobile.jpg'),
};

const cards: CarouselCard[] = [
  {
    id: 'training',
    title: 'Entraînements',
    subtitle: 'Programmation',
    backgroundColor: '#2C3E50',
  },
  {
    id: 'news',
    title: 'Actualités',
    subtitle: 'Communication du club',
    backgroundColor: '#E74C3C',
  },
  {
    id: 'history',
    title: 'Historique',
    subtitle: "Résultats d'entraînement",
    backgroundColor: '#3498DB',
  },
];

interface DashboardCarouselProps {
  onTrainingPress?: () => void;
}

function Dots({ currentIndex }: { currentIndex: number }) {
  return (
    <View style={styles.dotsContainer}>
      {cards.map((card, index) => (
        <View
          key={card.id}
          style={[styles.dot, { opacity: currentIndex === index ? 1 : 0.3 }]}
        />
      ))}
    </View>
  );
}

export default function DashboardCarousel({
  onTrainingPress,
}: DashboardCarouselProps) {
  const { width, height } = useWindowDimensions();
  const cardWidth = width - 44;
  const cardHeight = height * 0.6;
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef<FlatList<CarouselCard>>(null);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / (cardWidth + CARD_SPACING));
    setCurrentIndex(index);
  };

  const handleCardPress = (card: CarouselCard) => {
    if (card.id === 'training' && onTrainingPress) {
      onTrainingPress();
      return;
    }

    console.log(`Card pressed: ${card.id}`);
  };

  const renderCard: ListRenderItem<CarouselCard> = ({ item: card, index }) => {
    const isActive = currentIndex === index;

    return (
      <Pressable
        style={[
          styles.card,
          {
            width: cardWidth,
            height: cardHeight,
            transform: [{ scale: isActive ? 1 : 0.85 }],
            opacity: isActive ? 1 : 0.7,
            marginRight: CARD_SPACING,
          },
        ]}
        onPress={() => handleCardPress(card)}
      >
        <View style={styles.cardContent}>
          <Image
            source={CARD_IMAGE_SOURCES[card.id]}
            style={styles.cardImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <View style={styles.cardOverlay} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.carouselWrapper, { height: cardHeight }]}>
        <FlatList
          ref={listRef}
          data={cards}
          renderItem={renderCard}
          keyExtractor={(card) => card.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContainer}
          snapToInterval={cardWidth + CARD_SPACING}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      </View>
      <View style={styles.dotsWrapper}>
        <Dots currentIndex={currentIndex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  carouselWrapper: {
    justifyContent: 'center',
  },
  dotsWrapper: {
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
    alignItems: 'center',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#414551',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  cardTextContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
  },
});
