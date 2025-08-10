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
  const [showCoach, setShowCoach] = useState(false);
  const AGENT_ID = (Constants?.expoConfig?.extra as any)?.elevenAgentId;
  const colorScheme = useColorScheme();

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
          Talk naturally with your mental wellness coach
        </ThemedText>
      </View>
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

        {/* Conversation Controls */}
        <View style={styles.controlsContainer}>
          {conversation.status !== "connected" ? (
            <TouchableOpacity
              style={[
                styles.mainButton,
                { 
                  backgroundColor: conversation.status === "connecting" 
                    ? Colors[colorScheme ?? "light"].icon 
                    : Colors[colorScheme ?? "light"].tint 
                },
              ]}
              onPress={conversation.start}
              disabled={conversation.status === "connecting"} // ADD THIS LINE
            >
              <ThemedText style={styles.buttonText}>
                {conversation.status === "connecting" ? "Connecting..." : "Start Conversation"}
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.mainButton, { backgroundColor: "#dc3545" }]}
              onPress={conversation.stop}
            >
              <ThemedText style={styles.buttonText}>
                End Conversation
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.instructionText}>
            {conversation.status === "connected"
              ? "Speak naturally - the AI can hear you!"
              : "Press 'Start Conversation' to begin talking with your AI coach"}
          </ThemedText>
        </View>
      </View>
      {/* Convai Widget (WebView). Keep visible so user can tap mic. */}
      {showCoach && <AgentWidget agentId={AGENT_ID} visible={false} onClose={function (): void {
        throw new Error("Function not implemented.");
      } } />}
      
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
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  speakingText: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "600",
  },
  errorText: {
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },
  controlsContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  mainButton: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 200,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black", // This should be white, but let's make it more explicit
  },
  instructionsContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  instructionText: {
    textAlign: "center",
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 24,
  },
  recordButtonText: { fontSize: 32 },
  recordHint: { marginTop: 12, fontSize: 14, opacity: 0.7 },
});
