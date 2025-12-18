import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import { AuthProvider } from "@/context/auth-context";
import { PlayerProvider } from "@/context/player-context";
import { Colors } from "@/constants/colors";

// Error Boundary untuk menangkap crash
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background, padding: 20 }}>
          <Text style={{ color: "#fff", fontSize: 18, marginBottom: 10 }}>Terjadi Kesalahan</Text>
          <Text style={{ color: "#999", fontSize: 14, textAlign: "center" }}>
            {this.state.error?.message || "Unknown error"}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlayerProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: "slide_from_right",
            }}
          />
        </PlayerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
