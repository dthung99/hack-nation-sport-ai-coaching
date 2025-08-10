// app/(tabs)/index.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useElevenConversation } from "@/hooks/useElevenConversation";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  // ElevenLabs conversation hook
  const conversation = useElevenConversation({
    usePublicAgent: true,
    publicAgentId: "agent_0701k284yrmjfgksrhc5cw0wg2em",
  });

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">AI Coach</ThemedText>
        <ThemedText style={styles.subtitle}>
          Talk naturally with your mental wellness coach
        </ThemedText>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Status Display */}
        <View style={styles.statusContainer}>
          <ThemedText style={styles.statusText}>
            Status: {conversation.status}
          </ThemedText>
          {conversation.isSpeaking && (
            <ThemedText style={styles.speakingText}>
              🎤 AI is speaking...
            </ThemedText>
          )}
        </View>

        {/* Error Display */}
        {conversation.error ? (
          <ThemedText style={styles.errorText}>{conversation.error}</ThemedText>
        ) : null}

        {/* Conversation Controls */}
        <View style={styles.controlsContainer}>
          {conversation.status !== "connected" ? (
            <TouchableOpacity
              style={[
                styles.mainButton,
                { backgroundColor: Colors[colorScheme ?? "light"].tint },
              ]}
              onPress={conversation.start}
            >
              <ThemedText style={styles.buttonText}>
                Start Conversation
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
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
    color: "white",
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
});
