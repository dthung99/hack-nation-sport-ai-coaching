import AgentWidget from "@/components/AgentWeb";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Constants from "expo-constants";
import React, { useEffect, useRef, useState } from "react";
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
  const [showCoach, setShowCoach] = useState(true); // toggle widget visibility
  const colorScheme = useColorScheme();
  const scrollRef = useRef<ScrollView>(null);

  const AGENT_ID =
    (Constants?.expoConfig?.extra as any)?.elevenAgentId ??
    "agent_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // fallback for dev

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
      </View>

      {/* Chat Messages (optional for future transcripts) */}
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