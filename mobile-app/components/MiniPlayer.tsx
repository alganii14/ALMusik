import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "@/context/player-context";
import { Colors } from "@/constants/colors";

export default function MiniPlayer() {
  const { currentTrack, isPlaying, isLoading, togglePlay, position, duration } = usePlayer();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${progress}%` }]} />
      </View>

      <View style={styles.content}>
        {/* Track Info */}
        <TouchableOpacity style={styles.trackInfo}>
          <Image
            source={{ uri: currentTrack.thumbnail }}
            style={styles.thumbnail}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {isLoading ? "Memuat..." : currentTrack.artist}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="heart-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playButton} onPress={togglePlay} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={24}
                color="#000"
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  progressBar: {
    height: 2,
    backgroundColor: Colors.surfaceLight,
  },
  progress: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trackInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.text,
    justifyContent: "center",
    alignItems: "center",
  },
});
