// app/(tabs)/persona-selector.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMultiAgentHandoff } from "@/hooks/useMultiAgentHandoff";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, FlatList, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isLargeScreen = screenWidth > 1024;

interface Coach {
  id: string;
  name: string;
  description: string;
  emoji: string;
  specialties: string[];
  samplePhrase: string;
}

const coaches: Coach[] = [
  {
    id: "ted",
    name: "Ted",
    description: "Mindset & Mental Performance Coach",
    emoji: "🧠",
    specialties: ["Mental Preparation", "Anxiety Management", "Confidence Building", "Focus Training"],
    samplePhrase: "I'm feeling nervous about my upcoming competition"
  },
  {
    id: "willis",
    name: "Willis",
    description: "Strategy & Tactical Coach",
    emoji: "🎯",
    specialties: ["Game Strategy", "Tactical Planning", "Competitive Analysis", "Performance Optimization"],
    samplePhrase: "I need help developing a strategy for my next match"
  },
  {
    id: "amelie",
    name: "Amelie",
    description: "Physical Training & Conditioning Coach",
    emoji: "💪",
    specialties: ["Fitness Training", "Strength & Conditioning", "Recovery", "Endurance Building"],
    samplePhrase: "I want to improve my physical conditioning and strength"
  }
];

export default function CoachScreen() {
  const colorScheme = useColorScheme();
  
  // Use the same working multi-agent setup from the demo
  const convo = useMultiAgentHandoff({
    debug: true,
    agents: [
      {
        key: 'ted',
        agentId: 'agent_0701k284yrmjfgksrhc5cw0wg2em',
        displayName: 'Ted (Inner State Coach)',
        handoffTriggerKeywords: ['calm', 'breathe', 'mindful', 'anxious', 'nervous', 'focus', 'confidence', 'inner game'],
        styleInstructions: 'You are Ted, focused on inner-state coaching: mindset, breathing, visualization, and emotional regulation. When users ask about strategy, tactics, or game plans, suggest they might benefit from Willis\'s tactical expertise. When users ask about physical training, conditioning, or fitness, suggest they might benefit from Amelie\'s physical training expertise.'
      },
      {
        key: 'willis',
        agentId: 'agent_7501k285xty6e51rz4hk4nr3g5ee',
        displayName: 'Willis (Strategy Coach)',
        handoffTriggerKeywords: ['strategy', 'tactics', 'game plan', 'opponent', 'technique', 'execution', 'performance', 'winning'],
        styleInstructions: 'You are Willis, focused on tactical strategy, game plans, and performance execution. When users need emotional support or inner game work, suggest they might benefit from Ted\'s mindset coaching. When users ask about physical training or fitness, suggest they might benefit from Amelie\'s physical training expertise.'
      },
      {
        key: 'amelie',
        agentId: 'agent_5901k29tz6hpe0xamjsfc5vxdpwr',
        displayName: 'Amelie (Physical Training Coach)',
        handoffTriggerKeywords: ['training', 'fitness', 'conditioning', 'strength', 'endurance', 'workout', 'exercise', 'physical', 'stamina', 'recovery'],
        styleInstructions: 'You are Amelie, focused on physical training, conditioning, fitness, and athletic performance. When users need emotional support or mental game work, suggest they might benefit from Ted\'s mindset coaching. When users ask about tactical strategy or game plans, suggest they might benefit from Willis\'s strategic expertise.'
      }
    ],
    initialAgentKey: 'ted'
  });

  const startWithCoach = (coachId: string) => {
    console.log('Starting with coach:', coachId);
    if (convo.status !== 'connected') {
      convo.start();
      setTimeout(() => {
        convo.handoffTo(coachId, 'User selected coach');
      }, 1500);
    } else {
      convo.handoffTo(coachId, 'User selected coach');
    }
  };

  const tryCoachPhrase = (phrase: string) => {
    console.log('Trying phrase:', phrase);
    if (convo.status !== 'connected') {
      convo.start();
      setTimeout(() => {
        convo.sendText(phrase);
      }, 1500);
    } else {
      convo.sendText(phrase);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">AI Coaching Team</ThemedText>
        <ThemedText style={styles.subtitle}>
          {convo.status === 'connected' ? 
            `Connected with ${convo.currentAgentKey || 'Coach'}` : 
            'Choose your coach or let them hand off naturally'
          }
        </ThemedText>
        {convo.error && <ThemedText style={styles.error}>Error: {convo.error}</ThemedText>}
      </View>

      {/* Connection Status & Controls */}
      <View style={styles.controlsSection}>
        <TouchableOpacity 
          style={[styles.connectionButton, { 
            backgroundColor: convo.status === 'connected' 
              ? '#e74c3c' 
              : Colors[colorScheme ?? 'light'].tint 
          }]} 
          onPress={() => convo.status === 'connected' ? convo.stop() : convo.start()}
        >
          <ThemedText style={styles.connectionButtonText}>
            {convo.status === 'connected' ? '🔴 Stop Conversation' : '🎤 Start Conversation'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Coach Cards */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.coachGrid}>
        {coaches.map((coach) => (
          <View
            key={coach.id}
            style={[
              styles.coachCard,
              convo.currentAgentKey === coach.id && {
                backgroundColor: Colors[colorScheme ?? "light"].tint,
                opacity: 0.9,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <ThemedText style={styles.emoji}>{coach.emoji}</ThemedText>
              <View style={styles.cardContent}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.coachName,
                    convo.currentAgentKey === coach.id && { color: "white" },
                  ]}
                >
                  {coach.name}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.description,
                    convo.currentAgentKey === coach.id && {
                      color: "white",
                      opacity: 0.9,
                    },
                  ]}
                >
                  {coach.description}
                </ThemedText>
                
                {/* Specialties */}
                <View style={styles.specialtiesContainer}>
                  {coach.specialties.slice(0, isTablet ? 4 : 2).map((specialty, index) => (
                    <View key={index} style={[
                      styles.specialtyTag,
                      convo.currentAgentKey === coach.id && { backgroundColor: "rgba(255,255,255,0.2)" }
                    ]}>
                      <ThemedText style={[
                        styles.specialtyText,
                        convo.currentAgentKey === coach.id && { color: "white" }
                      ]}>
                        {specialty}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor:
                      convo.currentAgentKey === coach.id
                        ? "rgba(255,255,255,0.2)"
                        : Colors[colorScheme ?? "light"].tint,
                  },
                ]}
                onPress={() => startWithCoach(coach.id)}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[
                    styles.actionButtonText,
                    { color: "white" }
                  ]}
                >
                  {convo.status === 'connected' && convo.currentAgentKey === coach.id ? 'Active' : `Start with ${coach.name}`}
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.secondaryButton,
                  {
                    backgroundColor:
                      convo.currentAgentKey === coach.id
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.1)",
                  },
                ]}
                onPress={() => tryCoachPhrase(coach.samplePhrase)}
                activeOpacity={0.8}
              >
                <ThemedText
                  style={[
                    styles.actionButtonText,
                    styles.secondaryButtonText,
                    convo.currentAgentKey === coach.id && { color: "white" }
                  ]}
                >
                  Try Sample
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        </View>
      </ScrollView>

      {/* Conversation Transcript */}
      {convo.transcript.length > 0 && (
        <View style={styles.transcriptSection}>
          <ThemedText style={styles.transcriptTitle}>Recent Conversation</ThemedText>
          <FlatList
            data={convo.transcript.slice(-3)}
            keyExtractor={(item) => item.id}
            style={styles.miniTranscript}
            renderItem={({ item }) => (
              <View style={styles.miniMessageRow}>
                <ThemedText style={[styles.miniSender, item.sender === 'user' ? styles.miniUser : styles.miniAgent]}>
                  {item.sender === 'user' ? 'You' : (item.agentKey ? `${item.agentKey}` : 'Coach')}:
                </ThemedText>
                <ThemedText style={styles.miniMessage} numberOfLines={2}>
                  {item.text}
                </ThemedText>
              </View>
            )}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: isTablet ? 80 : 60,
  },
  header: {
    padding: isTablet ? 30 : 20,
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
    fontSize: isTablet ? 16 : 14,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
    fontSize: isTablet ? 14 : 12,
  },
  controlsSection: {
    paddingHorizontal: isTablet ? 30 : 20,
    paddingBottom: 10,
  },
  connectionButton: {
    paddingVertical: isTablet ? 15 : 12,
    paddingHorizontal: isTablet ? 25 : 20,
    borderRadius: isTablet ? 25 : 20,
    alignItems: 'center',
  },
  connectionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: isTablet ? 18 : 16,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: isTablet ? 30 : 20,
  },
  scrollContent: {
    paddingBottom: isTablet ? 40 : 20,
  },
  coachGrid: {
    flexDirection: isLargeScreen ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: isTablet ? 15 : 10,
    justifyContent: isLargeScreen ? 'space-between' : 'flex-start',
  },
  coachCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: isTablet ? 20 : 16,
    padding: isTablet ? 25 : 20,
    marginVertical: isLargeScreen ? 0 : (isTablet ? 10 : 8),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: isLargeScreen ? '48%' : '100%',
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: isTablet ? 20 : 15,
  },
  emoji: {
    fontSize: isTablet ? 50 : 40,
    marginRight: isTablet ? 20 : 15,
  },
  cardContent: {
    flex: 1,
  },
  coachName: {
    fontSize: isTablet ? 22 : 18,
    marginBottom: isTablet ? 8 : 5,
  },
  description: {
    fontSize: isTablet ? 16 : 14,
    opacity: 0.7,
    marginBottom: isTablet ? 15 : 10,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isTablet ? 8 : 6,
  },
  specialtyTag: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 6 : 4,
    borderRadius: isTablet ? 10 : 8,
  },
  specialtyText: {
    fontSize: isTablet ? 14 : 12,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: isTablet ? 12 : 10,
    marginTop: isTablet ? 20 : 15,
  },
  actionButton: {
    flex: isTablet ? 1 : undefined,
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? 18 : 15,
    borderRadius: isTablet ? 15 : 12,
    alignItems: 'center',
    minHeight: isTablet ? 50 : 40,
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  actionButtonText: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#333',
  },
  transcriptSection: {
    maxHeight: isTablet ? 150 : 120,
    paddingHorizontal: isTablet ? 30 : 20,
    paddingVertical: isTablet ? 15 : 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  transcriptTitle: {
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    marginBottom: isTablet ? 12 : 8,
    opacity: 0.7,
  },
  miniTranscript: {
    maxHeight: isTablet ? 100 : 80,
  },
  miniMessageRow: {
    marginBottom: isTablet ? 6 : 4,
  },
  miniSender: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  miniUser: {
    color: '#2196F3',
  },
  miniAgent: {
    color: '#4CAF50',
  },
  miniMessage: {
    fontSize: isTablet ? 14 : 12,
    opacity: 0.7,
    paddingLeft: isTablet ? 12 : 8,
  },
});
