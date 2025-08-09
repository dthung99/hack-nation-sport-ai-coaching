import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react"; // Add useEffect import
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // Add permission state
  const colorScheme = useColorScheme();

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      console.log("Requesting permissions..");
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        setHasPermission(true);
        console.log("Audio permission granted");
      } else {
        setHasPermission(false);
        Alert.alert(
          "Permission required",
          "Please grant microphone permission to use voice chat"
        );
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setHasPermission(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      if (isRecording) {
        console.log("Already recording");
        return;
      }

      // Check if we have permission before proceeding
      if (!hasPermission) {
        Alert.alert(
          "Permission required",
          "Please grant microphone permission to use voice chat"
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
      // Alert.alert("Error", "Failed to start recording");
    }
  };

  const handleStopRecording = async () => {
    console.log("Stopping recording..");
    setIsRecording(false);

    if (!recording) {
      return;
    }

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);
      setRecording(null);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `Audio recorded (${Math.floor(Math.random() * 5) + 1}s)`,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // TODO: Process audio file here
      console.log("Audio file ready for API:", uri);

      // Mock AI response after 1 second
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I hear you! This is where the AI response would go after processing your audio.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 1000);
    } catch (error) {
      console.error("Error stopping recording:", error);
      // Alert.alert("Error", "Failed to stop recording");
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <ThemedText
        style={[
          styles.messageText,
          message.isUser ? { color: "#fff" } : { color: "#333" },
        ]}
      >
        {message.text}
      </ThemedText>
      <ThemedText
        style={[
          styles.timestamp,
          message.isUser ? { color: "#fff" } : { color: "#666" },
        ]}
      >
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </ThemedText>
    </View>
  );

  // Show loading state while checking permissions
  if (hasPermission === null) {
    return (
      <ThemedView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ThemedText>Requesting microphone permission...</ThemedText>
      </ThemedView>
    );
  }

  // Show permission denied state
  if (hasPermission === false) {
    return (
      <ThemedView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <ThemedText
          type="title"
          style={{ textAlign: "center", marginBottom: 20 }}
        >
          Microphone Permission Required
        </ThemedText>
        <ThemedText
          style={{ textAlign: "center", marginBottom: 30, opacity: 0.7 }}
        >
          This app needs microphone access to record your voice messages for the
          AI coach.
        </ThemedText>
        <TouchableOpacity
          style={[
            styles.recordButton,
            { backgroundColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={requestPermissions}
        >
          <Text style={styles.recordButtonText}>🎤</Text>
        </TouchableOpacity>
        <ThemedText style={styles.recordHint}>
          Tap to grant permission
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">AI Coach</ThemedText>
        <ThemedText style={styles.subtitle}>
          Hold the button to talk with your mental wellness coach
        </ThemedText>
      </View>

      {/* Chat Messages */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Press and hold the microphone to start your conversation
            </ThemedText>
          </View>
        ) : (
          messages.map(renderMessage)
        )}
      </ScrollView>

      {/* Record Button */}
      <View style={styles.recordSection}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording
                ? Colors[colorScheme ?? "light"].tint
                : Colors[colorScheme ?? "light"].icon,
            },
          ]}
          onPressIn={handleStartRecording}
          onPressOut={handleStopRecording}
          activeOpacity={0.8}
        >
          <Text style={styles.recordButtonText}>
            {isRecording ? "🔴" : "🎤"}
          </Text>
        </TouchableOpacity>
        <ThemedText style={styles.recordHint}>
          {isRecording ? "Recording..." : "Hold to record"}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    fontSize: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0a7ea4",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  recordSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingBottom: 40,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recordButtonText: {
    fontSize: 32,
  },
  recordHint: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
  },
});
