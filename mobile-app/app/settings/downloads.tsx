import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/colors";

interface DownloadSettings {
  wifiOnly: boolean;
  autoDownload: boolean;
  deleteAfterListen: boolean;
}

export default function DownloadsScreen() {
  const [settings, setSettings] = useState<DownloadSettings>({
    wifiOnly: true,
    autoDownload: false,
    deleteAfterListen: false,
  });
  const [storageUsed, setStorageUsed] = useState("0 MB");

  useEffect(() => {
    loadSettings();
    calculateStorage();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("downloadSettings");
      if (saved) setSettings(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const calculateStorage = async () => {
    // Simulate storage calculation
    setStorageUsed("0 MB");
  };

  const updateSetting = async (key: keyof DownloadSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem("downloadSettings", JSON.stringify(newSettings));
  };

  const handleClearDownloads = () => {
    Alert.alert(
      "Hapus Semua Download",
      "Yakin ingin menghapus semua lagu yang sudah didownload?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("downloadedSongs");
            setStorageUsed("0 MB");
            Alert.alert("Berhasil", "Semua download telah dihapus");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Download</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Storage Info */}
        <View style={styles.storageCard}>
          <Ionicons name="folder" size={32} color={Colors.primary} />
          <View style={styles.storageInfo}>
            <Text style={styles.storageTitle}>Penyimpanan Digunakan</Text>
            <Text style={styles.storageValue}>{storageUsed}</Text>
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearDownloads}>
            <Text style={styles.clearButtonText}>Hapus</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <Text style={styles.sectionTitle}>Pengaturan Download</Text>
        <View style={styles.section}>
          <View style={[styles.item, styles.itemBorder]}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Download Hanya WiFi</Text>
              <Text style={styles.itemDescription}>
                Hanya download saat terhubung ke WiFi
              </Text>
            </View>
            <Switch
              value={settings.wifiOnly}
              onValueChange={(v) => updateSetting("wifiOnly", v)}
              trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={[styles.item, styles.itemBorder]}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Download Otomatis</Text>
              <Text style={styles.itemDescription}>
                Download lagu yang sering diputar secara otomatis
              </Text>
            </View>
            <Switch
              value={settings.autoDownload}
              onValueChange={(v) => updateSetting("autoDownload", v)}
              trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Hapus Setelah Didengar</Text>
              <Text style={styles.itemDescription}>
                Hapus download setelah 30 hari tidak diputar
              </Text>
            </View>
            <Switch
              value={settings.deleteAfterListen}
              onValueChange={(v) => updateSetting("deleteAfterListen", v)}
              trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        <Text style={styles.note}>
          Lagu yang didownload dapat diputar secara offline tanpa koneksi internet.
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
  storageCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 16,
  },
  storageInfo: { flex: 1 },
  storageTitle: { fontSize: 14, color: Colors.textSecondary },
  storageValue: { fontSize: 20, fontWeight: "bold", color: Colors.text, marginTop: 4 },
  clearButton: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: { color: Colors.text, fontSize: 14, fontWeight: "600" },
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
