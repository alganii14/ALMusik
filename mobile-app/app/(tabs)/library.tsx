import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState<"playlists" | "liked">("playlists");

  const libraryItems = [
    { id: "liked", title: "Lagu yang Disukai", icon: "heart", count: 0, color: "#8B5CF6" },
    { id: "recent", title: "Baru Diputar", icon: "time", count: 0, color: Colors.primary },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={28} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "playlists" && styles.tabActive]}
          onPress={() => setActiveTab("playlists")}
        >
          <Text style={[styles.tabText, activeTab === "playlists" && styles.tabTextActive]}>
            Playlist
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "liked" && styles.tabActive]}
          onPress={() => setActiveTab("liked")}
        >
          <Text style={[styles.tabText, activeTab === "liked" && styles.tabTextActive]}>
            Disukai
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Library Items */}
        {libraryItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.libraryItem}>
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={24} color={Colors.text} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemCount}>{item.count} lagu</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Create Playlist */}
        <TouchableOpacity style={styles.createPlaylist}>
          <View style={styles.createIcon}>
            <Ionicons name="add" size={32} color={Colors.textMuted} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>Buat Playlist</Text>
            <Text style={styles.itemCount}>Kumpulkan lagu favoritmu</Text>
          </View>
        </TouchableOpacity>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes" size={64} color={Colors.surfaceLight} />
          <Text style={styles.emptyTitle}>Belum ada playlist</Text>
          <Text style={styles.emptySubtitle}>
            Buat playlist untuk menyimpan lagu favoritmu
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
  },
  addButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#000",
  },
  libraryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  itemCount: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  createPlaylist: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    marginTop: 8,
  },
  createIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: Colors.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
