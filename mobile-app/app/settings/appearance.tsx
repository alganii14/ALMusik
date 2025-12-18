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

type Theme = "dark" | "light" | "system";

interface AppearanceSettings {
  theme: Theme;
  accentColor: string;
}

const themeOptions: { value: Theme; label: string; icon: string }[] = [
  { value: "dark", label: "Gelap", icon: "moon" },
  { value: "light", label: "Terang", icon: "sunny" },
  { value: "system", label: "Ikuti Sistem", icon: "phone-portrait" },
];

const accentColors = [
  { value: "#1DB954", label: "Hijau (Default)" },
  { value: "#1E90FF", label: "Biru" },
  { value: "#FF6B6B", label: "Merah" },
  { value: "#FFD93D", label: "Kuning" },
  { value: "#A855F7", label: "Ungu" },
  { value: "#F97316", label: "Oranye" },
];

export default function AppearanceScreen() {
  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: "dark",
    accentColor: "#1DB954",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("appearanceSettings");
      if (saved) setSettings(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const updateTheme = async (theme: Theme) => {
    const newSettings = { ...settings, theme };
    setSettings(newSettings);
    await AsyncStorage.setItem("appearanceSettings", JSON.stringify(newSettings));
  };

  const updateAccentColor = async (color: string) => {
    const newSettings = { ...settings, accentColor: color };
    setSettings(newSettings);
    await AsyncStorage.setItem("appearanceSettings", JSON.stringify(newSettings));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tampilan</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Theme Selection */}
        <Text style={styles.sectionTitle}>Tema</Text>
        <View style={styles.section}>
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.item,
                index !== themeOptions.length - 1 && styles.itemBorder,
              ]}
              onPress={() => updateTheme(option.value)}
            >
              <View style={styles.itemLeft}>
                <Ionicons name={option.icon as any} size={20} color={Colors.textSecondary} />
                <Text style={styles.itemTitle}>{option.label}</Text>
              </View>
              {settings.theme === option.value && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Accent Color */}
        <Text style={styles.sectionTitle}>Warna Aksen</Text>
        <View style={styles.colorGrid}>
          {accentColors.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={[
                styles.colorOption,
                settings.accentColor === color.value && styles.colorOptionSelected,
              ]}
              onPress={() => updateAccentColor(color.value)}
            >
              <View style={[styles.colorCircle, { backgroundColor: color.value }]}>
                {settings.accentColor === color.value && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.colorLabel}>{color.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.note}>
          Perubahan tema akan diterapkan setelah restart aplikasi.
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
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemTitle: { fontSize: 15, color: Colors.text, fontWeight: "500" },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  colorOption: {
    width: "30%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  colorLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  note: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
});
