import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/colors";

interface NotificationSettings {
  newMusic: boolean;
  recommendations: boolean;
  updates: boolean;
  marketing: boolean;
}

export default function NotificationsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    newMusic: true,
    recommendations: true,
    updates: true,
    marketing: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("notificationSettings");
      if (saved) setSettings(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem("notificationSettings", JSON.stringify(newSettings));
  };

  const notificationItems = [
    {
      key: "newMusic" as const,
      title: "Musik Baru",
      description: "Notifikasi saat artis favoritmu merilis musik baru",
    },
    {
      key: "recommendations" as const,
      title: "Rekomendasi",
      description: "Rekomendasi musik berdasarkan selera kamu",
    },
    {
      key: "updates" as const,
      title: "Update Aplikasi",
      description: "Pemberitahuan fitur dan update terbaru",
    },
    {
      key: "marketing" as const,
      title: "Promosi",
      description: "Penawaran dan promosi khusus",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          {notificationItems.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.item,
                index !== notificationItems.length - 1 && styles.itemBorder,
              ]}
            >
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <Switch
                value={settings[item.key]}
                onValueChange={(value) => updateSetting(item.key, value)}
                trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
                thumbColor={Colors.text}
              />
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Kamu dapat mengubah pengaturan notifikasi kapan saja dari pengaturan perangkat.
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
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginTop: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemInfo: { flex: 1, marginRight: 16 },
  itemTitle: { fontSize: 15, color: Colors.text, fontWeight: "500" },
  itemDescription: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  note: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 16,
  },
});
