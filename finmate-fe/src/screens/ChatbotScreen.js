import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Animated,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Button, // Import Button
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { chatWithBot, getOrCreateSession } from '../utils/api';

const { width, height } = Dimensions.get('window');

const ChatbotScreen = ({ navigation }) => {
  const [allChats, setAllChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For sending messages
  const [isInitializing, setIsInitializing] = useState(true); // For initial load
  const [initializationFailed, setInitializationFailed] = useState(false); // For initial load error
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-width * 0.8)).current;
  const scrollViewRef = useRef();

  const initializeChat = async () => {
    setIsInitializing(true);
    setInitializationFailed(false);
    try {
      const sessionData = await getOrCreateSession();
      const sessionId = sessionData.session_id;

      const initialChat = {
        id: sessionId,
        title: `Percakapan Awal`,
        subtitle: 'Selamat Datang!',
        timestamp: new Date(),
        messages: [
          {
            id: 1,
            text: 'Halo! Ada yang bisa saya bantu dengan keuangan Anda hari ini?',
            isBot: true,
            timestamp: new Date(),
          },
        ],
      };
      setAllChats([initialChat]);
      setActiveChatId(sessionId);
    } catch (error) {
      setInitializationFailed(true);
      console.error("Initialize chat error:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeChat();
  }, []);

  const activeChat = allChats.find(chat => chat.id === activeChatId);

  const toggleSidebar = () => {
    const toValue = showSidebar ? -width * 0.8 : 0;
    setShowSidebar(!showSidebar);
    
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const sendMessage = async () => {
    if (inputText.trim() && activeChatId && !isLoading) {
      const userMessage = {
        id: Date.now(),
        text: inputText,
        isBot: false,
        timestamp: new Date(),
      };
      
      const currentInput = inputText;
      setInputText('');
      
      setAllChats(prevChats => {
        const updated = prevChats.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, userMessage],
              subtitle: currentInput,
              timestamp: new Date(),
            };
          }
          return chat;
        });
        return updated.sort((a, b) => b.timestamp - a.timestamp);
      });
      setIsLoading(true);

      try {
        const botData = await chatWithBot(currentInput, activeChatId);
        
        const botResponse = {
          id: Date.now() + 1,
          text: botData.reply,
          isBot: true,
          timestamp: new Date(),
        };
        
        setAllChats(prevChats => prevChats.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, botResponse],
            };
          }
          return chat;
        }));

      } catch (error) {
        console.error("Failed to get bot response:", error);
        const errorResponse = {
          id: Date.now() + 1,
          text: 'Maaf, terjadi kesalahan saat menghubungi server.',
          isBot: true,
          timestamp: new Date(),
        };
        setAllChats(prevChats => prevChats.map(chat => {
          if (chat.id === activeChatId) {
            return {
              ...chat,
              messages: [...chat.messages, errorResponse],
            };
          }
          return chat;
        }));
        Alert.alert("Error", error.message || "Gagal mengirim pesan.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNewChat = async () => {
    // This function can also be improved to not add a chat if session creation fails
    try {
      // It might be better to show a loader here as well
      const sessionData = await getOrCreateSession();
      const newChatId = sessionData.session_id;
      
      const newChat = {
        id: newChatId,
        title: `Percakapan Baru`,
        subtitle: 'Mulai percakapan...',
        timestamp: new Date(),
        messages: [
          {
            id: 1,
            text: 'Halo! Ada yang bisa saya bantu dengan keuangan Anda hari ini?',
            isBot: true,
            timestamp: new Date(),
          },
        ],
      };
      setAllChats(prev => [newChat, ...prev].sort((a,b) => b.timestamp - a.timestamp));
      setActiveChatId(newChatId);
      toggleSidebar();
    } catch (error) {
      Alert.alert("Error", "Tidak dapat membuat obrolan baru. Periksa koneksi Anda.");
      console.error("New chat error:", error);
    }
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    toggleSidebar();
  };

  const handleDeleteChat = () => {
    setShowMenu(false);
    // Prevent deleting the very last chat session
    if (allChats.length <= 1) {
      Alert.alert(
        "Tidak dapat menghapus",
        "Anda tidak dapat menghapus satu-satunya percakapan yang tersisa."
      );
      return;
    }

    Alert.alert(
      "Hapus Riwayat Percakapan",
      "Tindakan ini akan menghapus percakapan ini secara permanen. Anda tidak dapat mengurungkannya.",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        { 
          text: "Hapus", 
          onPress: () => {
            const remainingChats = allChats.filter(chat => chat.id !== activeChatId);
            
            setAllChats(remainingChats);

            // Set active chat to the most recent one after deletion
            if (remainingChats.length > 0) {
              setActiveChatId(remainingChats[0].id);
            }
          },
          style: 'destructive' 
        }
      ],
      { cancelable: true }
    );
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isBot ? styles.botMessage : styles.userMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.isBot ? styles.botMessageText : styles.userMessageText
      ]}>
        {item.text}
      </Text>
    </View>
  );

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => handleSelectChat(item.id)}>
      <View style={styles.historyContent}>
        <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.historySubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      <Text style={styles.historyTime}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
    </TouchableOpacity>
  );

  // Conditional rendering for the main component
  if (isInitializing) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#2ABF83" />
        <Text style={styles.loadingText}>Memulai Sesi Chat...</Text>
      </SafeAreaView>
    );
  }

  if (initializationFailed) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <Ionicons name="cloud-offline-outline" size={60} color="#888" />
        <Text style={styles.errorText}>Gagal Terhubung ke Server</Text>
        <Text style={styles.errorSubText}>Pastikan backend Anda berjalan dan alamat IP sudah benar.</Text>
        <Button title="Coba Lagi" onPress={initializeChat} color="#2ABF83" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.finMateText}>FinMate</Text>
          </View>
          
          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <FlatList
          ref={scrollViewRef}
          data={activeChat?.messages || []}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Tanyakan tentang keuangan anda"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic" size={20} color="#2ABF83" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Sidebar and Modals remain the same */}
      {/* Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          { transform: [{ translateX: sidebarAnimation }] }
        ]}
      >
        <View style={styles.sidebarHeader}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNewChat}>
            <Ionicons name="create-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sidebarTitle}>History chatbot</Text>
        
        <FlatList
          data={allChats}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id.toString()}
          style={styles.historyList}
        />
      </Animated.View>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <TouchableOpacity 
          style={styles.sidebarOverlay}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="archive-outline" size={20} color="#333" />
              <Text style={styles.menuText}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteChat}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.menuText, { color: '#FF3B30' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 80,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  errorSubText: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  finMateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ABF83',
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingTop: 16,
    paddingBottom: 10, 
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  botMessage: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
  },
  userMessage: {
    backgroundColor: '#2ABF83',
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 15,
  },
  botMessageText: {
    color: '#333',
  },
  userMessageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: 'white',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    minHeight: 24,
    maxHeight: 100,
    fontSize: 15,
  },
  micButton: {
    marginLeft: 8,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#2ABF83',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  historyTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 150,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default ChatbotScreen;