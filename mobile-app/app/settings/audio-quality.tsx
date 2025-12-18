import { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/colors";

type Quality = "low" | "normal" | "high" | "very_high";

interface AudioSettings {
  streamingQuality: Quality;
  downloadQuality: Quality;
  normalizeVolume: boolean;
}

const qualityOptions: { value: Quality; label: string; description: string }[] = [
  { value: "low", label: "Rendah", description: "24 kbps - Hemat data" },
  { value: "normal", label: "Normal", description: "96 kbps - Kualitas standar" },
  { value: "high", label: "Tinggi", description: "160 kbps - Kualitas bagus" },
  { value: "very_high", label: "Sangat Tinggi", description: "320 kbps - Kualitas terbaik" },
];

export default function AudioQualityScreen() {
  const [settings, setSettings] = useState<AudioSettings>({
    streamingQuality: "high",
    downloadQuality: "very_high",
    normalizeVolume: true,
  });
  const [activeSection, setActiveSection] = useState<"streaming" | "download" | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("audioSettings");
      if (saved) setSettings(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const updateQuality = async (type: "streamingQuality" | "downloadQuality", value: Quality) => {
    const newSettings = { ...settings, [type]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem("audioSettings", JSON.stringify(newSettings));
    setActiveSection(null);
  };

  const getQualityLabel = (quality: Quality) => {
    return qualityOptions.find((q) => q.value === quality)?.label || quality;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kualitas Audio</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Streaming Quality */}
        <Text style={styles.sectionTitle}>Streaming</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => setActiveSection(activeSection === "streaming" ? null : "streaming")}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Kualitas Streaming</Text>
              <Text style={styles.itemValue}>{getQualityLabel(settings.streamingQuality)}</Text>
            </View>
            <Ionicons
              name={activeSection === "streaming" ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {activeSection === "streaming" && (
            <View style={styles.options}>
              {qualityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.option}
                  onPress={() => updateQuality("streamingQuality", option.value)}
                >
                  <View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  {settings.streamingQuality === option.value && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Download Quality */}
        <Text style={styles.sectionTitle}>Download</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => setActiveSection(activeSection === "download" ? null : "download")}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Kualitas Download</Text>
              <Text style={styles.itemValue}>{getQualityLabel(settings.downloadQuality)}</Text>
            </View>
            <Ionicons
              name={activeSection === "download" ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {activeSection === "download" && (
            <View style={styles.options}>
              {qualityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.option}
                  onPress={() => updateQuality("downloadQuality", option.value)}
                >
                  <View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  {settings.downloadQuality === option.value && (
                    <Ionicons name="checkmark" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.note}>
          Kualitas audio yang lebih tinggi menggunakan lebih banyak data dan penyimpanan.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
  section: { backgroundColor: Colors.surface, borderRadius: 12 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, color: Colors.text, fontWeight: "500" },
  itemValue: { fontSize: 13, color: Colors.primary, marginTop: 2 },
  options: { borderTopWidth: 1, borderTopColor: Colors.border },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionLabel: { fontSize: 15, color: Colors.text },
  optionDescription: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  note: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 16,
  },
});
