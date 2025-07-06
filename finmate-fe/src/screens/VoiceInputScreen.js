import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { transcribeVoice } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
//  Hardcode Token
import Constants from 'expo-constants';
const DEFAULT_TOKEN = Constants.expoConfig.extra.DEFAULT_TOKEN;
//

const VoiceInputScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);
  const [recording, setRecording] = useState(null);
  const [timer, setTimer] = useState(0);
  const [token, setToken] = useState(null);

  useEffect(() => {
    requestPermissions();
    getToken();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const getToken = async () => {
    try {
      const userToken = DEFAULT_TOKEN;
      setToken(userToken);
    } catch (error) {
      console.error('Failed to get token:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (!hasPermission) {
        Alert.alert('Error', 'Microphone permission is required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Use more compatible recording options
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);

      setRecording(recording);
      setIsRecording(true);
      setError('');
      setRecognizedText('');

      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      console.log('Stopping recording...');
      setIsRecording(false);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        console.log('Recording saved to:', uri);
        await processAudioFile(uri);
      } else {
        setError('Failed to save recording');
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setError('Failed to stop recording: ' + error.message);
    }
  };

  const processAudioFile = async (uri) => {
    try {
      if (!token) {
        Alert.alert('Error', 'Authentication token not found');
        return;
      }

      setRecognizedText('Processing audio...');

      const result = await transcribeVoice(uri, token);

      console.log('Transcription result:', result);

      if (result.message) {
        setRecognizedText(result.note || 'Transcription completed');

        // Show success alert
        Alert.alert('Success', result.message, [
          {
            text: 'View Details',
            onPress: () => {
              Alert.alert('Transaction Details', `Amount: ${result.parsed?.amount || 'N/A'}\n` + `Category: ${result.parsed?.category || 'N/A'}\n` + `Type: ${result.parsed?.type || 'N/A'}\n` + `Note: ${result.note || 'N/A'}`, [
                { text: 'OK', onPress: () => navigation.goBack() },
              ]);
            },
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to process audio:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setError('Failed to process audio: ' + errorMessage);

      // Show error alert
      Alert.alert('Error', errorMessage, [
        { text: 'Try Again', onPress: () => setError('') },
        { text: 'Cancel', onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderWaveform = () => (
    <View style={styles.waveformContainer}>
      {[20, 40, 30, 50, 25, 35, 20, 45, 30, 25].map((height, index) => (
        <View
          key={index}
          style={[
            styles.waveformLine,
            {
              height: isRecording ? height : 20,
              backgroundColor: isRecording ? '#FF6347' : '#ccc',
            },
          ]}
        />
      ))}
    </View>
  );

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>This app needs microphone permission to record audio</Text>
        <Button title="Grant Permission" onPress={requestPermissions} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.timer}>{formatTime(timer)}</Text>

        {renderWaveform()}

        <View style={styles.statusContainer}>
          {recognizedText ? <Text style={styles.statusText}>Result: {recognizedText}</Text> : <Text style={styles.statusText}>{isRecording ? 'Recording...' : 'Tap to record'}</Text>}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity style={[styles.micButton, isRecording && styles.micButtonRecording]} onPress={handlePress} disabled={!token}>
          <Ionicons name="mic" size={40} color="white" />
        </TouchableOpacity>

        {!token && <Text style={styles.warningText}>Please login to use voice recording</Text>}

        <Text style={styles.instructionText}>{isRecording ? 'Speak clearly and tap to stop recording' : 'Hold and speak your transaction details'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
  },
  timer: {
    fontSize: 24,
    color: '#888',
    fontFamily: 'monospace',
  },
  statusContainer: {
    alignItems: 'center',
    minHeight: 80,
  },
  statusText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2ABF83',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  micButtonRecording: {
    backgroundColor: '#FF6347',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
  },
  waveformLine: {
    width: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  permissionText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  warningText: {
    color: '#FF6347',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  instructionText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default VoiceInputScreen;
