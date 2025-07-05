import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Button, Alert, ActivityIndicator, Modal } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { scanReceipt } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Hardcode Token
import Constants from 'expo-constants';
const DEFAULT_TOKEN = Constants.expoConfig.extra.DEFAULT_TOKEN;
//

const ScanReceiptScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [facing, setFacing] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState('off');
  const [processingModal, setProcessingModal] = useState(false);
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = {
          quality: 0.8,
          base64: false,
          exif: false,
        };
        const data = await cameraRef.current.takePictureAsync(options);
        setCapturedImage(data.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Gagal mengambil foto. Silakan coba lagi.');
      }
    }
  };

  const pickImage = async () => {
    if (!galleryPermission || !galleryPermission.granted) {
      const { status } = await requestGalleryPermission();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Maaf, kami memerlukan akses ke galeri untuk fitur ini!');
        return;
      }
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih foto dari galeri.');
    }
  };

  const processImage = async (imageUri) => {
    setIsProcessing(true);
    setProcessingModal(true);

    try {
      console.log('Processing image:', imageUri);

      // Get user token
      // const token = await AsyncStorage.getItem('userToken');
      const token = DEFAULT_TOKEN; // Hardcoded token for testing
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      // Call OCR API
      const result = await scanReceipt(imageUri, token);

      console.log('OCR Result:', result);

      // Show success message with extracted data
      const { extracted, transaction } = result;

      Alert.alert('Berhasil!', `Struk berhasil diproses!\n\nTotal: Rp ${extracted.total.toLocaleString()}\nKategori: ${extracted.category}\nTanggal: ${extracted.date}\n\nTransaksi telah disimpan ke riwayat Anda.`, [
        {
          text: 'Lihat Detail',
          onPress: () => {
            navigation.navigate('TransactionDetail', {
              transaction: transaction,
              extracted: extracted,
            });
          },
        },
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error processing image:', error);

      let errorMessage = 'Gagal memproses struk. ';

      if (error.message.includes('Token')) {
        errorMessage += 'Silakan login kembali.';
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        errorMessage += 'Periksa koneksi internet Anda.';
      } else {
        errorMessage += 'Silakan coba lagi atau gunakan foto yang lebih jelas.';
      }

      Alert.alert('Error', errorMessage, [
        {
          text: 'Coba Lagi',
          onPress: () => {
            setCapturedImage(null);
          },
        },
        {
          text: 'Kembali',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } finally {
      setIsProcessing(false);
      setProcessingModal(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode((current) => (current === 'off' ? 'on' : 'off'));
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  if (!permission) {
    return <View style={styles.loadingContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#666" />
        <Text style={styles.permissionText}>Kami memerlukan akses kamera untuk memindai struk</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Berikan Izin Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />

        <View style={styles.previewButtons}>
          <TouchableOpacity onPress={retakePhoto} style={styles.previewButton} disabled={isProcessing}>
            <Ionicons name="close-circle" size={50} color="white" style={styles.shadow} />
            <Text style={styles.previewButtonText}>Ulangi</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => processImage(capturedImage)} style={styles.previewButton} disabled={isProcessing}>
            <Ionicons name="checkmark-circle" size={50} color={isProcessing ? '#999' : '#4CAF50'} style={styles.shadow} />
            <Text style={styles.previewButtonText}>{isProcessing ? 'Memproses...' : 'Gunakan Foto'}</Text>
          </TouchableOpacity>
        </View>

        {/* Processing Modal */}
        <Modal animationType="fade" transparent={true} visible={processingModal} onRequestClose={() => {}}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.modalText}>Memproses struk...</Text>
              <Text style={styles.modalSubText}>Mohon tunggu sebentar</Text>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} flash={flashMode}>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBackground}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBackground} onPress={toggleFlash}>
            <MaterialIcons name={flashMode === 'off' ? 'flash-off' : 'flash-on'} size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Camera Guide Overlay */}
        <View style={styles.cameraGuide}>
          <View style={styles.guideFrame} />
          <Text style={styles.guideText}>Posisikan struk di dalam frame</Text>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <Ionicons name="images" size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterButton} onPress={takePicture} disabled={isProcessing} />

          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 30,
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
  },
  iconBackground: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  guideText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
  },
  shutterButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  iconButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
  previewButton: {
    alignItems: 'center',
  },
  previewButtonText: {
    color: 'white',
    marginTop: 5,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  shadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 200,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  modalSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ScanReceiptScreen;
