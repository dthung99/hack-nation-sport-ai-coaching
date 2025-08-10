// app/(tabs)/motivation-dashboard.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";

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

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isLargeScreen = screenWidth > 1024;

export default function MotivationDashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = (colorScheme ?? 'light') === 'dark';
  const palette = React.useMemo(()=>({
    accent: isDark ? '#0a84ff' : Colors[colorScheme ?? 'light'].tint,
    surface: isDark ? '#1F2223' : '#f5f5f5',
    surfaceAlt: isDark ? '#242728' : '#ffffff',
    tag: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    border: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
    muted: isDark ? 'rgba(255,255,255,0.68)' : '#333'
  }),[isDark,colorScheme]);

  const handleCardPress = (card: SummaryCard) => {
    // TODO: Navigate to detailed view or replay related session
    console.log("Card pressed:", card.title);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.contentWrapper,{ paddingHorizontal:isLargeScreen?48:(isTablet?36:20) }]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
          <ThemedText style={[styles.subtitle,{ color: palette.muted }]}>Track your mental wellness journey</ThemedText>
        </View>
        {/* Summary Cards */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Your Progress
          </ThemedText>
          {mockData.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.summaryCard,{ backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}
              onPress={() => handleCardPress(card)}
            >
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardEmoji}>{card.emoji}</ThemedText>
                <View style={styles.cardContent}>
                  <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                    {card.title}
                  </ThemedText>
                  <ThemedText style={[styles.cardValue,{ color: palette.accent }]}>{card.value}</ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.cardDescription,{ color: palette.muted }]}>
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
      { backgroundColor: palette.accent },
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
            <TouchableOpacity key={index} style={[styles.topicItem,{ backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}> 
              <ThemedText style={[styles.topicText,{ color: palette.muted }]}>{`• ${topic}`}</ThemedText>
              <ThemedText style={[styles.topicAction,{ color: palette.accent }]}>Replay →</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1,paddingTop:isTablet?72:56 },
  contentWrapper:{ width:'100%',maxWidth:1100,alignSelf:'center',paddingBottom:48 },
  header: {
    paddingVertical:8,
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    marginBottom: 15,
    paddingLeft: 5,
  },
  summaryCard: {
    borderRadius: 18,
    padding: isTablet?24:18,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth:1,
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
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  graphPlaceholder: {
    height: 150,
  borderRadius: 24,
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
  topicItem:{ flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,paddingHorizontal:18,borderRadius:12,marginBottom:8,borderWidth:1 },
  topicText: {
    flex: 1,
    fontSize: 15,
  },
  topicAction: {
    fontSize: 14,
    fontWeight: "500",
  },
});
