import AgentWidget from "@/components/AgentWeb"; // ⬅️ the Convai widget wrapper
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Constants from "expo-constants";
import React, { useEffect, useRef, useState } from "react";
import { useElevenConversation } from "@/hooks/useElevenConversation";
import { Audio } from "expo-av";
import { useEffect, useState } from "react"; // Add useEffect import
import {
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
  const [showCoach, setShowCoach] = useState(true); // ⬅️ toggle widget visibility
  const colorScheme = useColorScheme();
  const scrollRef = useRef<ScrollView>(null);

  const AGENT_ID =
    (Constants?.expoConfig?.extra as any)?.elevenAgentId ??
    "agent_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // fallback for dev
  // ElevenLabs conversation hook (configure as needed)
  const conversation = useElevenConversation({
    usePublicAgent: true, // set false and implement backend for private agents
    publicAgentId: "agent_0701k284yrmjfgksrhc5cw0wg2em",
    signedUrlEndpoint: "/api/signed-url",
  });

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

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

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

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">AI Coach</ThemedText>
        <ThemedText style={styles.subtitle}>
          Tap the floating mic to talk with your mindfulness coach
        </ThemedText>
        {/* Conversation controls */}
        <View style={styles.conversationRow}>
          {conversation.status !== "connected" ? (
            <TouchableOpacity style={styles.convButton} onPress={conversation.start}>
              <Text style={styles.convButtonLabel}>Start Conversation</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.convButton} onPress={conversation.stop}>
              <Text style={styles.convButtonLabel}>End Conversation</Text>
            </TouchableOpacity>
          )}
        </View>
        {conversation.error ? (
          <ThemedText style={styles.errorText}>{conversation.error}</ThemedText>
        ) : null}
        <ThemedText style={styles.statusText}>
          Status: {conversation.status} | Speaking: {conversation.isSpeaking ? "Yes" : "No"}
        </ThemedText>
      </View>

      {/* Chat Messages (optional log for later features) */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Use the coach bubble below. We’ll add transcripts here later.
            </ThemedText>
          </View>
        ) : (
          messages.map(renderMessage)
        )}
      </ScrollView>

      {/* Toggle Coach (shows/hides the widget) */}
      <View style={styles.recordSection}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            {
              backgroundColor: showCoach
                ? Colors[colorScheme ?? "light"].tint
                : Colors[colorScheme ?? "light"].icon,
            },
          ]}
          onPress={() => setShowCoach((v) => !v)}
          activeOpacity={0.9}
        >
          <Text style={styles.recordButtonText}>
            {showCoach ? "🟢" : "🎤"}
          </Text>
        </TouchableOpacity>
        <ThemedText style={styles.recordHint}>
          {showCoach ? "Coach visible • tap the bubble" : "Show coach"}
        </ThemedText>
      </View>

      {/* Convai Widget (WebView). Keep visible so user can tap mic. */}
      {showCoach && <AgentWidget agentId={AGENT_ID} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { padding: 20, alignItems: "center" },
  subtitle: { textAlign: "center", marginTop: 8, opacity: 0.7 },
  chatContainer: { flex: 1, paddingHorizontal: 20 },
  chatContent: { paddingBottom: 20 },
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  conversationRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  convButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  convButtonLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    marginTop: 8,
    color: 'red',
    textAlign: 'center',
  },
  statusText: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
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
  emptyText: { textAlign: "center", opacity: 0.6, fontSize: 16 },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#0a7ea4" },
  aiMessage: { alignSelf: "flex-start", backgroundColor: "#f0f0f0" },
  messageText: { fontSize: 16 },
  timestamp: { fontSize: 12, opacity: 0.7, marginTop: 4 },
  recordSection: { alignItems: "center", paddingVertical: 30, paddingBottom: 40 },
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
  recordButtonText: { fontSize: 32 },
  recordHint: { marginTop: 12, fontSize: 14, opacity: 0.7 },
});
