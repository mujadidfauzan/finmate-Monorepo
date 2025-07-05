import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const ScanReceiptScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();
  const [facing, setFacing] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.7, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      setCapturedImage(data.uri);
    }
  };

  const pickImage = async () => {
    if (!galleryPermission || !galleryPermission.granted) {
        const { status } = await requestGalleryPermission();
        if (status !== 'granted') {
            alert("Sorry, we need camera roll permissions to make this work!");
            return;
        }
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const processImage = (imageUri) => {
    // For now, let's just log the image URI and go back.
    // In the future, this is where OCR processing will happen.
    console.log("Processing image:", imageUri);
    alert("Fungsi OCR belum diimplementasikan. Gambar akan diproses di sini.");
    navigation.goBack();
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: 'center', paddingBottom: 10 }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  if (capturedImage) {
    return (
        <View style={styles.container}>
            <Image source={{ uri: capturedImage }} style={styles.preview} />
            <View style={styles.previewButtons}>
                <TouchableOpacity onPress={() => setCapturedImage(null)} style={styles.previewButton}>
                    <Ionicons name="close-circle" size={50} color="white" style={styles.shadow}/>
                    <Text style={styles.previewButtonText}>Ulangi</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => processImage(capturedImage)} style={styles.previewButton}>
                    <Ionicons name="checkmark-circle" size={50} color="#4CAF50" style={styles.shadow} />
                    <Text style={styles.previewButtonText}>Gunakan Foto</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBackground}>
                <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
             <TouchableOpacity style={styles.iconBackground}>
                <MaterialIcons name="flash-off" size={24} color="white" />
            </TouchableOpacity>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <Ionicons name="images" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shutterButton} onPress={takePicture} />
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
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
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10
  },
  shadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  }
});

export default ScanReceiptScreen; 