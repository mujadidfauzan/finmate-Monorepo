import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';

const VoiceInputScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    Voice.onSpeechError = (e) => {
      setError(JSON.stringify(e.error));
      setIsRecording(false);
    };
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        setRecognizedText(e.value[0]);
      }
      setIsRecording(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startRecording = async () => {
    try {
      await Voice.start('id-ID');
      setIsRecording(true);
      setError('');
      setRecognizedText('');
    } catch (e) {
      setError(JSON.stringify(e));
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e) {
      setError(JSON.stringify(e));
    }
  };

  const handlePress = () => {
      if(isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  }

  // A simple placeholder for the waveform
  const renderWaveform = () => (
    <View style={styles.waveformContainer}>
      <View style={[styles.waveformLine, { height: 20 }]} />
      <View style={[styles.waveformLine, { height: 40 }]} />
      <View style={[styles.waveformLine, { height: 30 }]} />
      <View style={[styles.waveformLine, { height: 50 }]} />
      <View style={[styles.waveformLine, { height: 25 }]} />
      <View style={[styles.waveformLine, { height: 35 }]} />
      <View style={[styles.waveformLine, { height: 20 }]} />
    </View>
  );

  if (!hasPermission) {
    return (
        <View style={styles.container}>
            <Text style={{textAlign: 'center'}}>Aplikasi ini memerlukan izin untuk menggunakan mikrofon.</Text>
            <Button title="Berikan Izin" onPress={async () => {
                 const { status } = await Audio.requestPermissionsAsync();
                 setHasPermission(status === 'granted');
            }}/>
        </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="#333" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.timer}>00.00.00</Text>
        
        {isRecording && renderWaveform()}

        <View style={styles.statusContainer}>
            {recognizedText ? (
                <Text style={styles.statusText}>Hasil: {recognizedText}</Text>
            ) : (
                <Text style={styles.statusText}>
                {isRecording ? "Mendengarkan..." : "Tekan untuk merekam"}
                </Text>
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity 
            style={[styles.micButton, isRecording && styles.micButtonRecording]}
            onPress={handlePress}>
          <Ionicons name="mic" size={40} color="white" />
        </TouchableOpacity>
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
  },
  statusContainer: {
      alignItems: 'center'
  },
  statusText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2ABF83',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRecording: {
    backgroundColor: '#FF6347', // Tomato color for recording
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  waveformLine: {
    width: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  errorText: {
      color: 'red',
      marginTop: 20,
  }
});

export default VoiceInputScreen; 