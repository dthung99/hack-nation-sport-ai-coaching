import React from "react";
import { Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

export default function AgentWidget({
  visible,
  onClose,
  agentId,
}: {
  visible: boolean;
  onClose: () => void;
  agentId: string;
}) {
  const html = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    html,body,#root { height:100%; margin:0; background:transparent; }
  </style>
</head>
<body>
  <div id="root">
    <elevenlabs-convai
      agent-id="${agentId}"
      position="bottom-right"
      accent-color="#0a7ea4">
    </elevenlabs-convai>
  </div>
  <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async></script>
</body>
</html>`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>Close</Text>
          </TouchableOpacity>
        </View>

        <WebView
          source={{ html }}
          originWhitelist={["*"]}
          javaScriptEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          style={StyleSheet.absoluteFill}
          onError={(e) => console.log("Widget error", e.nativeEvent)}
          onHttpError={(e) => console.log("Widget http error", e.nativeEvent)}
          scrollEnabled
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { height: 48, alignItems: "flex-end", justifyContent: "center", paddingHorizontal: 16 },
  closeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: "#eee" },
  closeTxt: { fontWeight: "600" },
});
