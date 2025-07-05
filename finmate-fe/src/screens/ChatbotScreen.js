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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const ChatbotScreen = ({ navigation }) => {
  const [allChats, setAllChats] = useState([
    {
      id: `chat_${Date.now()}`,
      title: `Percakapan Awal`,
      subtitle: 'Selamat Pagi, Mujadid',
      timestamp: new Date(),
      messages: [
        {
          id: 1,
          text: 'Selamat Pagi, Mujadid',
          isBot: true,
          timestamp: new Date(),
        },
      ],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(allChats[0].id);
  const [inputText, setInputText] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const sidebarAnimation = useRef(new Animated.Value(-width * 0.8)).current;
  const scrollViewRef = useRef();

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

  const sendMessage = () => {
    if (inputText.trim() && activeChatId) {
      const newMessage = {
        id: Date.now(),
        text: inputText,
        isBot: false,
        timestamp: new Date(),
      };
      
      const botResponse = {
        id: Date.now() + 1,
        text: 'Hai FinMate, ini adalah respons otomatis.',
        isBot: true,
        timestamp: new Date(),
      };
      
      const updatedChats = allChats.map(chat => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage, botResponse],
            subtitle: inputText,
            timestamp: new Date(),
          };
        }
        return chat;
      });

      setAllChats(updatedChats.sort((a, b) => b.timestamp - a.timestamp));
      setInputText('');
    }
  };

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
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
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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