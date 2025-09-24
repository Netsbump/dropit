import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 44; // Reduced width to show more side cards
const CARD_SPACING = -18; // Normal spacing

interface CarouselCard {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  backgroundColor: string;
}

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
    subtitle: 'Résultats d\'entraînement',
    backgroundColor: '#3498DB',
  },
];

interface DashboardCarouselProps {
  onTrainingPress?: () => void;
}

export default function DashboardCarousel({ onTrainingPress }: DashboardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const handleCardPress = (card: CarouselCard) => {
    if (card.id === 'training' && onTrainingPress) {
      onTrainingPress();
    } else {
      // Handle other card presses (news, history)
      console.log(`Card pressed: ${card.id}`);
    }
  };

  const renderCard = (card: CarouselCard, index: number) => {
    const isActive = currentIndex === index;
    const isLastCard = index === cards.length - 1;
    const cardStyle = [
      styles.card,
      {
        transform: [
          {
            scale: isActive ? 1 : 0.85, // Side cards are smaller
          },
        ],
        opacity: isActive ? 1 : 0.7, // Side cards are more transparent
        marginRight: CARD_SPACING,
      }
    ];

    // Use ImageBackground for all cards with their respective images
    if (card.id === 'training') {
      return (
        <TouchableOpacity
          key={card.id}
          style={cardStyle}
          activeOpacity={0.9}
          onPress={() => handleCardPress(card)}
        >
          <ImageBackground
            source={require('../../assets/training-image.jpg')}
            style={styles.cardContent}
            imageStyle={styles.cardImage}
          >
            <View style={styles.cardOverlay} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    }

    if (card.id === 'news') {
      return (
        <TouchableOpacity
          key={card.id}
          style={cardStyle}
          activeOpacity={0.9}
          onPress={() => handleCardPress(card)}
        >
          <ImageBackground
            source={require('../../assets/actualite-mobile.jpg')}
            style={styles.cardContent}
            imageStyle={styles.cardImage}
          >
            <View style={styles.cardOverlay} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    }

    if (card.id === 'history') {
      return (
        <TouchableOpacity
          key={card.id}
          style={cardStyle}
          activeOpacity={0.9}
          onPress={() => handleCardPress(card)}
        >
          <ImageBackground
            source={require('../../assets/historique-card-mobile.jpg')}
            style={styles.cardContent}
            imageStyle={styles.cardImage}
          >
            <View style={styles.cardOverlay} />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    }

    // Fallback (should not be reached since all cards have images)
    return null;
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {cards.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { opacity: currentIndex === index ? 1 : 0.3 }
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.carouselWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContainer}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          snapToAlignment="start"
          decelerationRate="fast"
        >
          {cards.map((card, index) => renderCard(card, index))}
        </ScrollView>
      </View>
      <View style={styles.dotsWrapper}>
        {renderDots()}
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
    height: height * 0.6, // 60% of screen height for cards
    justifyContent: 'center',
  },
  dotsWrapper: {
    height: 80, // Fixed height for dots area with more space
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  scrollContainer: {
    paddingHorizontal: 20, // Reduced padding to show more side cards
    paddingRight: 40, // Extra padding for the last card
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: height * 0.6, // 60% of screen height for card content
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'space-between',
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
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
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

  // New styles for image background
  cardImage: {
    borderRadius: 20,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Dark overlay for text readability
    borderRadius: 20,
  },
});