import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    image: require('../../assets/onboarding-1.png'),
    title: 'Catat, Analisis, dan Rencanakan Keuangan Tanpa Ribet!',
    subtitle: 'Kelola keuangan dengan mudah dan efisien',
    buttonText: 'Selanjutnya',
  },
  {
    id: 2,
    image: require('../../assets/onboarding-2.png'),
    title: 'Coba cara baru atur uang. Lebih cepat, Lebih pintar!',
    subtitle: 'Dapatkan kontrol penuh atas keuangan Anda',
    buttonText: 'Mulai',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return; // Prevent multiple taps during animation

    if (currentIndex < onboardingData.length - 1) {
      setIsAnimating(true);
      
      // Slide to next screen
      Animated.timing(slideAnim, {
        toValue: -(currentIndex + 1) * width,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex + 1);
        setIsAnimating(false);
      });
    } else {
      // Navigate to next screen
      setIsAnimating(true);
      Animated.timing(slideAnim, {
        toValue: -width * 2,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Login'); // atau 'Home' sesuai flow aplikasi Anda
      });
    }
  };

  const handleSkip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    Animated.timing(slideAnim, {
      toValue: -width * 2,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('Login'); // atau 'Home' sesuai flow aplikasi Anda
    });
  };

  const renderScreen = (item, index) => (
    <View key={item.id} style={[styles.screen, { left: index * width }]}>
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image 
          source={item.image} 
          style={styles.image} 
          resizeMode="contain" 
        />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
        
        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {onboardingData.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicator,
                i === currentIndex ? styles.activeIndicator : styles.inactiveIndicator,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={[
            styles.nextButton,
            isAnimating && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={isAnimating}
        >
          <Text style={styles.nextButtonText}>{item.buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2ABF83" barStyle="light-content" />
      
      {/* Header with skip button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleSkip} 
          style={[
            styles.skipButton,
            isAnimating && styles.skipButtonDisabled
          ]}
          activeOpacity={0.7}
          disabled={isAnimating}
        >
          <Text style={styles.skipText}>Lewati</Text>
        </TouchableOpacity>
      </View>

      {/* Sliding Container */}
      <Animated.View 
        style={[
          styles.slidingContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {onboardingData.map((item, index) => renderScreen(item, index))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2ABF83',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButtonDisabled: {
    opacity: 0.6,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  slidingContainer: {
    flex: 1,
    flexDirection: 'row',
    width: width * onboardingData.length,
  },
  screen: {
    width: width,
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  imageContainer: {
    flex: 0.55,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 10,
  },
  image: {
    width: width * 0.85,
    height: height * 0.4,
    maxHeight: 350,
  },
  contentContainer: {
    flex: 0.45,
    backgroundColor: 'white',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 35,
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 15,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  indicator: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    transition: 'width 0.3s ease',
  },
  activeIndicator: {
    backgroundColor: '#2ABF83',
    width: 30,
  },
  inactiveIndicator: {
    backgroundColor: '#E8F5E8',
    width: 10,
  },
  nextButton: {
    backgroundColor: '#2ABF83',
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#2ABF83',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;