import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function AgentWidget({ agentId }: { agentId: string }) {
  const html = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    html,body { margin:0; padding:0; background:transparent; }
  </style>
</head>
<body>
  <!-- ElevenLabs Convai Widget -->
  <elevenlabs-convai
    agent-id="${agentId}"
    position="bottom-right"
    accent-color="#0a7ea4"
    z-index="9999"
  ></elevenlabs-convai>
  <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async></script>
</body>
</html>`;

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        source={{ html }}
        originWhitelist={["*"]}
        javaScriptEnabled
        // let audio autoplay after user taps widget
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        // show the widget: give the WebView some height; it floats inside it
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 180, backgroundColor: "transparent" }}
        // helpful for debugging load problems:
        onError={(e) => console.log("Widget error", e.nativeEvent)}
        onHttpError={(e) => console.log("Widget http error", e.nativeEvent)}
      />
    </View>
  );
}
