// app/(tabs)/index.tsx (My Coach Team)
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useMultiAgentHandoff } from "@/hooks/useMultiAgentHandoff";
import React from "react";
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
	{ id: "ted", name: "Ted", description: "Mindset & Mental Performance Coach", emoji: "🧠", specialties: ["Mental Preparation", "Anxiety Management", "Confidence Building", "Focus Training"], samplePhrase: "I'm feeling nervous about my upcoming competition" },
	{ id: "willis", name: "Willis", description: "Strategy & Tactical Coach", emoji: "🎯", specialties: ["Game Strategy", "Tactical Planning", "Competitive Analysis", "Performance Optimization"], samplePhrase: "I need help developing a strategy for my next match" },
	{ id: "amelie", name: "Amelie", description: "Physical Training & Conditioning Coach", emoji: "💪", specialties: ["Fitness Training", "Strength & Conditioning", "Recovery", "Endurance Building"], samplePhrase: "I want to improve my physical conditioning and strength" }
];

export default function MyCoachTeamScreen() {
	const colorScheme = useColorScheme();
	const convo = useMultiAgentHandoff({
		debug: true,
		agents: [
			{ key: 'ted', agentId: 'agent_0701k284yrmjfgksrhc5cw0wg2em', displayName: 'Ted (Inner State Coach)', handoffTriggerKeywords: ['calm','breathe','mindful','anxious','nervous','focus','confidence','inner game'], styleInstructions: 'You are Ted, focused on inner-state coaching: mindset, breathing, visualization, and emotional regulation. When users ask about strategy, tactics, or game plans, suggest they might benefit from Willis\'s tactical expertise. When users ask about physical training, conditioning, or fitness, suggest they might benefit from Amelie\'s physical training expertise.' },
			{ key: 'willis', agentId: 'agent_7501k285xty6e51rz4hk4nr3g5ee', displayName: 'Willis (Strategy Coach)', handoffTriggerKeywords: ['strategy','tactics','game plan','opponent','technique','execution','performance','winning'], styleInstructions: 'You are Willis, focused on tactical strategy, game plans, and performance execution. When users need emotional support or inner game work, suggest they might benefit from Ted\'s mindset coaching. When users ask about physical training or fitness, suggest they might benefit from Amelie\'s physical training expertise.' },
			{ key: 'amelie', agentId: 'agent_5901k29tz6hpe0xamjsfc5vxdpwr', displayName: 'Amelie (Physical Training Coach)', handoffTriggerKeywords: ['training','fitness','conditioning','strength','endurance','workout','exercise','physical','stamina','recovery'], styleInstructions: 'You are Amelie, focused on physical training, conditioning, fitness, and athletic performance. When users need emotional support or mental game work, suggest they might benefit from Ted\'s mindset coaching. When users ask about tactical strategy or game plans, suggest they might benefit from Willis\'s strategic expertise.' }
		],
		initialAgentKey: 'ted'
	});

	// Theme-adaptive palette (keeps existing Colors but fixes hard-coded light values for dark mode)
	const isDark = (colorScheme ?? 'light') === 'dark';
	const palette = React.useMemo(()=>({
		surface: isDark ? '#1F2223' : '#f5f5f5',
		surfaceAlt: isDark ? '#242728' : '#ffffff',
		tagBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
		tagBgActive: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.2)',
		border: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)',
		transcriptBg: isDark ? '#1F2223' : '#fcfcfc',
		connectionBarBg: isDark ? '#242728' : '#fff',
		secondaryButtonBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
		badgeBg: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.3)',
		activeAccent: isDark ? '#0a84ff' : Colors[colorScheme ?? 'light'].tint,
		activeAccentOn: '#ffffff',
		mutedText: isDark ? 'rgba(255,255,255,0.68)' : '#333',
		mutedTextStrong: isDark ? 'rgba(255,255,255,0.78)' : '#555'
	}),[isDark,colorScheme]);

	const startWithCoach = (coachId: string) => {
		if (convo.status !== 'connected') {
			convo.start();
			setTimeout(() => { convo.handoffTo(coachId, 'User selected coach'); }, 1500);
		} else {
			convo.handoffTo(coachId, 'User selected coach');
		}
	};
	// Removed sample phrase trigger UI; keep function if future quick prompts reinstated
	const tryCoachPhrase = React.useCallback((phrase: string) => {
		if (!phrase) return;
		if (convo.status !== 'connected') {
			convo.start();
			setTimeout(() => { convo.sendText(phrase); }, 1500);
		} else { convo.sendText(phrase); }
	},[convo]);

	return (
		<ThemedView style={styles.container}>
			<View style={styles.contentWrapper}>
				<View style={styles.header}>
					<ThemedText type="title">MindCoach AI</ThemedText>
					<ThemedText style={styles.subtitle}>
						{convo.status === 'connected' ? `Connected with ${convo.currentAgentKey || 'Coach'}` : 'Choose your coach or let them hand off naturally'}
					</ThemedText>
					{convo.error && <ThemedText style={styles.error}>Error: {convo.error}</ThemedText>}
				</View>
				<View style={styles.controlsSection}>
					<View style={[styles.connectionBar,{ backgroundColor: palette.connectionBarBg, borderColor: palette.border, borderWidth: isDark?1:0 }] }>
						<TouchableOpacity
							style={[styles.connectionButton,{ backgroundColor: convo.status === 'connected' ? '#d84242' : palette.activeAccent }]}
							onPress={() => convo.status === 'connected' ? convo.stop() : convo.start()}
						>
							<ThemedText style={styles.connectionButtonText}>{convo.status === 'connected' ? 'Stop Conversation' : 'Start Conversation'}</ThemedText>
						</TouchableOpacity>
						<View style={styles.sessionMeta}> 
							<ThemedText style={styles.sessionMetaText} numberOfLines={1}>
								{convo.status === 'connected' ? (convo.lastSwitch ? `Active: ${convo.currentAgentKey} • Last: ${convo.lastSwitch.metaType}` : `Active: ${convo.currentAgentKey}`) : 'Idle'}
							</ThemedText>
						</View>
					</View>
				</View>
				<View style={[styles.mainRow,(isTablet || isLargeScreen) && styles.mainRowWide]}>
					<View style={styles.leftColumn}>
						<ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
							<View style={styles.coachGrid}>
								{coaches.map(coach => (
									<View key={coach.id} style={[styles.coachCard,{ backgroundColor: palette.surface }, convo.currentAgentKey === coach.id && { backgroundColor: palette.activeAccent, opacity: 0.92 }]}> 
									{convo.currentAgentKey === coach.id && convo.lastSwitch?.to === coach.id && (
										<View style={[styles.switchBadge,{ backgroundColor: palette.badgeBg }]}> 
											<ThemedText style={styles.switchBadgeText}>
												{convo.lastSwitch.metaType === 'manual' && 'Manual switch'}
												{convo.lastSwitch.metaType === 'auto-keyword' && 'Keyword switch'}
												{convo.lastSwitch.metaType === 'agent-initiated' && 'Agent suggested'}
												{convo.lastSwitch.metaType === 'explicit-marker' && 'Marker switch'}
											</ThemedText>
										</View>
									)}
									<View style={styles.cardHeader}>
										<View style={styles.cardContent}>
											<ThemedText type="defaultSemiBold" style={[styles.coachName, convo.currentAgentKey === coach.id && { color: 'white' }]}>{coach.name}</ThemedText>
											<ThemedText style={[styles.description, convo.currentAgentKey === coach.id && { color: 'white', opacity: 0.9 }]}>{coach.description}</ThemedText>
											<View style={styles.specialtiesContainer}>
												{coach.specialties.slice(0, isTablet ? 4 : 2).map((s,i)=>(
													<View key={i} style={[styles.specialtyTag,{ backgroundColor: palette.tagBg }, convo.currentAgentKey === coach.id && { backgroundColor: palette.tagBgActive }]}> 
														<ThemedText style={[styles.specialtyText, convo.currentAgentKey === coach.id && { color: 'white' }]}>{s}</ThemedText>
													</View>
												))}
											</View>
										</View>
									</View>
									<View style={styles.actionButtons}>
										<TouchableOpacity style={[styles.actionButton, convo.currentAgentKey === coach.id ? styles.actionButtonActive : styles.actionButtonInactive]} onPress={()=>startWithCoach(coach.id)}>
											<ThemedText style={[styles.actionButtonText, convo.currentAgentKey === coach.id ? styles.actionButtonTextActive : undefined]}>{convo.status==='connected'&&convo.currentAgentKey===coach.id?'Active':`Start with ${coach.name}`}</ThemedText>
										</TouchableOpacity>
									</View>
								</View>
							))}
						</View>
					</ScrollView>
				</View>
					{(isTablet || isLargeScreen) && (
						<View style={styles.rightPanel}> 
						<ThemedText style={styles.rightPanelTitle}>Recent Conversation</ThemedText>
						{convo.lastSwitch && (
							<View style={styles.lastSwitchRow}>
									<ThemedText style={[styles.lastSwitchLabel,{ color: palette.mutedTextStrong }]}>Last Switch:</ThemedText>
									<ThemedText style={[styles.lastSwitchText,{ color: palette.mutedText }]} numberOfLines={3}>{convo.lastSwitch.from ? `${convo.lastSwitch.from} → `: ''}{convo.lastSwitch.to} · {convo.lastSwitch.metaType}{convo.lastSwitch.reason?` · ${convo.lastSwitch.reason}`:''}</ThemedText>
							</View>
						)}
							<FlatList data={convo.transcript.slice(-10)} keyExtractor={i=>i.id} style={[styles.sideTranscript,{ backgroundColor: palette.transcriptBg, borderColor: palette.border }]} contentContainerStyle={styles.sideTranscriptContent} renderItem={({item})=> (
								<View style={styles.sideMessageRow}>
									<ThemedText style={[styles.sideSender, item.sender==='user'?styles.miniUser:styles.miniAgent]}>{item.sender==='user'?'You':(item.agentKey?`${item.agentKey}`:'Coach')}:</ThemedText>
									<ThemedText style={[styles.sideMessage,{ color: palette.mutedText }]} numberOfLines={4}>{item.text}</ThemedText>
								</View>
							)} />
					</View>
				)}
				</View>
				{!isTablet && !isLargeScreen && convo.transcript.length>0 && (
						<View style={[styles.transcriptSection,{ backgroundColor: isDark ? '#1a1c1d' : '#fafafa', borderTopColor: palette.border }]}> 
						<ThemedText style={styles.transcriptTitle}>Recent Conversation</ThemedText>
						{convo.lastSwitch && (
							<View style={styles.lastSwitchRow}>
									<ThemedText style={[styles.lastSwitchLabel,{ color: palette.mutedTextStrong }]}>Last Switch:</ThemedText>
									<ThemedText style={[styles.lastSwitchText,{ color: palette.mutedText }]} numberOfLines={2}>{convo.lastSwitch.from ? `${convo.lastSwitch.from} → `: ''}{convo.lastSwitch.to} · {convo.lastSwitch.metaType}{convo.lastSwitch.reason?` · ${convo.lastSwitch.reason}`:''}</ThemedText>
							</View>
						)}
						<FlatList data={convo.transcript.slice(-3)} keyExtractor={i=>i.id} style={styles.miniTranscript} renderItem={({item})=>(
							<View style={styles.miniMessageRow}>
								<ThemedText style={[styles.miniSender, item.sender==='user'?styles.miniUser:styles.miniAgent]}>{item.sender==='user'?'You':(item.agentKey?`${item.agentKey}`:'Coach')}:</ThemedText>
									<ThemedText style={[styles.miniMessage,{ color: palette.mutedText }]} numberOfLines={2}>{item.text}</ThemedText>
							</View>
						)} />
					</View>
				)}
			</View>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container:{flex:1,paddingTop:isTablet?72:56},
	contentWrapper:{flex:1,width:'100%',maxWidth:1400,alignSelf:'center',paddingHorizontal:isLargeScreen?48:(isTablet?36:18),paddingBottom:32},
	mainRow:{flex:1,flexDirection:'column'},
	mainRowWide:{flexDirection:'row',gap:32},
	leftColumn:{flex:1},
	rightPanel:{width:isLargeScreen?260:(isTablet?240:0),paddingTop:4},
	rightPanelTitle:{fontSize:isTablet?18:16,fontWeight:'600',marginBottom:12,opacity:0.75},
	sideTranscript:{flex:1,borderWidth:1,borderColor:'rgba(0,0,0,0.08)',borderRadius:16,backgroundColor:'#fcfcfc'},
	sideTranscriptContent:{padding:14},
	sideMessageRow:{marginBottom:12},
	sideSender:{fontSize:isTablet?13:12,fontWeight:'600',marginBottom:2},
	sideMessage:{fontSize:isTablet?13:12,lineHeight:isTablet?18:16,opacity:0.75},
	header:{alignItems:'center',paddingTop:isTablet?8:4,paddingBottom:4},
	subtitle:{textAlign:'center',marginTop:6,opacity:0.68,fontSize:isTablet?16:14,maxWidth:640},
	error:{color:'red',textAlign:'center',marginTop:8,fontSize:isTablet?14:12},
	controlsSection:{paddingTop:8,paddingBottom:isTablet?24:18},
	connectionBar:{flexDirection:'row',alignItems:'center',borderRadius:48,paddingVertical:8,paddingHorizontal:12,alignSelf:'center',gap:16,shadowColor:'#000',shadowOpacity:0.07,shadowOffset:{width:0,height:4},shadowRadius:12,elevation:3,minWidth:isTablet?520:280},
	connectionButton:{paddingVertical:isTablet?14:10,paddingHorizontal:isTablet?30:22,borderRadius:32,alignItems:'center',justifyContent:'center',minWidth:isTablet?220:160,shadowColor:'#000',shadowOpacity:0.12,shadowOffset:{width:0,height:3},shadowRadius:6},
	connectionButtonText:{color:'white',fontWeight:'600',fontSize:isTablet?17:15,letterSpacing:0.25},
	sessionMeta:{flexShrink:1,maxWidth:260,paddingRight:8},
	sessionMetaText:{fontSize:12,opacity:0.65},
	scrollContainer:{flex:1},
	scrollContent:{paddingBottom:isTablet?56:32,paddingTop:4},
	coachGrid:{flexDirection:'row',flexWrap:'wrap',rowGap:28,columnGap:24},
	coachCard:{borderRadius:22,padding:isTablet?26:20,shadowOffset:{width:0,height:2},shadowOpacity:0.08,shadowRadius:10,elevation:2,width:(isTablet||isLargeScreen)?'30.5%':'100%',position:'relative',minHeight:isTablet?340:undefined},
	switchBadge:{position:'absolute',top:10,right:10,backgroundColor:'rgba(0,0,0,0.3)',paddingHorizontal:10,paddingVertical:4,borderRadius:12},
	switchBadgeText:{fontSize:isTablet?12:11,color:'white',fontWeight:'600'},
	cardHeader:{flexDirection:'column',alignItems:'flex-start',marginBottom:isTablet?18:14},
	cardContent:{flex:1},
	coachName:{fontSize:isTablet?22:18,marginBottom:isTablet?8:5},
	description:{fontSize:isTablet?15:13,opacity:0.73,marginBottom:isTablet?14:10,lineHeight:isTablet?20:18},
	specialtiesContainer:{flexDirection:'row',flexWrap:'wrap',gap:6},
	specialtyTag:{paddingHorizontal:10,paddingVertical:5,borderRadius:9},
	specialtyText:{fontSize:isTablet?14:12,opacity:0.8},
	actionButtons:{flexDirection:isTablet?'row':'column',gap:isTablet?14:10,marginTop:isTablet?14:12},
	actionButton:{flex:isTablet?1:undefined,paddingVertical:isTablet?12:10,paddingHorizontal:isTablet?18:15,borderRadius:16,alignItems:'center',minHeight:isTablet?48:42,justifyContent:'center'},
	actionButtonInactive:{backgroundColor: Colors[(useColorScheme()??'light')].tint},
	actionButtonActive:{backgroundColor:'rgba(255,255,255,0.18)',borderWidth:1,borderColor:'rgba(255,255,255,0.25)'},
	secondaryButton:{},
	actionButtonText:{fontSize:isTablet?16:14,fontWeight:'500',textAlign:'center'},
	actionButtonTextActive:{color:'#ffffff'},
	secondaryButtonText:{color:'#333'},
	transcriptSection:{maxHeight:170,paddingHorizontal:18,paddingVertical:14,borderTopWidth:1},
	transcriptTitle:{fontSize:15,fontWeight:'600',marginBottom:10,opacity:0.7},
	lastSwitchRow:{flexDirection:'row',alignItems:'flex-start',marginBottom:isTablet?8:6,gap:6},
	lastSwitchLabel:{fontSize:isTablet?13:11,fontWeight:'600'},
	lastSwitchText:{flex:1,fontSize:isTablet?13:11},
	miniTranscript:{maxHeight:isTablet?100:80},
	miniMessageRow:{marginBottom:isTablet?6:4},
	miniSender:{fontSize:isTablet?14:12,fontWeight:'600',marginBottom:2},
	miniUser:{color:'#2196F3'},
	miniAgent:{color:'#4CAF50'},
	miniMessage:{fontSize:isTablet?14:12,opacity:0.7,paddingLeft:isTablet?12:8},
});
