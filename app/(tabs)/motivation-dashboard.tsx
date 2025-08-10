// app/(tabs)/motivation-dashboard.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface SummaryCard {
  title: string;
  value: string;
  emoji: string;
  description: string;
}

const mockData: SummaryCard[] = [
  {
    title: "Mood Trend",
    value: "↗️ Improving",
    emoji: "😊",
    description: "Your mood has been trending upward this week",
  },
  {
    title: "Motivation Score",
    value: "8.2/10",
    emoji: "💪",
    description: "Strong motivation levels maintained",
  },
  {
    title: "Recent Sessions",
    value: "5 this week",
    emoji: "🎯",
    description: "Great consistency with your wellness practice",
  },
];

const recentTopics = [
  "Handling pre-game nerves",
  "Building confidence",
  "Recovery mindset",
];

export default function MotivationDashboardScreen() {
  const colorScheme = useColorScheme();

  const handleCardPress = (card: SummaryCard) => {
    // TODO: Navigate to detailed view or replay related session
    console.log("Card pressed:", card.title);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Dashboard</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your mental wellness journey
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Your Progress
          </ThemedText>
          {mockData.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={styles.summaryCard}
              onPress={() => handleCardPress(card)}
            >
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardEmoji}>{card.emoji}</ThemedText>
                <View style={styles.cardContent}>
                  <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                    {card.title}
                  </ThemedText>
                  <ThemedText style={styles.cardValue}>{card.value}</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.cardDescription}>
                {card.description}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mood Graph Placeholder */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Mood Over Time
          </ThemedText>
          <View
            style={[
              styles.graphPlaceholder,
              { backgroundColor: Colors[colorScheme ?? "light"].tint },
            ]}
          >
            <ThemedText style={styles.graphText}>
              📈 Mood tracking chart
            </ThemedText>
            <ThemedText style={[styles.graphSubtext, { color: "white" }]}>
              Visual representation of your emotional journey
            </ThemedText>
          </View>
        </View>

        {/* Recent Topics */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Discussion Topics
          </ThemedText>
          {recentTopics.map((topic, index) => (
            <TouchableOpacity key={index} style={styles.topicItem}>
              <ThemedText style={styles.topicText}>• {topic}</ThemedText>
              <ThemedText style={styles.topicAction}>Replay →</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    marginBottom: 15,
    paddingLeft: 5,
  },
  summaryCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0a7ea4",
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  graphPlaceholder: {
    height: 150,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.8,
  },
  graphText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  graphSubtext: {
    fontSize: 14,
    opacity: 0.9,
  },
  topicItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 8,
  },
  topicText: {
    flex: 1,
    fontSize: 15,
  },
  topicAction: {
    fontSize: 14,
    color: "#0a7ea4",
    fontWeight: "500",
  },
});
